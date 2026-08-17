import { GoogleGenAI, Modality } from '@google/genai';
import type { AssistantState } from '../types';
import { RK_SYSTEM_INSTRUCTION } from './persona';
import { toGeminiFunctionDeclarations, runTool } from './tools';
import { AudioStreamer } from './audioStreamer';

const MODEL = 'gemini-3.1-flash-live-preview';

interface LiveSessionCallbacks {
  onStateChange: (state: AssistantState) => void;
  onError?: (message: string) => void;
}

export class LiveSession {
  private ai: GoogleGenAI;
  private session: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null =
    null;
  private streamer = new AudioStreamer();
  private callbacks: LiveSessionCallbacks;
  private state: AssistantState = 'disconnected';

  constructor(apiKey: string, callbacks: LiveSessionCallbacks) {
    this.ai = new GoogleGenAI({ apiKey });
    this.callbacks = callbacks;

    this.streamer.onChunk = (base64Pcm) => {
      if (this.state === 'listening' || this.state === 'idle') {
        this.session?.sendRealtimeInput({
          audio: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' },
        });
      }
    };
    this.streamer.onPlaybackStart = () => this.setState('speaking');
    this.streamer.onPlaybackEnd = () => this.setState('listening');
  }

  private setState(state: AssistantState) {
    this.state = state;
    this.callbacks.onStateChange(state);
  }

  async connect() {
    this.setState('connecting');
    try {
      this.session = await this.ai.live.connect({
        model: MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: RK_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: toGeminiFunctionDeclarations() }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
        callbacks: {
          onopen: async () => {
            await this.streamer.startMic();
            this.setState('listening');
          },
          onmessage: (message) => this.handleMessage(message),
          onerror: (e) => {
            this.callbacks.onError?.(e.message ?? 'Connection error');
            this.setState('error');
          },
          onclose: () => {
            this.streamer.stopMic();
            this.setState('disconnected');
          },
        },
      });
    } catch (e) {
      this.callbacks.onError?.((e as Error).message);
      this.setState('error');
    }
  }

  private async handleMessage(message: any) {
    const audioPart =
      message?.serverContent?.modelTurn?.parts?.find(
        (p: any) => p.inlineData?.mimeType?.startsWith('audio/')
      );
    if (audioPart) {
      this.streamer.playChunk(audioPart.inlineData.data);
    }

    if (message?.serverContent?.interrupted) {
      this.streamer.interruptPlayback();
    }

    if (message?.toolCall?.functionCalls?.length) {
      for (const call of message.toolCall.functionCalls) {
        const result = await runTool(call.name, call.args ?? {});
        this.session?.sendToolResponse({
          functionResponses: [
            { id: call.id, name: call.name, response: { result } },
          ],
        });
      }
    }
  }

  disconnect() {
    this.session?.close();
    this.streamer.stopMic();
    this.streamer.interruptPlayback();
    this.setState('disconnected');
  }
}

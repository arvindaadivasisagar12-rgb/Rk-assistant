import { AudioStreamer } from './AudioStreamer';

export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export class LiveSession {
  private ws: WebSocket | null = null;
  private streamer: AudioStreamer;
  private apiKey: string;
  public onStateChange?: (state: SessionState) => void;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.streamer = new AudioStreamer();
  }

  async connect() {
    this.onStateChange?.('connecting');
    const host = 'generativelanguage.googleapis.com';
    const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

    this.ws = new WebSocket(uri);

    this.ws.onopen = () => {
      this.sendInitialConfig();
      this.startMicStream();
      this.onStateChange?.('listening');
    };

    this.ws.onmessage = async (event) => {
      let data;
      if (event.data instanceof Blob) {
        const text = await event.data.text();
        data = JSON.parse(text);
      } else {
        data = JSON.parse(event.data);
      }
      this.handleServerMessage(data);
    };

    this.ws.onclose = () => {
      this.onStateChange?.('disconnected');
      this.streamer.stopRecording();
    };
  }

  private sendInitialConfig() {
    const setupMessage = {
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
        },
        systemInstruction: {
          parts: [{ text: "You are RK Assistant, a young, confident, witty, and sassy female AI assistant. Tone: Flirty, playful, slightly teasing. Respond strictly via continuous live speech audio. Avoid text." }],
        },
        tools: [{ functionDeclarations: [{ name: 'openWebsite', description: 'Open URL', parameters: { type: 'OBJECT', properties: { url: { type: 'STRING' } }, required: ['url'] } }] }],
      },
    };
    this.ws?.send(JSON.stringify(setupMessage));
  }

  private startMicStream() {
    this.streamer.startRecording((base64Audio) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Audio }] } }));
      }
    });
  }

  private handleServerMessage(data: any) {
    if (data.serverContent?.modelTurn?.parts) {
      for (const part of data.serverContent.modelTurn.parts) {
        if (part.inlineData?.data) {
          this.onStateChange?.('speaking');
          this.streamer.playAudioChunk(part.inlineData.data);
        }
      }
    }
    if (data.serverContent?.turnComplete) this.onStateChange?.('listening');
  }

  disconnect() {
    this.streamer.stopRecording();
    this.ws?.close();
  }
        }

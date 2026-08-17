import { GoogleGenAI } from '@google/genai';
import { RK_SYSTEM_INSTRUCTION } from './systemPrompt';

export class LiveSession {
  private client: any;
  private session: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async connect(onAudioReceive: (base64: string) => void, onStateChange: (state: string) => void) {
    onStateChange('connecting');

    const tools = [{
      functionDeclarations: [
        {
          name: 'openWebsite',
          description: 'Opens any website or media library URL in browser.',
          parameters: {
            type: 'OBJECT',
            properties: {
              url: { type: 'STRING', description: 'Target URL' }
            },
            required: ['url']
          }
        }
      ]
    }];

    this.session = await this.client.models.createLiveSession({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }
          }
        },
        systemInstruction: { parts: [{ text: RK_SYSTEM_INSTRUCTION }] },
        tools: tools
      }
    });

    onStateChange('listening');

    this.session.on('audio', (data: any) => {
      onStateChange('speaking');
      onAudioReceive(data.data);
    });

    this.session.on('toolCall', async (toolCall: any) => {
      for (const call of toolCall.functionCalls) {
        if (call.name === 'openWebsite') {
          window.open(call.args.url, '_blank');
          await this.session.sendToolResponse({
            functionResponses: [{
              response: { output: `Website ${call.args.url} opened successfully.` },
              id: call.id
            }]
          });
        }
      }
      onStateChange('listening');
    });
  }

  sendAudioChunk(base64Pcm16: string) {
    if (this.session) {
      this.session.sendRealtimeInput([{
        mimeType: 'audio/pcm;rate=16000',
        data: base64Pcm16
      }]);
    }
  }

  disconnect() {
    if (this.session) this.session.close();
  }
}

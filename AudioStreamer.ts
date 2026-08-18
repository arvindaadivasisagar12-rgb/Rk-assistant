export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private scheduledTime = 0;

  async startRecording(onAudioData: (base64Audio: string) => void) {
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const source = this.audioCtx.createMediaStreamSource(this.micStream);
    this.scriptNode = this.audioCtx.createScriptProcessor(2048, 1, 1);

    this.scriptNode.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = this.convertFloat32ToPCM16(inputData);
      const base64 = this.arrayBufferToBase64(pcm16.buffer as ArrayBuffer);
      onAudioData(base64);
    };

    source.connect(this.scriptNode);
    this.scriptNode.connect(this.audioCtx.destination);
  }

  stopRecording() {
    this.scriptNode?.disconnect();
    this.micStream?.getTracks().forEach((track) => track.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }

  playAudioChunk(base64Pcm24k: string) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const pcmData = this.base64ToFloat32(base64Pcm24k);
    const buffer = this.audioCtx.createBuffer(1, pcmData.length, 24000);
    buffer.getChannelData(0).set(pcmData);

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    const currentTime = this.audioCtx.currentTime;
    if (this.scheduledTime < currentTime) {
      this.scheduledTime = currentTime;
    }

    source.start(this.scheduledTime);
    this.scheduledTime += buffer.duration;
  }

  stopPlayback() {
    this.scheduledTime = 0;
  }

  private convertFloat32ToPCM16(float32Array: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm16;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToFloat32(base64: string): Float32Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  }
}

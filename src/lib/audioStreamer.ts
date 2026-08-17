const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export class AudioStreamer {
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  private playbackQueueTime = 0;
  private activeSources = new Set<AudioBufferSourceNode>();

  onChunk: ((base64Pcm: string) => void) | null = null;
  onPlaybackStart: (() => void) | null = null;
  onPlaybackEnd: (() => void) | null = null;

  async startMic() {
    this.inputCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.sourceNode = this.inputCtx.createMediaStreamSource(this.micStream);
    this.processor = this.inputCtx.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm = floatTo16BitPCM(input);
      this.onChunk?.(arrayBufferToBase64(pcm));
    };

    this.sourceNode.connect(this.processor);
    this.processor.connect(this.inputCtx.destination);
  }

  stopMic() {
    this.processor?.disconnect();
    this.sourceNode?.disconnect();
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.inputCtx?.close();
    this.processor = null;
    this.sourceNode = null;
    this.micStream = null;
    this.inputCtx = null;
  }

  playChunk(base64Pcm: string) {
    if (!this.outputCtx) {
      this.outputCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      this.playbackQueueTime = this.outputCtx.currentTime;
    }
    const arrayBuffer = base64ToArrayBuffer(base64Pcm);
    const int16 = new Int16Array(arrayBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;

    const audioBuffer = this.outputCtx.createBuffer(
      1,
      float32.length,
      OUTPUT_SAMPLE_RATE
    );
    audioBuffer.copyToChannel(float32, 0);

    const source = this.outputCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputCtx.destination);

    const startAt = Math.max(this.playbackQueueTime, this.outputCtx.currentTime);
    source.start(startAt);
    this.playbackQueueTime = startAt + audioBuffer.duration;

    this.activeSources.add(source);
    if (this.activeSources.size === 1) this.onPlaybackStart?.();

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0) this.onPlaybackEnd?.();
    };
  }

  interruptPlayback() {
    this.activeSources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    this.activeSources.clear();
    if (this.outputCtx) this.playbackQueueTime = this.outputCtx.currentTime;
    this.onPlaybackEnd?.();
  }
                           }

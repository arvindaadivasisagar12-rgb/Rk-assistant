import { useState } from 'react';
import { AudioStreamer } from './services/audioStreamer';
import { LiveSession } from './services/liveSession';
import { Visualizer } from './components/Visualizer';
import { MicButton } from './components/MicButton';

type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export default function App() {
  const [state, setState] = useState<SessionState>('disconnected');
  const [session, setSession] = useState<LiveSession | null>(null);
  const [streamer, setStreamer] = useState<AudioStreamer | null>(null);

  const toggleSession = async () => {
    if (state !== 'disconnected') {
      streamer?.stop();
      session?.disconnect();
      setState('disconnected');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert('.env file me VITE_GEMINI_API_KEY set karein!');
      return;
    }

    const audioStreamer = new AudioStreamer();
    const live = new LiveSession(apiKey);

    await live.connect(
      (audioData) => audioStreamer.playAudioChunk(audioData),
      (newState) => setState(newState as SessionState)
    );

    await audioStreamer.startRecording((pcmBase64) => {
      live.sendAudioChunk(pcmBase64);
    });

    setStreamer(audioStreamer);
    setSession(live);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col justify-between items-center p-6 select-none">
      <div className="w-full flex justify-between items-center pt-2">
        <h1 className="text-xl font-black tracking-widest text-red-600">RK ASSISTANT</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-green-400 capitalize">
          ● {state}
        </span>
      </div>

      <div className="relative flex items-center justify-center my-auto">
        <Visualizer state={state} />
        <MicButton state={state} onClick={toggleSession} />
      </div>

      <div className="w-full text-center pb-4">
        <p className="text-neutral-500 text-xs font-medium tracking-wide">
          {state === 'listening' && "RK sun rahi hai... Bolo kya kehna hai?"}
          {state === 'speaking' && "RK bol rahi hai..."}
          {state === 'connecting' && "RK se connect ho raha hai..."}
          {state === 'disconnected' && "Mic icon par tap karke RK se baat karein"}
        </p>
      </div>
    </div>
  );
}

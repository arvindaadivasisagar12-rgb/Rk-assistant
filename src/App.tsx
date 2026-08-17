import MicButton from './components/MicButton';
import StatusLine from './components/StatusLine';
import Waveform from './components/Waveform';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export default function App() {
  const { state, errorMessage, toggle } = useVoiceAssistant(API_KEY);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-void flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-electric/20 blur-[100px] animate-floatSlow" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-electric2/10 blur-[100px]" />
      </div>

      <header className="relative z-10 px-6 pt-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist">Voice Assistant</p>
          <h1 className="font-display text-3xl text-white">RK</h1>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${
            state === 'listening' || state === 'speaking'
              ? 'bg-electric shadow-glow'
              : state === 'error'
              ? 'bg-signal'
              : 'bg-mist/40'
          }`}
        />
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <MicButton state={state} onPress={toggle} />
        <Waveform state={state} />
        <StatusLine state={state} />

        {errorMessage && (
          <p className="max-w-xs text-center text-sm text-signal/90 bg-signal/10 border border-signal/30 rounded-xl px-4 py-2">
            {errorMessage}
          </p>
        )}
      </main>

      <footer className="relative z-10 pb-8 flex justify-center">
        <p className="text-[11px] text-mist/60 tracking-wide">
          "Boss" bolke command dijiye — RK sirf jitna kaha jaaye utna hi karegi.
        </p>
      </footer>
    </div>
  );
}

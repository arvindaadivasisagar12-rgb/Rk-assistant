import { useMemo } from 'react';
import type { AssistantState } from '../types';

const BAR_COUNT = 5;

export default function Waveform({ state }: { state: AssistantState }) {
  const isActive = state === 'listening' || state === 'speaking';

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => ({
        delay: `${i * 0.12}s`,
        base: 10 + Math.abs(i - Math.floor(BAR_COUNT / 2)) * -2,
      })),
    []
  );

  return (
    <div className="flex items-end justify-center gap-1.5 h-8" aria-hidden>
      {bars.map((bar, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full ${
            state === 'speaking'
              ? 'bg-electric2'
              : state === 'listening'
              ? 'bg-electric'
              : 'bg-mist/40'
          }`}
          style={{
            height: `${bar.base + 6}px`,
            animation: isActive
              ? `bar-bounce 0.9s ease-in-out ${bar.delay} infinite`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes bar-bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.8); }
        }
      `}</style>
    </div>
  );
}

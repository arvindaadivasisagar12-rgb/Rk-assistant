import type { AssistantState } from '../types';

const STATE_RING: Record<AssistantState, string> = {
  disconnected: 'from-mist/20 to-transparent',
  connecting: 'from-electric/40 to-transparent',
  idle: 'from-electric/30 to-transparent',
  listening: 'from-electric to-signal',
  speaking: 'from-electric2 to-electric',
  error: 'from-signal/60 to-transparent',
};

export default function MicButton({
  state,
  onPress,
}: {
  state: AssistantState;
  onPress: () => void;
}) {
  const isLive = state === 'listening' || state === 'speaking';

  return (
    <div className="relative flex items-center justify-center">
      {isLive && (
        <>
          <span className="absolute h-40 w-40 rounded-full border border-electric/40 animate-pulseRing" />
          <span
            className="absolute h-40 w-40 rounded-full border border-electric2/30 animate-pulseRing"
            style={{ animationDelay: '0.6s' }}
          />
        </>
      )}

      <button
        onClick={onPress}
        aria-label={isLive ? 'RK se baat rok dijiye' : 'RK ko bulaiye'}
        className={`relative h-32 w-32 rounded-full bg-gradient-to-br ${STATE_RING[state]}
          shadow-glow flex items-center justify-center
          transition-transform duration-300 active:scale-95
          ring-1 ring-white/10 backdrop-blur-xl`}
      >
        <div className="h-[92px] w-[92px] rounded-full bg-ink/90 flex items-center justify-center">
          <MicIcon state={state} />
        </div>
      </button>
    </div>
  );
}

function MicIcon({ state }: { state: AssistantState }) {
  const color =
    state === 'speaking'
      ? '#5EE8FF'
      : state === 'listening'
      ? '#B14CFF'
      : state === 'connecting'
      ? '#B14CFF'
      : state === 'error'
      ? '#FF3D8A'
      : '#8E88A8';

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M19 11a7 7 0 01-14 0M12 18v3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

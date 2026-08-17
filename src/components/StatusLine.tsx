import type { AssistantState } from '../types';

const COPY: Record<AssistantState, string> = {
  disconnected: 'Tap karke bulao — main ready hoon.',
  connecting: 'Connect ho rahi hoon...',
  idle: 'Bolo Boss, sun rahi hoon.',
  listening: 'Sun rahi hoon...',
  speaking: 'Bol rahi hoon...',
  error: 'Kuch gadbad ho gayi — dobara try karo.',
};

export default function StatusLine({ state }: { state: AssistantState }) {
  return (
    <p className="font-body text-sm tracking-wide text-mist">{COPY[state]}</p>
  );
}

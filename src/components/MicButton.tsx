import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  state: 'disconnected' | 'connecting' | 'listening' | 'speaking';
  onClick: () => void;
}

export const MicButton: React.FC<MicButtonProps> = ({ state, onClick }) => {
  const isConnected = state !== 'disconnected';

  return (
    <button
      onClick={onClick}
      className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-2 shadow-2xl active:scale-95 ${
        isConnected
          ? 'bg-neutral-900 border-red-500 text-red-500 shadow-red-900/50 scale-105'
          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
      }`}
    >
      {isConnected ? <Mic className="w-12 h-12 mb-2 animate-pulse" /> : <MicOff className="w-12 h-12 mb-2" />}
      <span className="text-xs font-bold tracking-widest uppercase">
        {isConnected ? 'TAP TO STOP' : 'TAP TO START'}
      </span>
    </button>
  );
};

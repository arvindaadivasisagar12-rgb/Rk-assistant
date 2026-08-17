import React from 'react';

interface VisualizerProps {
  state: 'disconnected' | 'connecting' | 'listening' | 'speaking';
}

export const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`absolute w-72 h-72 rounded-full transition-all duration-700 blur-3xl ${
          state === 'speaking'
            ? 'bg-red-600 opacity-60 scale-125'
            : state === 'listening'
            ? 'bg-pink-600 opacity-40 animate-pulse'
            : state === 'connecting'
            ? 'bg-yellow-500 opacity-30 animate-ping'
            : 'bg-neutral-900 opacity-10'
        }`}
      />
    </div>
  );
};

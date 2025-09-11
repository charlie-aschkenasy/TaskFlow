import React from 'react';
import { StickyNote } from 'lucide-react';

interface FloatingScratchpadButtonProps {
  onClick: () => void;
}

export function FloatingScratchpadButton({ onClick }: FloatingScratchpadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      title="Open Scratchpad"
    >
      <StickyNote size={24} className="group-hover:scale-110 transition-transform" />
      
      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-20"></div>
    </button>
  );
}
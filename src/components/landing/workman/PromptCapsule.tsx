import React from 'react';

interface PromptCapsuleProps {
  label: string;
  onClick: (label: string) => void;
}

export const PromptCapsule: React.FC<PromptCapsuleProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={() => onClick(label)}
      className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 text-sm md:text-base text-gray-200 backdrop-blur-md cursor-pointer whitespace-nowrap shadow-lg shadow-black/10"
    >
      {label}
    </button>
  );
};

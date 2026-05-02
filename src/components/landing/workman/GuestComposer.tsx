import React, { useState } from 'react';

interface GuestComposerProps {
  onSend: (message: string) => void;
  isThinking: boolean;
  isLimitReached: boolean;
}

export const GuestComposer: React.FC<GuestComposerProps> = ({ onSend, isThinking, isLimitReached }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isThinking && !isLimitReached) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 flex-shrink-0">
      <form onSubmit={handleSubmit} className="relative group shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all rounded-full border border-white/10 bg-black/40 backdrop-blur-xl focus-within:border-white/30">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isThinking || isLimitReached}
          placeholder={
            isLimitReached 
              ? 'Preview limit reached' 
              : isThinking 
                ? 'Workman is thinking...' 
                : 'Send a message...'
          }
          className="w-full bg-transparent rounded-full py-4 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 transition-all font-light tracking-wide"
        />
        <button
          type="submit"
          disabled={!text.trim() || isThinking || isLimitReached}
          className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-md group-focus-within:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};

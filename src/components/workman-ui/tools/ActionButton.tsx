"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export interface UIActionButtonArgs {
  intent: string;
  label: string;
}

const ACTION_MAP: Record<string, string> = {
  'NAVIGATE_SIGNUP': '/auth/signup',
  'NAVIGATE_PRICING': '/billing',
};

export const ActionButton: React.FC<{ args: UIActionButtonArgs }> = ({ args }) => {
  const router = useRouter();
  const href = ACTION_MAP[args.intent] || '#';

  const handleClick = () => {
    if (href !== '#') {
      router.push(href);
    }
  };

  return (
    <div className="flex w-full justify-center my-4 animate-fade-in-up">
      <button 
        onClick={handleClick}
        className="w-full max-w-sm py-4 px-8 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
      >
        {args.label}
      </button>
    </div>
  );
};

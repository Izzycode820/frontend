'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ONBOARDING_CONTENT } from './onboarding-content';

interface OnboardingHeroProps {
  steps: Array<{
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'LOCKED';
  }>;
  onAction: (prompt: string) => void;
}

const STORAGE_KEY = 'workman_onboarding_last_slide';

export function OnboardingHero({ steps, onAction }: OnboardingHeroProps) {
  const t = useTranslations();
  
  // Persist current slide index in localStorage
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentIndex.toString());
  }, [currentIndex]);

  const next = () => setCurrentIndex(prev => Math.min(prev + 1, steps.length - 1));
  const prev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  const safeIndex = Math.min(currentIndex, Math.max(steps.length - 1, 0));
  const currentStep = steps[safeIndex];

  // Guard: steps not yet loaded
  if (!currentStep) return null;

  const content = ONBOARDING_CONTENT[currentStep.id];

  // Guard: step id not in content map yet
  if (!content) return null;

  const isCompleted = currentStep.status === 'COMPLETED';

  const title = t(isCompleted ? content.completed.titleKey : content.pending.titleKey);
  const description = t(isCompleted ? content.completed.descriptionKey : content.pending.descriptionKey);
  const actionLabel = t(isCompleted ? content.completed.actionKey : content.pending.actionKey);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 md:px-0">
      {/* Progress Dots */}
      <div className="flex gap-3 mb-12">
        {steps.map((step, idx) => (
          <div 
            key={step.id}
            className={cn(
              "size-2 rounded-full transition-all duration-500",
              step.status === 'COMPLETED' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-zinc-800",
              idx === currentIndex && "scale-125 ring-4 ring-white/5"
            )}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4">
          <h1 className="shiny-text text-3xl md:text-4xl font-medium tracking-tight text-white/90">
            {title}
          </h1>
          <p className="text-zinc-500 text-lg font-light leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button 
            onClick={() => !isCompleted && content.pending.aiPrompt && onAction(content.pending.aiPrompt)}
            className={cn(
               "px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300",
               isCompleted 
                 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                 : "bg-white text-black hover:scale-105 active:scale-95"
            )}
          >
            {isCompleted ? (
              <span className="flex items-center gap-2">
                <Check className="size-4" /> {actionLabel}
              </span>
            ) : actionLabel}
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-32 left-0 right-0 px-8 flex justify-between items-center max-w-5xl mx-auto opacity-20 hover:opacity-100 transition-opacity">
        <button 
          onClick={prev} 
          disabled={currentIndex === 0}
          className="p-4 rounded-full bg-zinc-900/50 border border-white/5 disabled:opacity-0 transition-all hover:bg-zinc-800"
        >
          <ChevronLeft className="size-6 text-white" />
        </button>
        <button 
          onClick={next} 
          disabled={currentIndex === steps.length - 1}
          className="p-4 rounded-full bg-zinc-900/50 border border-white/5 disabled:opacity-0 transition-all hover:bg-zinc-800"
        >
          <ChevronRight className="size-6 text-white" />
        </button>
      </div>

      <style jsx>{`
        .shiny-text {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 25%,
            rgba(255, 255, 255, 0.95) 50%,
            rgba(255, 255, 255, 0) 75%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shiny 2.5s infinite linear;
          text-shadow: 0 0 20px rgba(255,255,255,0.1);
        }

        @keyframes shiny {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

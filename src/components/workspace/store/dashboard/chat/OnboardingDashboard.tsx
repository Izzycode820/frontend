'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Check, Circle, ArrowRight, Package, Truck, Palette, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ONBOARDING_CONTENT } from './onboarding-content';

interface OnboardingDashboardProps {
  steps: Array<{
    id: string;
    status: 'PENDING' | 'COMPLETED' | 'LOCKED';
  }>;
  onStartStep: (prompt: string) => void;
  onNavigateToChat: () => void;
}

export function OnboardingDashboard({ steps, onStartStep, onNavigateToChat }: OnboardingDashboardProps) {
  const t = useTranslations();

  const completedCount = steps.filter(s => s.status === 'COMPLETED').length;
  const progressPercent = (completedCount / steps.length) * 100;

  const getIcon = (id: string) => {
    switch (id) {
      case 'PRODUCT_CREATION': return <Package className="size-5" />;
      case 'SHIPPING_SETUP': return <Truck className="size-5" />;
      case 'THEME_SELECTION': return <Palette className="size-5" />;
      case 'SUBSCRIPTION': return <CreditCard className="size-5" />;
      default: return <Package className="size-5" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full pt-12 pb-20 px-6 overflow-y-auto scrollbar-none animate-in fade-in duration-700">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 size-48 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
        
        <div className="relative z-10 space-y-10">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="shiny-text text-2xl md:text-3xl font-medium tracking-tight text-white/90">
                Setup your store
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {completedCount} of {steps.length} completed
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step) => {
              const content = ONBOARDING_CONTENT[step.id];
              if (!content) return null;

              const isCompleted = step.status === 'COMPLETED';
              const isLocked = step.status === 'LOCKED';
              
              const title = t(isCompleted ? content.completed.titleKey : content.pending.titleKey);
              const description = t(isCompleted ? content.completed.descriptionKey : content.pending.descriptionKey);
              const actionLabel = t(isCompleted ? content.completed.actionKey : content.pending.actionKey);

              return (
                <div 
                  key={step.id}
                  className={cn(
                    "flex gap-6 p-6 rounded-3xl transition-all duration-300 border",
                    isCompleted 
                      ? "bg-emerald-500/[0.02] border-emerald-500/10 opacity-70" 
                      : isLocked
                        ? "bg-zinc-950/20 border-white/5 opacity-40 grayscale"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  )}
                >
                  {/* Status indicator */}
                  <div className="shrink-0 pt-1">
                    {isCompleted ? (
                      <div className="size-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <Check className="size-4" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className={cn(
                        "size-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        isLocked ? "border-zinc-800" : "border-zinc-700 group-hover:border-zinc-100"
                      )}>
                        <div className={cn(
                          "size-1.5 rounded-full",
                          isLocked ? "bg-zinc-800" : "bg-indigo-500 animate-pulse"
                        )} />
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <h3 className={cn(
                        "text-[17px] font-medium tracking-tight transition-colors",
                        isCompleted ? "text-emerald-400" : "text-white/90"
                      )}>
                        {title}
                      </h3>
                      <p className="text-zinc-500 text-[14px] leading-relaxed font-light line-clamp-2">
                        {description}
                      </p>
                    </div>

                    {!isCompleted && !isLocked && (
                      <button 
                        onClick={() => content.pending.aiPrompt && onStartStep(content.pending.aiPrompt)}
                        className="group/btn flex items-center gap-2 text-[13px] font-semibold text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all active:scale-95"
                      >
                        {actionLabel}
                        <ArrowRight className="size-3 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    )}
                    
                    {isCompleted && (
                       <div className="text-[12px] font-medium text-emerald-500/80 flex items-center gap-1.5">
                          <Check className="size-3" /> Ready for sale
                       </div>
                    )}
                  </div>

                  {/* Decorative Icon */}
                  <div className={cn(
                    "hidden md:flex shrink-0 size-12 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 text-zinc-600 transition-all",
                    !isCompleted && !isLocked && "text-zinc-400 group-hover:scale-110"
                  )}>
                    {getIcon(step.id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Glossy Overlay effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.01] to-transparent opacity-50" />
      </div>
      
      {/* Help footer */}
      <div className="mt-8 flex items-center gap-4 text-zinc-600 text-xs font-medium tracking-wide uppercase">
          <span>Need help?</span>
          <button 
            onClick={onNavigateToChat}
            className="text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
          >
            Chat with Workman
          </button>
      </div>

       <style jsx>{`
        .shiny-text {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(255, 255, 255, 0) 70%
          );
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shiny 3s infinite linear;
        }

        @keyframes shiny {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

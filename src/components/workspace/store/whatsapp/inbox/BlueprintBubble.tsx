'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface BlueprintBubbleProps {
  steps: string[];
  isAiThinking?: boolean;
}

type ViewState = 'circle' | 'capsule' | 'full';

export function BlueprintBubble({ steps, isAiThinking }: BlueprintBubbleProps) {
  const [viewState, setViewState] = React.useState<ViewState>('circle');
  const lastStepsCount = React.useRef(steps.length);

  // Auto-expand to capsule when new steps arrive or AI starts thinking
  React.useEffect(() => {
    if (isAiThinking || steps.length > lastStepsCount.current) {
      if (viewState === 'circle') {
        setViewState('capsule');
      }
    }
    lastStepsCount.current = steps.length;
  }, [isAiThinking, steps.length, viewState]);

  if (!steps || steps.length === 0) return null;

  const firstStep = steps[0] || '';
  const truncatedStep = firstStep.length > 40 ? firstStep.slice(0, 40) + '...' : firstStep;

  // Toggle handlers
  const toggleCapsule = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewState(prev => prev === 'circle' ? 'capsule' : 'circle');
  };

  const toggleFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewState(prev => prev === 'full' ? 'capsule' : 'full');
  };

  return (
    <div className="relative z-20 pointer-events-auto">
      {/* ── Circle State ── */}
      {viewState === 'circle' && (
        <button
          onClick={toggleCapsule}
          className="group relative size-10 rounded-full neon-f1-container flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-2xl"
        >
          <Brain className="size-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        </button>
      )}

      {/* ── Capsule State (Roll-out) ── */}
      {viewState === 'capsule' && (
        <div 
          className="flex items-center gap-2 neon-f1-container rounded-full pl-1 pr-3 py-1 min-w-[120px] max-w-[300px] animate-in slide-in-from-left-4 duration-500 ease-out shadow-2xl"
        >
          <button 
            onClick={toggleCapsule}
            className="size-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            <Brain className="size-4 text-indigo-400" />
          </button>
          <span className="flex-1 text-[11px] text-zinc-300 truncate font-medium ml-1">
            {truncatedStep}
          </span>
          <button 
            onClick={toggleFull}
            className="ml-2 p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>
      )}

      {/* ── Full State (Blueprint Card) ── */}
      {viewState === 'full' && (
        <div 
          className="absolute top-0 left-0 w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] overflow-hidden animate-in zoom-in-95 duration-200 z-50 pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-900/30">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-indigo-400 fill-indigo-400/20" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">AI Reasoning</span>
            </div>
            <button 
              onClick={toggleFull}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
            >
              <ChevronUp className="size-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="p-3 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <span className="text-[10px] font-bold text-indigo-500 mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-medium group-hover:text-white transition-colors">
                  {step}
                </p>
              </div>
            ))}
          </div>
          
          {/* Footer Meta */}
          <div className="px-4 py-2 bg-indigo-500/5 text-[9px] text-zinc-600 font-bold uppercase tracking-widest border-t border-zinc-900 flex justify-between">
            <span>Contextual Alignment</span>
            <div className="flex gap-0.5">
               <div className="size-1 rounded-full bg-indigo-500/50" />
               <div className="size-1 rounded-full bg-indigo-500/30" />
               <div className="size-1 rounded-full bg-indigo-500/10" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

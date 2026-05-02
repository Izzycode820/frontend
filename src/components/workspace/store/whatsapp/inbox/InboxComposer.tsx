'use client';

/**
 * InboxComposer
 * Floating ChatGPT-style composer — a rounded pill card that floats
 * above the bottom edge with horizontal padding, not pinned edge-to-edge.
 * Merchant can ALWAYS send even when AI is active (backend handles priority).
 */

import * as React from 'react';
import { ArrowUp, Paperclip, Sparkles, ChevronRight, ChevronLeft, X, Bot, Octagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiAutonomyModeEnum } from '@/types/workspace/store/graphql-base';

export interface InboxComposerProps {
  onSend: (text: string) => void;
  suggestedDraft?: string;
  suggestedReplies?: string[];
  smartActions?: Array<{
    label: string;
    priority: number;
    message_suggestion: string;
  }>;
  isAiThinking?: boolean;
  isAiResponding?: boolean;
  currentThought?: string;
  aiAutonomyMode?: AiAutonomyModeEnum | string;
  onRecordFeedback?: (accepted: boolean, text: string) => void;
  onStopAi?: () => void;
}

export function InboxComposer({
  onSend,
  suggestedDraft,
  suggestedReplies,
  smartActions,
  isAiThinking,
  isAiResponding,
  currentThought,
  aiAutonomyMode,
  onRecordFeedback,
  onStopAi,
}: InboxComposerProps) {
  const [value, setValue] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [isStopping, setIsStopping] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Reset isStopping when AI becomes idle
  React.useEffect(() => {
    if (!isAiThinking && !isAiResponding) {
      setIsStopping(false);
    }
  }, [isAiThinking, isAiResponding]);

  const handleStop = React.useCallback(() => {
    if (onStopAi) {
      setIsStopping(true);
      onStopAi();
    }
  }, [onStopAi]);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [pulse, setPulse] = React.useState(false);
  const [dismissedIndices, setDismissedIndices] = React.useState<Set<number>>(new Set());

  // Dynamic "Peek" Logic: reveal when new suggestions arrive, then hide after 10s
  React.useEffect(() => {
    const hasAny = (smartActions && smartActions.length > 0) || suggestedDraft || (suggestedReplies && suggestedReplies.length > 0);
    if (hasAny) {
      setIsCollapsed(false);
      setPulse(true);
      const timer = setTimeout(() => {
        setIsCollapsed(true);
        setPulse(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [suggestedDraft, suggestedReplies, smartActions]);

  const applyText = (text: string, index?: number) => {
    setValue(text);
    onRecordFeedback?.(true, text);
    if (index !== undefined) {
      const next = new Set(dismissedIndices);
      next.add(index);
      setDismissedIndices(next);
    }
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(text.length, text.length);
    }, 0);
  };

  const handleDismiss = (e: React.MouseEvent, index: number, text: string) => {
    e.stopPropagation();
    const next = new Set(dismissedIndices);
    next.add(index);
    setDismissedIndices(next);
    onRecordFeedback?.(false, text);
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  // Prioritize smartActions, fallback to suggestedReplies
  const activeActions = React.useMemo(() => {
    if (smartActions && smartActions.length > 0) {
      return [...smartActions].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }
    return (suggestedReplies || []).map((r, i) => ({
      label: typeof r === 'string' ? r : (r as any)?.text || '',
      priority: i,
      message_suggestion: typeof r === 'string' ? r : (r as any)?.text || '',
    }));
  }, [smartActions, suggestedReplies]);

  const visibleActions = activeActions.filter((_, i) => !dismissedIndices.has(i));
  const hasSuggestions = suggestedDraft || visibleActions.length > 0;
  const showToggle = hasSuggestions || isAiThinking || aiAutonomyMode !== AiAutonomyModeEnum.Off;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
      {/* ── AI Suggestion Capsules (Floating Above) ── */}
      {showToggle && (
        <div className="mb-4 flex items-center gap-2">
          {/* Toggle Circle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-950/80 border border-white/10 text-zinc-500 hover:text-white hover:border-indigo-500/30 transition-all shadow-xl backdrop-blur-md"
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>

          {!isCollapsed && hasSuggestions && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 animate-in slide-in-from-left-2 fade-in duration-300">
              {suggestedDraft && !dismissedIndices.has(-1) && (
                <div
                  className={cn(
                    "group flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md shadow-xl shrink-0 cursor-pointer transition-all",
                    pulse && "ring-1 ring-indigo-400 ring-offset-1 ring-offset-zinc-950 animate-pulse"
                  )}
                  onClick={() => applyText(suggestedDraft, -1)}
                >
                  <span className="text-[11px] font-bold text-indigo-100 max-w-[140px] truncate">Draft Full Response</span>
                  <button onClick={(e) => handleDismiss(e, -1, "Draft Full Response")} className="hover:text-white text-indigo-400/60 p-0.5">
                    <X className="size-3" />
                  </button>
                </div>
              )}

              {visibleActions.map((sa, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => applyText(sa.message_suggestion, i)}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md shadow-xl shrink-0 cursor-pointer",
                      pulse && "ring-1 ring-white/20 ring-offset-1 ring-offset-zinc-950"
                    )}
                  >
                    <span className="text-[11px] font-medium text-zinc-300 max-w-[200px] truncate whitespace-nowrap">{sa.label}</span>
                    <button onClick={(e) => handleDismiss(e, i, sa.label)} className="hover:text-white text-zinc-600 p-0.5">
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Main Composer Pill ── */}
      <div
        className={cn(
          'flex flex-col rounded-xl border transition-all duration-300',
          'bg-zinc-950/90 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[100px]',
          focused
            ? 'border-indigo-500/50 ring-4 ring-indigo-500/10'
            : 'border-white/10 shadow-black/40',
          (isAiResponding || isStopping) && 'opacity-60 grayscale-[0.5] pointer-events-none'
        )}
      >
        <div className={cn(
          "flex items-end gap-3 px-4 py-4 transition-all",
          (isAiResponding || isStopping) && "blur-[1.5px]"
        )}>
          {/* Attach */}
          <button
            tabIndex={-1}
            disabled={isAiResponding}
            aria-label="Attach"
            className="mb-1 flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all"
          >
            <Paperclip className="size-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            disabled={isAiResponding}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isAiResponding ? "Workman is sending a response..." : (isStopping ? "Stopping AI loop..." : "Message Workman Controller...")}
            rows={1}
            autoComplete="off"
            className={cn(
              'flex-1 resize-none bg-transparent text-[14px] leading-relaxed',
              'text-zinc-100 placeholder:text-zinc-600',
              'focus:outline-none py-1.5 min-h-[40px]',
            )}
            style={{ overflow: 'hidden', maxHeight: '160px' }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isAiResponding}
            aria-label="Send"
            className={cn(
              'mb-1 flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
              (value.trim() && !isAiResponding)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
                : 'text-zinc-700 bg-zinc-900/50 cursor-default',
            )}
          >
            <ArrowUp className="size-5" strokeWidth={3} />
          </button>
        </div>

        {/* ── Workman Activity Status Bar (Integrated Bottom) ── */}
        {(isAiThinking || isAiResponding) && (
          <div className="bg-indigo-500/10 border-t border-indigo-500/20 flex items-center justify-between px-5 py-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-5 rounded-full bg-indigo-500/20">
                 <Bot className={cn("size-3 text-indigo-400", isAiThinking && "animate-bounce")} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none">
                  AI {isAiResponding ? 'RESPONDING' : (currentThought ? currentThought.toUpperCase() : 'THINKING')}
                </span>
                <span className="text-[9px] text-zinc-500 font-medium mt-1">
                  {isAiResponding ? 'Merchant control locked for safety' : (currentThought ? `Workman is currently ${currentThought.toLowerCase()}` : 'Workman is analyzing intent...')}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleStop}
              disabled={isAiResponding || isStopping}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all flex items-center gap-2",
                (isAiResponding || isStopping)
                  ? "bg-zinc-900 text-zinc-700 border border-white/5 opacity-50 cursor-not-allowed"
                  : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10"
              )}
            >
              <Octagon className={cn("size-3", isStopping && "animate-spin text-red-500")} />
              {isAiResponding ? 'SAFE LOCK' : (isStopping ? 'STOPPING...' : 'STOP LOOP')}
            </button>
          </div>
        )}
      </div>

      {/* AI Autonomy Mode Label (Floating Below) */}
      <div className="mt-4 flex justify-center">
        {aiAutonomyMode === AiAutonomyModeEnum.Auto && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <div className="size-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Autonomous Model Active</span>
          </div>
        )}
        {aiAutonomyMode === AiAutonomyModeEnum.Shadow && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <div className="size-1.5 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Shadow Advisory Flow</span>
          </div>
        )}
      </div>
    </div>
  );
}

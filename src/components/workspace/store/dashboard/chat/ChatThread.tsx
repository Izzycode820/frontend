'use client';

import React from 'react';
import {
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
  useMessage,
  useComposerRuntime,
  AuiIf,
} from '@assistant-ui/react';
import { usePathname } from 'next/navigation';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, ArrowUp, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SmartProductCard, LoadingSkeletonCard } from '../../../../workman-ui/tools/products';
import { ActionButton } from '../../../../workman-ui/tools/ActionButton';

interface ChatThreadProps {
  sessionId: string | null;
  messages: any[]; 
  isThinking: boolean;
  thinkingStatus: string;
  onSend: (text: string) => Promise<void>;
  onboarding?: {
    steps: Array<{ id: string; status: 'PENDING' | 'COMPLETED' | 'LOCKED' }>;
    currentStepId: string;
    merchantTier: string;
  };
  onBackToDashboard?: () => void;
  runtime: any;
}

/**
 * RenderMessage
 */
const RenderMessage = ({ thinkingStatus }: { thinkingStatus?: string }) => {
  const message = useMessage();
  const isUser = message.role === 'user';
  const m = message as any;

  const uiState = m.metadata?.unstable_state as any;
  const uiType = (uiState?.uiType || uiState?.ui_type) as string | undefined;
  const uiData = (uiState?.uiData || uiState?.ui_data || uiState?.data) as any;

  if (uiType) {
    console.log(`[ChatRender] 🎨 Rendering message ${m.id}: Type=${uiType}, DataKeys=${Object.keys(uiData || {}).join(',')}`);
  }
  const isRunning = m.status?.type === 'running';

  return (
    <div className={cn(
      "flex w-full max-w-3xl mx-auto gap-4 mb-12 group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "size-8 rounded-full flex items-center justify-center shrink-0 border border-white/5",
        isUser ? "bg-zinc-800 text-zinc-400" : "bg-indigo-500/10 text-indigo-400 shadow-sm"
      )}>
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Content Area */}
      <div className={cn(
        "flex-1 min-w-0 pr-12",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Only render text bubble if there are non-empty text strings */}
        <div className={cn(
            "inline-block max-w-full text-zinc-200 text-[15px] leading-relaxed",
            isUser ? "bg-[#1c1c1c] px-5 py-3.5 rounded-[22px] rounded-tr-none text-zinc-100 font-normal shadow-lg border border-white/5" : "bg-transparent py-1 font-light",
            !isUser && (!message.content.find(c => c.type === 'text' && (c as any).text.trim())) ? "hidden" : ""
        )}>
            <MessagePrimitive.Content
                components={{
                Text: ({ text }: { text: string }) => {
                    // Do not render empty text blocks if we are just meant to show UI
                    if (!text.trim() && uiType) return null;
                    return (
                      <div className={cn(
                          "markdown-content",
                          "[&_p]:mb-4 last:[&_p]:mb-0",
                          "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-3 [&_h1]:text-white",
                          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:text-white",
                          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4",
                          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4",
                          "[&_strong]:font-semibold [&_strong]:text-white",
                          "[&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-indigo-300",
                          "[&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-white/5"
                      )}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                      </div>
                    )
                },
                }}
            />
        </div>

        {/* --- NATIVE TOOLS INJECTION --- */}
        {!isUser && isRunning && thinkingStatus && thinkingStatus !== 'Thinking...' && (
           <LoadingSkeletonCard label={thinkingStatus} />
        )}
        
        {!isUser && uiType === 'smart_product_card' && (
           <SmartProductCard args={uiData} />
        )}
        
        {!isUser && uiType === 'action_button' && (
           <ActionButton args={uiData} />
        )}
      </div>
    </div>
  );
};

/**
 * Internal Composer Component for reuse with Motion
 */
const MotionComposer = ({ layoutId, autoFocus }: { layoutId: string, autoFocus?: boolean }) => {
    return (
        <motion.div layoutId={layoutId} className="w-full">
            <ComposerPrimitive.Root className="w-full flex items-end rounded-[28px] border border-white/10 bg-[#121212]/90 backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 shadow-2xl pr-2 overflow-hidden">
                <ComposerPrimitive.Input
                    placeholder="Ask Workman anything..."
                    className="flex-grow max-h-40 resize-none bg-transparent py-5 pl-8 text-white text-[15px] font-light outline-none placeholder:text-zinc-600 disabled:opacity-50"
                    autoFocus={autoFocus}
                />
                <div className="p-2">
                    <ComposerPrimitive.Send className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-zinc-100 active:scale-95 disabled:opacity-10 disabled:bg-zinc-800 disabled:text-zinc-400">
                        <ArrowUp className="size-5" strokeWidth={2.5} />
                    </ComposerPrimitive.Send>
                </div>
            </ComposerPrimitive.Root>
        </motion.div>
    );
};

/**
 * Suggestions
 */
const Suggestions = ({ onboarding, onBackToDashboard }: { onboarding: any, onBackToDashboard?: () => void }) => {
  const composer = useComposerRuntime();
  const items = [
    { title: "Product Setup", desc: "Help me create optimized product listings", icon: Sparkles, prompt: "I want to create my first product" },
    { title: "Shipping Methods", desc: "Which carriers work best in Cameroon?", icon: ArrowRight, prompt: "How does shipping work?" },
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="size-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-10 shadow-2xl shadow-indigo-500/5">
            <Bot className="size-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-semibold text-white tracking-tight mb-4 text-center">
            Workman Assistant
        </h1>
        <p className="text-zinc-500 text-lg font-light mb-12 text-center max-w-md leading-relaxed">
            Your intelligent partner for building a world-class store. Ask me about products, shipping, or growth.
        </p>
        
        <div className="grid grid-cols-2 gap-3 w-full px-4 mb-8">
            {items.map((item, idx) => (
                <div 
                    key={idx} 
                    onClick={() => composer.setText(item.prompt)}
                    className="p-4 rounded-2xl bg-[#121212] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                    <item.icon className="size-4 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-zinc-100 text-sm font-medium mb-1">{item.title}</h3>
                    <p className="text-zinc-500 text-xs font-light leading-snug">{item.desc}</p>
                </div>
            ))}
        </div>

        {onboarding && (
            <button 
            onClick={onBackToDashboard}
            className="mb-8 text-indigo-400 hover:text-indigo-300 text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center gap-2 group"
            >
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" /> 
            Back to setup guide
            </button>
        )}
    </div>
  );
};

export function ChatThread({
  sessionId,
  messages,
  thinkingStatus,
  onboarding,
  onBackToDashboard,
  runtime,
}: ChatThreadProps) {
  
  return (
    <div className="flex-1 flex flex-col h-full bg-[#090909] relative overflow-hidden">
      <ThreadPrimitive.Root className="flex h-full w-full flex-col">
        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-4 scrollbar-hide relative flex flex-col">
          
          <AuiIf condition={(s) => s.thread.isEmpty}>
             {/* 
                Empty State Strategy:
                1. If we are on the root route (/chat), show the full welcome & suggestions.
                2. If we are on a session route (/chat/id) but it's empty, we are likely hydrating or it's a fresh ghost.
                   Show a simpler view or a focused composer to avoid the 'Dead Composer' jump.
             */}
             {(() => {
                const pathname = usePathname() || "";
                const isRoot = pathname.endsWith('/chat') || pathname.endsWith('/chat/');
                
                if (isRoot) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <Suggestions onboarding={onboarding} onBackToDashboard={onBackToDashboard} />
                        <div className="w-full max-w-2xl">
                            <MotionComposer layoutId="composer-shell" autoFocus />
                        </div>
                    </div>
                  );
                }

                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                     <div className="w-full max-w-2xl animate-in fade-in duration-700">
                         {/* We show a simple focused composer for ghost sessions/loading sessions */}
                         <p className="text-zinc-500 text-sm font-light mb-8 text-center">
                            Just a second, Workman is retrieving your session...
                         </p>
                         <MotionComposer layoutId="composer-shell" autoFocus />
                     </div>
                  </div>
                );
             })()}
          </AuiIf>

          <AuiIf condition={(s) => !s.thread.isEmpty}>
             <div className="pt-12 pb-12 w-full">
                <ThreadPrimitive.Messages>
                    {({ message }) => <RenderMessage thinkingStatus={thinkingStatus} />}
                </ThreadPrimitive.Messages>

                 <ThreadPrimitive.If running>
                    {(!thinkingStatus || thinkingStatus === 'Thinking...') && (
                      <div className="max-w-3xl mx-auto w-full flex items-center gap-3 px-2 mb-12 animate-in fade-in duration-500">
                          <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-400/70 uppercase tracking-[0.15em]">
                          AI is reasoning
                          </span>
                      </div>
                    )}
                </ThreadPrimitive.If>
             </div>
             
             {/* Sticky Footer for Active Chat */}
             <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-3xl flex-col gap-4 overflow-visible bg-gradient-to-t from-[#090909] via-[#090909] to-transparent pb-8 pt-8 z-20">
                <MotionComposer layoutId="composer-shell" />
             </ThreadPrimitive.ViewportFooter>
          </AuiIf>

        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>
    </div>
  );
}

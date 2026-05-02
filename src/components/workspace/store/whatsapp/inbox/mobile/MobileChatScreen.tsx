'use client';

/**
 * MobileChatScreen
 * Mobile full-screen active chat view.
 * Includes its own header (back nav + tools button) and wires to InboxComposer.
 * Design this file independently for mobile chat UI improvements.
 */

import * as React from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Bot, User, ChevronLeft, PanelRight, Eye, PowerOff, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessages } from '@/components/shadcn-ui/chat/chat';
import { AiAutonomyModeEnum } from '@/types/workspace/store/graphql-base';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn-ui/dropdown-menu';
import { InboxComposer } from '../InboxComposer';
import type { SidebarConversation } from '../WhatsAppInbox';
import type { ChatMessageData } from '@/components/shadcn-ui/chat/types';

export interface MobileChatScreenProps {
  conversation: SidebarConversation;
  messages: ChatMessageData[];
  insights?: {
    intent?: string;
    cartValue?: string;
    status?: 'thinking' | 'waiting_approval' | 'idle' | string;
    currentThought?: string;
    suggestedDraft?: string;
    suggestedReplies?: string[];
    strategy?: string | any;
  };
  aiAutonomyMode?: AiAutonomyModeEnum | string;
  aiSettings?: { llmProvider: string; autoReplyEnabled: boolean } | null;
  onToggleAi: (mode: string) => void;
  onOpenAiSettings?: () => void;
  onSend: (text: string) => void;
  /** Navigate back to thread list */
  onBack: () => void;
  /** Open the tools side-sheet */
  onOpenTools: () => void;
  autoReplyLabel: string;
  draftModeLabel: string;
  onRecordFeedback?: (accepted: boolean, text: string) => void;
  onStopAi?: () => void;
}

export function MobileChatScreen({
  conversation,
  messages,
  insights,
  aiAutonomyMode,
  aiSettings,
  onToggleAi,
  onOpenAiSettings,
  onSend,
  onBack,
  onOpenTools,
  autoReplyLabel,
  draftModeLabel,
  onRecordFeedback,
  onStopAi,
}: MobileChatScreenProps) {
  const getModeInfo = (mode: string) => {
    switch (mode) {
      case AiAutonomyModeEnum.Auto:
        return { label: 'Autonomous', icon: Bot, color: 'text-[#00A884]', bg: 'bg-[#00A884]/10' };
      case AiAutonomyModeEnum.Shadow:
        return { label: 'Shadow', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-400/10' };
      case AiAutonomyModeEnum.Off:
        return { label: 'Self', icon: User, color: 'text-slate-400', bg: 'bg-white/10' };
      default:
        return { label: 'Self', icon: User, color: 'text-slate-400', bg: 'bg-white/10' };
    }
  };

  const currentMode = aiAutonomyMode || AiAutonomyModeEnum.Shadow;
  const modeInfo = getModeInfo(currentMode);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B141A]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5 bg-[#202C33] shrink-0">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex size-9 items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Avatar */}
        <div className="size-9 rounded-full bg-[#2A3942] flex items-center justify-center text-[12px] font-bold text-[#00A884] shrink-0">
          {conversation.title.slice(-2)}
        </div>

        {/* Name + subtitle */}
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#E9EDEF] truncate leading-tight">
            {conversation.title}
          </p>
          <p className={cn(
            "text-[11px] leading-tight",
            (insights?.status && insights.status !== 'idle' && insights.status !== 'waiting_approval') 
              ? (insights.status === 'responding' ? 'text-amber-400 font-bold' : 'text-indigo-400 font-bold')
              : 'text-slate-500'
          )}>
            {insights?.status === 'responding' ? (
              <span className="animate-pulse">Responding...</span>
            ) : (insights?.status && insights.status !== 'idle' && insights.status !== 'waiting_approval') ? (
              <span className="animate-pulse">
                {insights.currentThought ? insights.currentThought : 'Thinking...'}
              </span>
            ) : (
              aiSettings?.autoReplyEnabled ? autoReplyLabel : draftModeLabel
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'h-8 px-2.5 gap-1 text-xs font-medium rounded-xl border-white/10',
                  modeInfo.color
                )}
              >
                <modeInfo.icon className="size-3.5" />
                <span>{modeInfo.label}</span>
                <ChevronDown className="size-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1c2027] border-white/10 text-white w-40">
              <DropdownMenuItem onClick={() => onToggleAi('AUTO')} className="flex items-center justify-between text-xs py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bot className="size-3.5 text-[#00A884]" />
                  <span>Autonomous</span>
                </div>
                {currentMode === 'AUTO' && <Check className="size-3 text-[#00A884]" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAi('SHADOW')} className="flex items-center justify-between text-xs py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Eye className="size-3.5 text-amber-400" />
                  <span>Shadow</span>
                </div>
                {currentMode === 'SHADOW' && <Check className="size-3 text-amber-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleAi('OFF')} className="flex items-center justify-between text-xs py-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <PowerOff className="size-3.5 text-slate-400" />
                  <span>Self</span>
                </div>
                {currentMode === 'OFF' && <Check className="size-3 text-slate-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
            onClick={onOpenAiSettings}
          >
            <Bot className="size-4" />
          </Button>

          {/* Open tools sheet */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
            onClick={onOpenTools}
            aria-label="Open strategy / catalog"
          >
            <PanelRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <ChatMessages messages={messages} />
      </div>

      <div className="shrink-0">
        <InboxComposer
          onSend={onSend}
          aiAutonomyMode={aiAutonomyMode}
          suggestedDraft={insights?.suggestedDraft}
          suggestedReplies={insights?.suggestedReplies}
          isAiThinking={insights?.status !== 'idle' && insights?.status !== 'waiting_approval' && insights?.status !== 'responding'}
          isAiResponding={insights?.status === 'responding'}
          currentThought={insights?.currentThought}
          onRecordFeedback={onRecordFeedback}
          onStopAi={onStopAi}
        />
      </div>
    </div>
  );
}

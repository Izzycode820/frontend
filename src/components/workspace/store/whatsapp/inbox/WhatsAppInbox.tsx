'use client';

/**
 * WhatsAppInbox
 * Orchestrator — lays out the full-screen 3-column desktop view and
 * delegates all mobile screens to the mobile/ subfolder components.
 *
 * Data flows in via props from WhatsAppInboxContainer (unchanged).
 * No fetch logic, no WebSocket logic, no business logic here.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ChatProvider, ChatMessages, ChatMessage } from '@/components/shadcn-ui/chat/chat';
import type { ChatMessageData, ChatUser } from '@/components/shadcn-ui/chat/types';
import type { InboxWsStatus } from './useInboxWebSocket';
import { AiAutonomyModeEnum } from '@/types/workspace/store/graphql-base';
import { WhatsAppInboxSkeleton } from './InboxSkeleton';
import { InboxComposer } from './InboxComposer';
import { BlueprintBubble } from './BlueprintBubble';
import { InboxRightSidebar, type SidebarTab } from './InboxRightSidebar';
import { MobileThreadList } from './mobile/MobileThreadList';
import { MobileChatScreen } from './mobile/MobileChatScreen';
import { MobileToolsSheet } from './mobile/MobileToolsSheet';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { Search, Bot, Sparkles, X, User, PanelRight, Check, ChevronDown, Monitor, Eye, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/shadcn-ui/dropdown-menu';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SidebarConversation {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatar?: string;
  unreadCount?: number;
  presence?: 'online' | 'away' | 'offline';
  cartValue?: string;
  aiScore?: number;
  isStateTransitionPaused?: boolean;
  aiAutonomyMode?: string;
}

export interface InboxInsights {
  intent?: string;
  cartValue?: string;
  status?: 'thinking' | 'waiting_approval' | 'idle' | string;
  currentThought?: string;
  suggestedDraft?: string;
  suggestedReplies?: string[];
  smartActions?: Array<{
    label: string;
    priority: number;
    message_suggestion: string;
  }>;
  strategy?: string | any;
  blueprintSteps?: any[];
  confidence?: number;
  // Protocol / Mature AI fields
  domain?: string;
  currentState?: string;
  previousState?: string;
  sentimentHistory?: number[];
  conversionProbability?: number;
  dropRisk?: number;
  priceSensitivity?: number;
  decisiveness?: number;
  trustLevel?: number;
  activeIntervention?: string;
  isStateTransitionPaused?: boolean;
  pauseReason?: string | null;
  aiAutonomyMode?: string;
}

export interface WhatsAppInboxProps {
  conversations: SidebarConversation[];
  loading?: boolean;
  selectedConversation?: SidebarConversation | null;
  messages: ChatMessageData[];
  insights?: InboxInsights;
  wsStatus?: InboxWsStatus;
  onSelectConversation: (id: string) => void;
  onSendMessage: (text: string, interactiveData?: any) => void;
  onToggleAi: (mode: string) => void;
  aiAutonomyMode?: AiAutonomyModeEnum | string;
  onOpenAiSettings?: () => void;
  aiSettings?: any | null;
  currentUser: ChatUser;
  onRecordFeedback?: (accepted: boolean, text: string) => void;
  onResumeAi?: () => void | Promise<void>;
  // Missing status indicators
  isAiActive?: boolean;
  isAiProcessing?: boolean;
  isAiResponding?: boolean;
  onStopAi?: () => void;
}

// ─── Desktop thread list sidebar ──────────────────────────────────────────────
// Only rendered on md+. Inline here since it won't be independently redesigned
// (the mobile version in mobile/MobileThreadList.tsx handles mobile iteration).

function DesktopThreadSidebar({
  conversations,
  selectedId,
  wsStatus,
  onSelect,
  onClose,
}: {
  conversations: SidebarConversation[];
  selectedId?: string | null;
  wsStatus: InboxWsStatus;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = React.useState('');
  const filtered = q
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(q.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(q.toLowerCase()),
      )
    : conversations;

  return (
    <aside className="hidden md:flex w-[280px] shrink-0 flex-col border-r border-white/5 bg-[#09090b]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <h3 className="flex-1 text-sm font-bold uppercase tracking-widest text-slate-500">Inbox</h3>
        <span
          title={wsStatus}
          className={cn(
            'size-2 rounded-full shrink-0 transition-colors',
            wsStatus === 'connected'    && 'bg-green-500',
            wsStatus === 'connecting'   && 'bg-amber-400 animate-pulse',
            wsStatus === 'disconnected' && 'bg-slate-600',
            wsStatus === 'error'        && 'bg-red-500',
          )}
        />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-full hover:bg-red-500/10 hover:text-red-400" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative px-3 py-2 shrink-0">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 rounded-lg text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none border border-white/5 focus:border-indigo-500/40"
        />
      </div>

      {/* Threads */}
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.map((convo) => (
          <div
            key={convo.id}
            onClick={() => onSelect(convo.id)}
            className={cn(
              'flex items-center gap-3 mx-2 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 mb-0.5',
              selectedId === convo.id
                ? 'bg-indigo-500/10 border border-indigo-500/20 shadow-sm'
                : 'hover:bg-white/[0.03] border border-transparent',
            )}
          >
            <div className="size-9 rounded-full bg-zinc-800 flex items-center justify-center text-[12px] font-bold text-indigo-400 shrink-0 relative">
              {convo.title.slice(-2)}
              {convo.isStateTransitionPaused && (
                <div className="absolute -top-1 -right-1 size-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                  <span className="text-[10px] text-black font-black">⏸</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-[13px] font-semibold text-[#E9EDEF]">{convo.title}</p>
                <span className="text-[10px] text-slate-500 shrink-0 ml-1">{convo.lastMessageTime}</span>
              </div>
              <p className="truncate text-[11px] text-slate-500 mt-0.5">{convo.lastMessage}</p>
              {convo.aiScore !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] rounded font-bold uppercase tracking-tighter border border-indigo-500/20">
                    AI Score: {convo.aiScore}
                  </span>
                </div>
              )}
            </div>
            {convo.unreadCount ? (
              <span className="size-5 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center shrink-0 shadow-lg">
                {convo.unreadCount}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Desktop chat column ──────────────────────────────────────────────────────

function DesktopChatColumn({
  conversation,
  messages,
  insights,
  aiAutonomyMode,
  aiSettings,
  onToggleAi,
  onOpenAiSettings,
  onSend,
  onOpenTools,
  autoReplyLabel,
  draftModeLabel,
  onRecordFeedback,
  onStopAi,
}: {
  conversation: SidebarConversation;
  messages: ChatMessageData[];
  insights: WhatsAppInboxProps['insights'];
  aiAutonomyMode?: AiAutonomyModeEnum | string;
  aiSettings: WhatsAppInboxProps['aiSettings'];
  onToggleAi: (mode: string) => void;
  onOpenAiSettings?: () => void;
  onSend: (text: string) => void;
  onOpenTools: () => void;
  autoReplyLabel: string;
  draftModeLabel: string;
  onRecordFeedback?: (accepted: boolean, text: string) => void;
  onStopAi?: () => void;
}) {
  const getModeInfo = (mode: string) => {
    switch (mode) {
      case AiAutonomyModeEnum.Auto:
        return { 
          label: 'Autonomous Controller', 
          icon: Bot, 
          color: 'text-indigo-400', 
          bg: 'bg-indigo-500/10' 
        };
      case AiAutonomyModeEnum.Shadow:
        return { 
          label: 'Shadow Advisory', 
          icon: Eye, 
          color: 'text-amber-400', 
          bg: 'bg-amber-400/10' 
        };
      case AiAutonomyModeEnum.Off:
        return { 
          label: 'Manual Control', 
          icon: User, 
          color: 'text-zinc-500', 
          bg: 'bg-zinc-900' 
        };
      default:
        return { 
          label: 'Manual Control', 
          icon: User, 
          color: 'text-zinc-500', 
          bg: 'bg-zinc-900' 
        };
    }
  };

  const currentMode = (aiAutonomyMode as AiAutonomyModeEnum) || AiAutonomyModeEnum.Shadow;
  const modeInfo = getModeInfo(currentMode);

  // Map blueprintSteps to the latest customer message for the "Thinking Dropdown"
  const enrichedMessages = React.useMemo(() => {
    if (!insights?.blueprintSteps || insights.blueprintSteps.length === 0) return messages;
    
    // Find index of the last customer message
    let lastCustomerIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderType === 'customer') {
        lastCustomerIndex = i;
        break;
      }
    }

    if (lastCustomerIndex === -1) return messages;

    return messages.map((m, idx) => {
      if (idx === lastCustomerIndex) {
        return { ...m, blueprintSteps: insights.blueprintSteps };
      }
      return m;
    });
  }, [messages, insights?.blueprintSteps]);

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950 relative">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="size-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-zinc-100 leading-none">{conversation.title}</span>
            {insights?.status === 'responding' ? (
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-1 animate-pulse">Workman is responding...</span>
            ) : insights?.status && insights.status !== 'idle' && insights.status !== 'waiting_approval' ? (
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 animate-pulse">
                {insights.currentThought ? `Workman is ${insights.currentThought.toLowerCase()}` : `Workman is ${insights.status}...`}
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Active Control Session</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-950/50 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 hover:opacity-80 transition-all cursor-pointer py-1 group">
                <modeInfo.icon className={cn("size-3.5 transition-transform group-hover:scale-110", modeInfo.color)} />
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", modeInfo.color)}>
                  {modeInfo.label}
                </span>
                <ChevronDown className="size-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300 w-56 shadow-2xl rounded-xl p-1">
              <DropdownMenuLabel className="text-[10px] uppercase text-zinc-500 px-3 py-2">Autonomy Protocol</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                onClick={() => onToggleAi('AUTO')}
                className="flex items-center justify-between text-xs py-2.5 px-3 cursor-pointer hover:bg-zinc-900 rounded-lg group"
              >
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Autonomous (Auto-Reply)</span>
                </div>
                {currentMode === 'AUTO' && <Check className="size-3.5 text-indigo-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onToggleAi('SHADOW')}
                className="flex items-center justify-between text-xs py-2.5 px-3 cursor-pointer hover:bg-zinc-900 rounded-lg group"
              >
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Shadow Mode (Drafts)</span>
                </div>
                {currentMode === 'SHADOW' && <Check className="size-3.5 text-amber-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onToggleAi('OFF')}
                className="flex items-center justify-between text-xs py-2.5 px-3 cursor-pointer hover:bg-zinc-900 rounded-lg group"
              >
                <div className="flex items-center gap-2">
                  <PowerOff className="size-4 text-zinc-500 transition-colors group-hover:text-red-400" />
                  <span className="font-medium text-zinc-400">AI Muted (Manual)</span>
                </div>
                {currentMode === 'OFF' && <Check className="size-3.5 text-zinc-500" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="w-[1px] h-3 bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer" onClick={onOpenAiSettings}>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              aiSettings?.autoReplyEnabled ? "text-indigo-400" : "text-zinc-500"
            )}>
              Auto
            </span>
            <div className={cn(
              "w-8 h-4 rounded-full relative flex items-center px-0.5 transition-all duration-300",
              aiSettings?.autoReplyEnabled ? "bg-indigo-500/20 ring-1 ring-indigo-500/30" : "bg-white/10"
            )}>
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 shadow-sm",
                aiSettings?.autoReplyEnabled ? "bg-indigo-400 translate-x-4" : "bg-zinc-600"
              )}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative min-h-0 bg-[#09090b]">
        {/* Abstract pattern to reduce starkness */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} 
        />
        
        <ChatMessages 
          messages={enrichedMessages} 
          isAiThinking={insights?.status === 'thinking'}
          className="absolute inset-0 pt-6 pb-40"
        />
      </div>

      {/* Floating Composer Integration */}
      <InboxComposer
        onSend={onSend}
        suggestedDraft={insights?.suggestedDraft}
        suggestedReplies={insights?.suggestedReplies}
        smartActions={insights?.smartActions}
        isAiThinking={insights?.status !== 'idle' && insights?.status !== 'waiting_approval' && insights?.status !== 'responding'}
        currentThought={insights?.currentThought}
        isAiResponding={insights?.status === 'responding'}
        aiAutonomyMode={aiAutonomyMode}
        onRecordFeedback={onRecordFeedback}
        onStopAi={onStopAi}
      />
    </main>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export function WhatsAppInbox({
  conversations,
  loading,
  selectedConversation,
  messages,
  insights,
  wsStatus = 'disconnected',
  onSelectConversation,
  onSendMessage,
  onToggleAi,
  aiAutonomyMode,
  onOpenAiSettings,
  aiSettings,
  currentUser,
  onRecordFeedback,
  onStopAi,
  onResumeAi,
}: WhatsAppInboxProps) {
  const t = useTranslations('WhatsAppInbox');
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  const [isOpen, setIsOpen] = React.useState(false);
  const [mobileScreen, setMobileScreen] = React.useState<'list' | 'chat'>('list');
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>('strategy');
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (selectedConversation) setIsOpen(true);
  }, [selectedConversation]);

  const handleSelectConvo = (id: string) => {
    onSelectConversation(id);
    setIsOpen(true);
    setMobileScreen('chat');
  };

  const handleClose = () => {
    setIsOpen(false);
    setMobileScreen('list');
    setToolsOpen(false);
  };

  const handleSendProduct = () => {
    if (!selectedProduct) return;
    onSendMessage('Product Shared', { type: 'product', product: selectedProduct });
    setSelectedProduct(null);
  };

  const rightSidebarProps = {
    tab: sidebarTab,
    onTabChange: setSidebarTab,
    insights,
    workspaceId: currentWorkspace?.id || '',
    selectedProduct,
    onSelectProduct: setSelectedProduct,
    onClearProduct: () => setSelectedProduct(null),
    onSendProduct: handleSendProduct,
    onResumeAi,
    aiAutonomyMode,
  };

  const sharedChatLabels = {
    autoReplyLabel: t('auto_reply_mode'),
    draftModeLabel: t('draft_mode'),
  };

  const filtered = searchQuery
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  if (loading && conversations.length === 0) return <WhatsAppInboxSkeleton />;

  return (
    <>
      {/* ── Page: Conversation list ───────────────────────────── */}
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl border bg-card/30 backdrop-blur-sm shadow-sm ring-1 ring-inset ring-white/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5" /></div>
            <div>
              <h2 className="font-bold font-heading text-xl">{t('title')}</h2>
              <p className="text-xs text-muted-foreground italic">Strategic Sales Copilot</p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20 ml-2">
              {conversations.length} Active Threads
            </Badge>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-10 pr-4 py-2.5 bg-background/50 rounded-xl text-sm border focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-card/20 rounded-2xl border p-2 shadow-sm min-h-[500px]">
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 opacity-40">
              <Bot className="size-12 mb-4" />
              <p className="font-heading">No active conversations found.</p>
            </div>
          ) : (
            filtered.map((convo) => (
              <div
                key={convo.id}
                onClick={() => handleSelectConvo(convo.id)}
                className={cn(
                  'group cursor-pointer p-4 rounded-xl border border-transparent transition-all duration-300',
                  'hover:bg-primary/[0.03] hover:border-primary/10 hover:shadow-sm',
                  selectedConversation?.id === convo.id && isOpen
                    ? 'bg-primary/[0.05] border-primary/20 shadow-sm ring-1 ring-primary/5'
                    : 'bg-background/40',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-[13px] font-bold text-primary shrink-0 relative">
                    {convo.title.slice(-2)}
                    {convo.isStateTransitionPaused && (
                      <div className="absolute -top-1 -right-1 size-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-background animate-pulse shadow-sm">
                        <span className="text-[10px] text-black font-black">⏸</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold">{convo.title}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{convo.lastMessageTime}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">{convo.lastMessage}</p>
                  </div>
                  {convo.unreadCount ? (
                    <span className="size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shrink-0">
                      {convo.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Full-screen 3-column overlay ──────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-[#0B141A] animate-in fade-in duration-200"
          style={{ contain: 'strict' }}
        >
          <ChatProvider currentUser={currentUser} theme="lunar" className="flex h-full w-full overflow-hidden relative">

            {/* Desktop: Col 1 thread sidebar */}
            <DesktopThreadSidebar
              conversations={conversations}
              selectedId={selectedConversation?.id}
              wsStatus={wsStatus}
              onSelect={onSelectConversation}
              onClose={handleClose}
            />

            {/* Desktop: Col 2 chat — hidden on mobile unless mobileScreen='chat' */}
            <div className={cn(
              'flex-1 flex-col min-w-0',
              'hidden md:flex',
              mobileScreen === 'chat' && '!flex',
            )}>
              {selectedConversation ? (
                <DesktopChatColumn
                  conversation={selectedConversation}
                  messages={messages}
                  insights={insights}
                  aiAutonomyMode={aiAutonomyMode}
                  aiSettings={aiSettings}
                  onToggleAi={onToggleAi}
                  onOpenAiSettings={onOpenAiSettings}
                  onSend={onSendMessage}
                  onOpenTools={() => setToolsOpen(true)}
                  onRecordFeedback={onRecordFeedback}
                  onStopAi={onStopAi}
                  {...sharedChatLabels}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                  <div className="text-center"><Bot className="size-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Select a conversation</p></div>
                </div>
              )}
            </div>

            {/* Desktop: Col 3 right sidebar */}
            <aside className="hidden md:flex w-[400px] shrink-0 border-l border-white/5 bg-[#09090b]">
              <InboxRightSidebar {...rightSidebarProps} />
            </aside>

            {/* Mobile: full-screen thread list (slides left when entering chat) */}
            <div className={cn(
              'absolute inset-0 md:hidden transition-transform duration-300',
              mobileScreen === 'list' ? 'translate-x-0' : '-translate-x-full',
            )}>
              <MobileThreadList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                wsStatus={wsStatus}
                onSelect={handleSelectConvo}
                onClose={handleClose}
              />
            </div>

            {/* Mobile: full-screen chat (slides in from right) */}
            {selectedConversation && (
              <div className={cn(
                'absolute inset-0 md:hidden transition-transform duration-300',
                mobileScreen === 'chat' ? 'translate-x-0' : 'translate-x-full',
              )}>
                <MobileChatScreen
                  conversation={selectedConversation}
                  messages={messages}
                  insights={insights}
                  aiAutonomyMode={aiAutonomyMode}
                  aiSettings={aiSettings}
                  onToggleAi={onToggleAi}
                  onOpenAiSettings={onOpenAiSettings}
                  onSend={onSendMessage}
                  onBack={() => setMobileScreen('list')}
                  onOpenTools={() => setToolsOpen(true)}
                  onRecordFeedback={onRecordFeedback}
                  onStopAi={onStopAi}
                  {...sharedChatLabels}
                />
              </div>
            )}

            {/* Mobile: tools sheet */}
            <MobileToolsSheet
              isOpen={toolsOpen}
              onClose={() => setToolsOpen(false)}
              {...rightSidebarProps}
            />

          </ChatProvider>
        </div>
      )}
    </>
  );
}

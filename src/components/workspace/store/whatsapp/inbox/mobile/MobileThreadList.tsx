'use client';

/**
 * MobileThreadList
 * Mobile full-screen thread list.
 * Design this file independently for mobile list UI improvements.
 * Receives the same conversations[] data as the desktop sidebar —
 * no separate data path.
 */

import * as React from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SidebarConversation } from '../WhatsAppInbox';
import type { InboxWsStatus } from '../useInboxWebSocket';

export interface MobileThreadListProps {
  conversations: SidebarConversation[];
  selectedId?: string | null;
  wsStatus: InboxWsStatus;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function MobileThreadList({
  conversations,
  selectedId,
  wsStatus,
  onSelect,
  onClose,
}: MobileThreadListProps) {
  const [q, setQ] = React.useState('');

  const filtered = q
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(q.toLowerCase()) ||
          c.lastMessage?.toLowerCase().includes(q.toLowerCase()),
      )
    : conversations;

  return (
    <div className="flex flex-col h-full bg-[#111B21]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 shrink-0">
        <h3 className="flex-1 text-base font-bold text-[#E9EDEF]">Chats</h3>
        {/* WS status dot */}
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
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 rounded-full hover:bg-red-500/10 hover:text-red-400"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2.5 bg-[#202C33] rounded-xl text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none border border-white/5 focus:border-[#00A884]/40"
          />
        </div>
      </div>

      {/* Thread rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {filtered.map((convo) => (
          <div
            key={convo.id}
            onClick={() => onSelect(convo.id)}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-white/[0.04] transition-colors',
              selectedId === convo.id && 'bg-[#00A884]/10',
            )}
          >
            {/* Avatar */}
            <div className="size-12 rounded-full bg-[#2A3942] flex items-center justify-center text-[14px] font-bold text-[#00A884] shrink-0">
              {convo.title.slice(-2)}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <p className="truncate text-[15px] font-semibold text-[#E9EDEF]">
                  {convo.title}
                </p>
                <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                  {convo.lastMessageTime}
                </span>
              </div>
              <p className="truncate text-[13px] text-slate-500">
                {convo.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {convo.unreadCount ? (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#00A884] text-[11px] font-bold text-white flex items-center justify-center shrink-0">
                {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

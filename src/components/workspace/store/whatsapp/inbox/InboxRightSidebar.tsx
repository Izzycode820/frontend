'use client';

/**
 * InboxRightSidebar
 * Shared strategy + catalog panel.
 * Used as a fixed desktop column (no onClose) and as a mobile slide-in sheet (with onClose).
 * Design this file independently for right-panel improvements.
 */

import * as React from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { Send as SendIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategicAdvisor } from './StrategicAdvisor';
import { ProductSidebarList } from './ProductSidebarList';
import { InboxInsights } from './WhatsAppInbox';

export type SidebarTab = 'strategy' | 'catalog';

export interface InboxRightSidebarProps {
  tab: SidebarTab;
  onTabChange: (t: SidebarTab) => void;
  insights?: InboxInsights;
  aiAutonomyMode?: string;
  workspaceId: string;
  selectedProduct: any;
  onResumeAi?: () => void;
  onSelectProduct: (p: any) => void;
  onClearProduct: () => void;
  onSendProduct: () => void;
  /** Present on mobile sheet variant — renders a close button in the header */
  onClose?: () => void;
}

export function InboxRightSidebar({
  tab,
  onTabChange,
  insights,
  workspaceId,
  selectedProduct,
  onResumeAi,
  onSelectProduct,
  onClearProduct,
  onSendProduct,
  aiAutonomyMode,
  onClose,
}: InboxRightSidebarProps) {
  return (
    <div className="flex flex-col h-full w-full bg-[#09090b]">
      {/* Mobile close strip — only rendered when onClose is provided */}
      {onClose && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Tools
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 rounded-full hover:bg-zinc-800"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 shrink-0">
        {(['strategy', 'catalog'] as SidebarTab[]).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={cn(
              'flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all',
              tab === t
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50',
            )}
          >
            {t === 'strategy' ? '🧠 Strategy' : '🛍 Catalog'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'strategy' ? (
          <StrategicAdvisor
            insights={insights}
            intent={insights?.intent || 'Exploring'}
            strategy={insights?.strategy || ''}
            recommendations={insights?.suggestedReplies || []}
            cartValue={insights?.cartValue || 'XAF 0'}
            aiAutonomyMode={aiAutonomyMode}
            blueprintSteps={insights?.blueprintSteps}
            onResumeAi={onResumeAi}
          />
        ) : (
          <ProductSidebarList
            workspaceId={workspaceId}
            selectedId={selectedProduct?.id}
            onSelect={onSelectProduct}
            onClear={onClearProduct}
          />
        )}
      </div>

      {/* Catalog send footer */}
      {tab === 'catalog' && selectedProduct && (
        <div className="border-t border-zinc-800 p-4 flex gap-2 shrink-0 bg-zinc-950">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl h-10 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            onClick={onClearProduct}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl h-10 gap-2 bg-indigo-600 hover:bg-indigo-500 border-transparent shadow-lg shadow-indigo-500/10"
            onClick={onSendProduct}
          >
            <SendIcon className="size-3.5" />
            Send
          </Button>
        </div>
      )}
    </div>
  );
}

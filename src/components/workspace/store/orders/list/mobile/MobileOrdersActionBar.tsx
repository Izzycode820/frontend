'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Archive, 
  CreditCard, 
  MoreVertical, 
  Package, 
  X, 
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';

interface MobileOrdersActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkArchive: () => void;
  onBulkCancel: () => void;
  onBulkMarkAsPaid: () => void;
  onBulkStatusUpdate: (status: string, label?: string) => void;
}

export function MobileOrdersActionBar({
  selectedCount,
  onClearSelection,
  onBulkArchive,
  onBulkCancel,
  onBulkMarkAsPaid,
  onBulkStatusUpdate,
}: MobileOrdersActionBarProps) {
  const t = useTranslations('Orders.actions');

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 md:hidden pointer-events-none">
      <div className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-4 py-3 shadow-2xl pointer-events-auto">
        <button
          onClick={onClearSelection}
          className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors"
          aria-label={t('cancelSelection')}
        >
          <X className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium px-2 min-w-[60px] text-center">
          {t('selectedCount', { count: selectedCount })}
        </span>

        <div className="h-6 w-px bg-white/20 dark:bg-zinc-900/20" />

        <button
          onClick={onBulkMarkAsPaid}
          className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors"
          title={t('markAsPaid')}
        >
          <CreditCard className="h-5 w-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
            <DropdownMenuLabel>{t('more')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={onBulkArchive}>
              <Archive className="mr-2 h-4 w-4" />
              <span>{t('archive')}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onBulkCancel} className="text-destructive focus:text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              <span>{t('cancelOrders')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('fulfillment')}</DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => onBulkStatusUpdate('delivered', t('markAsDelivered'))}>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              <span>{t('markAsDelivered')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onBulkStatusUpdate('processing', t('markProcessing'))}>
              <Clock className="mr-2 h-4 w-4 text-blue-600" />
              <span>{t('markProcessing')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onBulkStatusUpdate('on_hold', t('markOnHold'))}>
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
              <span>{t('markOnHold')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onBulkStatusUpdate('unfulfilled', t('markAsNotDelivered'))}>
              <Package className="mr-2 h-4 w-4 text-gray-500" />
              <span>{t('markAsNotDelivered')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

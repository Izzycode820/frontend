'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface OrdersFilterChipsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function OrdersFilterChips({ activeTab, onTabChange }: OrdersFilterChipsProps) {
  const t = useTranslations('Orders.list');

  const chips = [
    { value: 'all', label: t('tabs.all') },
    { value: 'unfulfilled', label: t('tabs.unfulfilled') },
    { value: 'unpaid', label: t('tabs.unpaid') },
    { value: 'open', label: t('tabs.open') },
    { value: 'archived', label: t('tabs.archived') },
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {chips.map((chip) => (
        <button
          key={chip.value}
          onClick={() => onTabChange(chip.value)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95",
            activeTab === chip.value
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

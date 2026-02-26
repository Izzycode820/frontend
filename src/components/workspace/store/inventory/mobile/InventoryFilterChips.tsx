'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface FilterChip {
    value: string;
    label: string;
    count?: number;
}

interface InventoryFilterChipsProps {
    chips: FilterChip[];
    activeChip: string;
    onChipChange: (value: string) => void;
}

const DEFAULT_INVENTORY_CHIPS: FilterChip[] = [
    { value: 'all', label: 'All' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
];

export function InventoryFilterChips({
    chips = DEFAULT_INVENTORY_CHIPS,
    activeChip,
    onChipChange,
}: InventoryFilterChipsProps) {
    const t = useTranslations('Inventory');
    const translatedChips = chips.map(chip => {
        if (chip.value === 'all') return { ...chip, label: t('list.all', { defaultValue: 'All' }) }
        if (['in_stock', 'low_stock', 'out_of_stock'].includes(chip.value)) {
            return { ...chip, label: t(`status.${chip.value}`) }
        }
        return chip
    })

    return (
        <div
            className="flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4"
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            {translatedChips.map((chip) => (
                <button
                    key={chip.value}
                    onClick={() => onChipChange(chip.value)}
                    className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95",
                        activeChip === chip.value
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                >
                    {chip.label}
                    {chip.count !== undefined && (
                        <span className="ml-1.5 text-xs opacity-70">
                            {chip.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export { DEFAULT_INVENTORY_CHIPS };

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { DiscountCard } from './DiscountCard';
import { MobileDiscountCardSkeleton } from './MobileDiscountCardSkeleton';
import { DiscountsFilterChips } from './DiscountsFilterChips';
import * as Types from '@/types/workspace/store/graphql-base';
import { useTranslations } from 'next-intl';

interface Discount {
    id: string;
    code: string;
    name: string;
    method: Types.WorkspaceStoreDiscountMethodChoices;
    discountType: Types.WorkspaceStoreDiscountDiscountTypeChoices;
    status: Types.WorkspaceStoreDiscountStatusChoices;
    discountValueType: Types.WorkspaceStoreDiscountDiscountValueTypeChoices | null;
    value: any | null;
    usageCount: number;
    isActive: boolean | null;
    isExpired: boolean | null;
}

interface FilterChip {
    value: string;
    label: string;
    count?: number;
}

interface MobileDiscountsListProps {
    discounts: Discount[];
    workspaceId: string;
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    // Filter chips
    chips: FilterChip[];
    activeChip: string;
    onChipChange: (value: string) => void;
    // Selection
    selectedDiscounts: string[];
    onSelectDiscount: (discountId: string) => void;
    onLongPressDiscount: (discountId: string) => void;
    onClearSelection: () => void;
    // Loading
    isLoading?: boolean;
    // Actions
    onAddDiscount: () => void;
}

export function MobileDiscountsList({
    discounts,
    workspaceId,
    searchTerm,
    onSearchChange,
    chips,
    activeChip,
    onChipChange,
    selectedDiscounts,
    onSelectDiscount,
    onLongPressDiscount,
    onClearSelection,
    isLoading,
     onAddDiscount,
 }: MobileDiscountsListProps) {
    const t = useTranslations('Discounts');
    const isSelectionMode = selectedDiscounts.length > 0;
    const router = useRouter();

    const handleDiscountClick = (discount: Discount) => {
        if (isSelectionMode) {
            onSelectDiscount(discount.id);
            return;
        }

        let path = '';
        switch (discount.discountType) {
            case Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffProduct:
                path = `/workspace/${workspaceId}/store/discounts/${discount.id}/edit/amount-off-product`;
                break;
            case Types.WorkspaceStoreDiscountDiscountTypeChoices.BuyXGetY:
                path = `/workspace/${workspaceId}/store/discounts/${discount.id}/edit/buy-x-get-y`;
                break;
            default:
                // Fallback or generic edit
                // toast.error("Edit page not implemented for this discount type");
                return;
        }
        router.push(path);
    };

    return (
        <div className="flex flex-col gap-4 pb-32">
            {/* Search Bar & Add Button */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                     <Input
                        placeholder={t('form.bxgyCodePlaceholder')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                </div>
                <Button
                    size="icon"
                    className="rounded-full shrink-0 h-12 w-12"
                    onClick={onAddDiscount}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            {/* Filter Chips */}
            <DiscountsFilterChips
                chips={chips}
                activeChip={activeChip}
                onChipChange={onChipChange}
            />

            {/* Discounts List */}
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <MobileDiscountCardSkeleton key={i} />
                    ))}
                </div>
            ) : discounts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">{t('list.noDiscounts')}</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                        {t('list.adjustFilters')}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {discounts.map((discount) => (
                        <DiscountCard
                            key={discount.id}
                            discount={discount}
                            workspaceId={workspaceId}
                            isSelected={selectedDiscounts.includes(discount.id)}
                            isSelectionMode={isSelectionMode}
                            onSelect={onSelectDiscount}
                            onLongPress={onLongPressDiscount}
                            onClick={() => handleDiscountClick(discount)}
                        />
                    ))}
                </div>
            )}

            {/* Selection indicator */}
            {selectedDiscounts.length > 0 && (
                <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 md:hidden pointer-events-none">
                    <div className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-4 py-3 shadow-2xl pointer-events-auto">
                        <button
                            onClick={onClearSelection}
                            className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors"
                        >
                            ✕
                        </button>
                         <span className="text-sm font-medium px-2">
                            {t('list.selected', { count: selectedDiscounts.length })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

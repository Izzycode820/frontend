'use client';

import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { CategoryCard } from './CategoryCard';
import { MobileCategoryCardSkeleton } from './MobileCategoryCardSkeleton';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/shadcn-ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn-ui/select';
import { Label } from '@/components/shadcn-ui/label';
import { useTranslations } from 'next-intl';

interface Category {
    id: string;
    name: string;
    isVisible: boolean;
    isFeatured: boolean;
    productCount: number;
    featuredMedia?: {
        id: string;
        url?: string | null;
        thumbnailUrl?: string | null;
    };
}

interface MobileCategoriesListProps {
    categories: Category[];
    workspaceId: string;
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    // Selection
    selectedCategories: string[];
    onSelectCategory: (categoryId: string) => void;
    onLongPressCategory: (categoryId: string) => void;
    onClearSelection: () => void;
    // Loading
    isLoading?: boolean;
    // Actions
    onAddCategory: () => void;
    // Filters
    visibilityFilter: string | undefined;
    onVisibilityFilterChange: (value: string | undefined) => void;
    featuredFilter: string | undefined;
    onFeaturedFilterChange: (value: string | undefined) => void;
}

export function MobileCategoriesList({
    categories,
    workspaceId,
    searchTerm,
    onSearchChange,
    selectedCategories,
    onSelectCategory,
    onLongPressCategory,
    onClearSelection,
    isLoading,
    onAddCategory,
    visibilityFilter,
    onVisibilityFilterChange,
    featuredFilter,
    onFeaturedFilterChange,
}: MobileCategoriesListProps) {
    const t = useTranslations('Categories.mobile');
    const isSelectionMode = selectedCategories.length > 0;
    const activeFilterCount = [visibilityFilter, featuredFilter].filter(Boolean).length;

    const handleClearFilters = () => {
        onVisibilityFilterChange(undefined);
        onFeaturedFilterChange(undefined);
    };

    return (
        <div className="flex flex-col gap-4 pb-32">
            {/* Search Bar & Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                </div>

                {/* Filter Sheet Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl shrink-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative"
                        >
                            <Filter className="h-5 w-5" />
                            {activeFilterCount > 0 && (
                                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px] p-0">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="p-6 pb-2 text-left">
                                <SheetTitle className="text-xl">{t('filters')}</SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                                {/* Visibility Filter */}
                                <div className="space-y-2">
                                    <Label>{t('visibility')}</Label>
                                    <Select
                                        value={visibilityFilter || 'all'}
                                        onValueChange={(val) => onVisibilityFilterChange(val === 'all' ? undefined : val)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={t('allVisibility')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('allVisibility')}</SelectItem>
                                            <SelectItem value="visible">{t('visible')}</SelectItem>
                                            <SelectItem value="hidden">{t('hidden')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Featured Filter */}
                                <div className="space-y-2">
                                    <Label>{t('featured')}</Label>
                                    <Select
                                        value={featuredFilter || 'all'}
                                        onValueChange={(val) => onFeaturedFilterChange(val === 'all' ? undefined : val)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={t('allCategories')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('allCategories')}</SelectItem>
                                            <SelectItem value="featured">{t('featuredOnly')}</SelectItem>
                                            <SelectItem value="not-featured">{t('notFeatured')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <SheetFooter className="p-6 border-t mt-auto">
                                <div className="flex w-full gap-3">
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="flex-1 h-12" onClick={handleClearFilters}>
                                            {t('clearAll')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetTrigger asChild>
                                        <Button className="flex-1 h-12">
                                            {t('viewResults')}
                                        </Button>
                                    </SheetTrigger>
                                </div>
                            </SheetFooter>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Add Category Button */}
                <Button
                    size="icon"
                    className="rounded-full shrink-0"
                    onClick={onAddCategory}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>



            {/* Categories List */}
            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <MobileCategoryCardSkeleton key={i} />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">{t('noCategoriesFound')}</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                        {t('adjustSearch')}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {categories.map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            workspaceId={workspaceId}
                            isSelected={selectedCategories.includes(category.id)}
                            isSelectionMode={isSelectionMode}
                            onSelect={onSelectCategory}
                            onLongPress={onLongPressCategory}
                        />
                    ))}
                </div>
            )}

            {/* Selection indicator */}
            {selectedCategories.length > 0 && (
                <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 md:hidden pointer-events-none">
                    <div className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-4 py-3 shadow-2xl pointer-events-auto">
                        <button
                            onClick={onClearSelection}
                            className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors"
                        >
                            ✕
                        </button>
                        <span className="text-sm font-medium px-2">
                            {t('selectedCount', { count: selectedCategories.length })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

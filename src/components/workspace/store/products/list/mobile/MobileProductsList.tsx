'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { useTranslations } from 'next-intl';
import { ProductCard } from './ProductCard';
import { MobileProductCardSkeleton } from './MobileProductCardSkeleton';
import { ProductsFilterChips } from './ProductsFilterChips';
import { MobileProductsActionBar } from './MobileProductsActionBar';
import { Button } from '@/components/shadcn-ui/button';
import { Filter, Plus, X } from 'lucide-react';
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
import {
    PRODUCT_STATUS_OPTIONS
} from '../constants';

interface Product {
    id: string;
    name: string;
    status: 'published' | 'archived';
    price: number;
    inventory: number;
    category: string;
    type: string;
    vendor: string;
    featuredMedia?: {
        thumbnailUrl?: string;
        url?: string;
    };
}

interface FilterChip {
    value: string;
    label: string;
    count?: number;
}

interface MobileProductsListProps {
    products: Product[];
    workspaceId: string;
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    // Filter chips (Deprecated in favor of full filter sheet, but kept for compatibility if needed)
    chips?: FilterChip[];
    activeChip?: string;
    onChipChange?: (value: string) => void;

    // Filters
    statusFilter?: string;
    onStatusFilterChange?: (value: string) => void;
    categoryFilter?: string;
    onCategoryFilterChange?: (value: string) => void;
    categories?: { value: string; label: string }[];

    // Selection
    selectedProducts: string[];
    onSelectProduct: (productId: string) => void;
    onLongPressProduct: (productId: string) => void;
    onClearSelection: () => void;
    // Bulk actions
    onBulkArchive: () => void;
    onBulkDelete: () => void;
    onBulkDuplicate?: () => void;
    onBulkExport?: () => void;
    // Row actions
    onEdit?: (productId: string) => void;
    onView?: (productId: string) => void;
    onDuplicate?: (productId: string) => void;
    onDelete?: (productId: string) => void;
    onCategoryUpdate?: () => void;
    // Actions
    onAddProduct?: () => void;
    // Loading
    isLoading?: boolean;
}

export function MobileProductsList({
    products,
    workspaceId,
    searchTerm,
    onSearchChange,
    chips,
    activeChip,
    onChipChange,
    statusFilter,
    onStatusFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    categories = [],
    selectedProducts,
    onSelectProduct,
    onLongPressProduct,
    onClearSelection,
    onBulkArchive,
    onBulkDelete,
    onBulkDuplicate,
    onBulkExport,
    onEdit,
    onView,
    onDuplicate,
    onDelete,
    onCategoryUpdate,
    onAddProduct,
    isLoading,
}: MobileProductsListProps) {
    const t = useTranslations('Products');
    const activeFilterCount = [statusFilter, categoryFilter].filter(Boolean).length;

    const handleClearFilters = () => {
        onStatusFilterChange?.('');
        onCategoryFilterChange?.('');
    };
    return (
        <div className="flex flex-col gap-4 pb-32">
            {/* Search Bar & Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                        placeholder={t('filters.searchPlaceholder')}
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
                                <SheetTitle className="text-xl">{t('filters.filters')}</SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                                {/* Status Filter */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">{t('filters.status')}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={!statusFilter ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onStatusFilterChange?.('')}
                                            className="rounded-full"
                                        >
                                            {t('filters.allStatuses')}
                                        </Button>
                                        {PRODUCT_STATUS_OPTIONS.map((opt) => (
                                            <Button
                                                key={opt.value}
                                                variant={statusFilter === opt.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onStatusFilterChange?.(opt.value)}
                                                className="rounded-full"
                                            >
                                                {t(`filters.${opt.label}`)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold">{t('filters.category')}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={!categoryFilter ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onCategoryFilterChange?.('')}
                                            className="rounded-full"
                                        >
                                            {t('filters.allCategories')}
                                        </Button>
                                        {categories.map((opt) => (
                                            <Button
                                                key={opt.value}
                                                variant={categoryFilter === opt.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onCategoryFilterChange?.(opt.value)}
                                                className="rounded-full"
                                            >
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <SheetFooter className="p-6 border-t mt-auto">
                                <div className="flex w-full gap-3">
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="flex-1 h-12" onClick={handleClearFilters}>
                                            {t('filters.clearAll')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetTrigger asChild>
                                        <Button className="flex-1 h-12">
                                            {t('filters.viewResults')}
                                        </Button>
                                    </SheetTrigger>
                                </div>
                            </SheetFooter>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Add Product Button */}
                <Button
                    size="icon"
                    className="rounded-full shrink-0"
                    onClick={onAddProduct}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            {/* Active Filters Summary (Optional - replacing chips?) */}
            {/* Keeping chips for now if passed, but typically we might hide them if using sheet exclusively */}
            {activeFilterCount > 0 && (
                <div className="flex gap-2 flex-wrap px-1">
                    {statusFilter && (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            {t('filters.status')}: {t(`filters.${PRODUCT_STATUS_OPTIONS.find(o => o.value === statusFilter)?.label || statusFilter}`)}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => onStatusFilterChange?.('')} />
                        </div>
                    )}
                    {categoryFilter && (
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            {t('filters.category')}: {categories.find(o => o.value === categoryFilter)?.label || categoryFilter}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => onCategoryFilterChange?.('')} />
                        </div>
                    )}
                    <div className="text-muted-foreground text-xs py-1 px-2" onClick={handleClearFilters}>
                        {t('filters.clearAll')}
                    </div>
                </div>
            )}

            {/* Filter Chips (Legacy support if needed, but we can likely remove) */}
            {chips && chips.length > 0 && (
                <ProductsFilterChips
                    chips={chips}
                    activeChip={activeChip || 'all'}
                    onChipChange={onChipChange || (() => { })}
                />
            )}

            {/* Products List */}
            {isLoading && products.length === 0 ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <MobileProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center h-[60vh]">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
                        <Search className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">{t('noProducts')}</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1 max-w-[200px]">
                        {t('adjustFilters')}
                    </p>
                    <Button variant="outline" className="mt-6" onClick={handleClearFilters}>
                        {t('filters.clearAll')}
                    </Button>
                    {/* Empty State Add Button */}
                    <div className="mt-8">
                        <Button onClick={onAddProduct}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('addProduct')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            workspaceId={workspaceId}
                            isSelected={selectedProducts.includes(product.id)}
                            isSelectionMode={selectedProducts.length > 0}
                            onSelect={onSelectProduct}
                            onLongPress={onLongPressProduct}
                            onEdit={onEdit}
                            onView={onView}
                            onDuplicate={onDuplicate}
                            onDelete={onDelete}
                            onCategoryUpdate={onCategoryUpdate}
                        />
                    ))}
                </div>
            )}

            {/* Mobile Action Bar (fixed position) */}
            <MobileProductsActionBar
                selectedCount={selectedProducts.length}
                selectedProductIds={selectedProducts}
                onCancel={onClearSelection}
                onArchive={onBulkArchive}
                onDelete={onBulkDelete}
                onDuplicate={onBulkDuplicate}
                onExport={onBulkExport}
                onCategoryUpdate={onCategoryUpdate}
            />


        </div>
    );
}

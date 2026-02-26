'use client';

import React from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/shadcn-ui/sheet';
import { OrderCard } from './OrderCard';
import { MobileOrderCardSkeleton } from './MobileOrderCardSkeleton';
import { OrdersFilterChips } from './OrdersFilterChips';
import { MobileOrdersActionBar } from './MobileOrdersActionBar';
import type { GetOrdersQuery } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrders.generated';
import Link from 'next/link';

type OrderNode = NonNullable<
    NonNullable<
        NonNullable<GetOrdersQuery['orders']>['edges'][number]
    >['node']
>;

interface FilterChip {
    value: string;
    label: string;
    count?: number;
}

interface MobileOrdersListProps {
    orders: OrderNode[];
    workspaceId: string;
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    // Filter chips
    activeChip: string;
    onChipChange: (value: string) => void;
    // Selection
    selectedOrders: string[];
    onSelectOrder: (orderId: string) => void;
    onLongPressOrder: (orderId: string) => void;
    onClearSelection: () => void;
    // Bulk actions
    onBulkArchive: () => void;
    onBulkMarkAsPaid: () => void;
    onBulkCancel: () => void;
    onBulkStatusUpdate: (status: string, label?: string) => void;
    // Loading
    isLoading?: boolean;
    // Filters
    paymentStatus: string | null;
    onPaymentStatusChange: (value: string | null) => void;
    paymentMethod: string | null;
    onPaymentMethodChange: (value: string | null) => void;
    orderSource: string | null;
    onOrderSourceChange: (value: string | null) => void;
    shippingRegion: string | null;
    onShippingRegionChange: (value: string | null) => void;
}

export function MobileOrdersList({
    orders,
    workspaceId,
    searchTerm,
    onSearchChange,
    activeChip,
    onChipChange,
    selectedOrders,
    onSelectOrder,
    onLongPressOrder,
    onClearSelection,
    onBulkArchive,
    onBulkMarkAsPaid,
    onBulkCancel,
    onBulkStatusUpdate,
    isLoading,
    paymentStatus,
    onPaymentStatusChange,
    paymentMethod,
    onPaymentMethodChange,
    orderSource,
    onOrderSourceChange,
    shippingRegion,
    onShippingRegionChange,
}: MobileOrdersListProps) {
    const t = useTranslations('Orders.mobile');
    const tList = useTranslations('Orders.list');
    const tFilters = useTranslations('Orders.filters');
    const tBadges = useTranslations('Orders.badges');
    const tTable = useTranslations('Orders.table');

    const PAYMENT_STATUSES = [
        { value: 'PAID', label: tBadges('paid') },
        { value: 'PENDING', label: tBadges('pending') },
        { value: 'FAILED', label: tBadges('failed') },
        { value: 'REFUNDED', label: tBadges('refunded') },
    ];

    const PAYMENT_METHODS = [
        { value: 'CASH_ON_DELIVERY', label: tTable('methods.cash_on_delivery') },
        { value: 'MOBILE_MONEY', label: tFilters('mobileMoney') },
        { value: 'BANK_TRANSFER', label: tFilters('bankTransfer') },
        { value: 'CARD', label: tFilters('card') },
    ];

    const ORDER_SOURCES = [
        { value: 'WHATSAPP', label: tTable('channels.whatsapp') },
        { value: 'MANUAL', label: tTable('channels.manual') },
        { value: 'WEB', label: tTable('channels.web') },
    ];

    const CAMEROON_REGIONS = [
        { value: 'CENTRE', label: tFilters('regions.centre') },
        { value: 'LITTORAL', label: tFilters('regions.littoral') },
        { value: 'WEST', label: tFilters('regions.west') },
        { value: 'NORTHWEST', label: tFilters('regions.northwest') },
        { value: 'SOUTHWEST', label: tFilters('regions.southwest') },
        { value: 'ADAMAWA', label: tFilters('regions.adamawa') },
        { value: 'EAST', label: tFilters('regions.east') },
        { value: 'FAR_NORTH', label: tFilters('regions.far_north') },
        { value: 'NORTH', label: tFilters('regions.north') },
        { value: 'SOUTH', label: tFilters('regions.south') },
    ];
    const isSelectionMode = selectedOrders.length > 0;
    const hasActiveFilters = paymentStatus || paymentMethod || orderSource || shippingRegion;

    const clearFilters = () => {
        onPaymentStatusChange(null);
        onPaymentMethodChange(null);
        onOrderSourceChange(null);
        onShippingRegionChange(null);
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
                        className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-none focus-visible:ring-0"
                    />
                </div>

                {/* Filter Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-12 w-12 rounded-xl shrink-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative",
                                hasActiveFilters && "text-primary border-primary"
                            )}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                            {hasActiveFilters && (
                                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-[20px] p-0">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="p-6 pb-2 text-left">
                                <SheetTitle className="text-xl">{t('filters')}</SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                                {/* Payment Status */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold">{tFilters('paymentStatus')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={!paymentStatus ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onPaymentStatusChange(null)}
                                            className="rounded-full"
                                        >
                                            {tFilters('allStatuses')}
                                        </Button>
                                        {PAYMENT_STATUSES.map((status) => (
                                            <Button
                                                key={status.value}
                                                variant={paymentStatus === status.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onPaymentStatusChange(status.value)}
                                                className="rounded-full"
                                            >
                                                {status.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold">{tFilters('paymentMethod')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={!paymentMethod ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onPaymentMethodChange(null)}
                                            className="rounded-full"
                                        >
                                            {tFilters('allMethods')}
                                        </Button>
                                        {PAYMENT_METHODS.map((method) => (
                                            <Button
                                                key={method.value}
                                                variant={paymentMethod === method.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onPaymentMethodChange(method.value)}
                                                className="rounded-full"
                                            >
                                                {method.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Source */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold">{tFilters('orderSource')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={!orderSource ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onOrderSourceChange(null)}
                                            className="rounded-full"
                                        >
                                            {tFilters('allSources')}
                                        </Button>
                                        {ORDER_SOURCES.map((source) => (
                                            <Button
                                                key={source.value}
                                                variant={orderSource === source.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onOrderSourceChange(source.value)}
                                                className="rounded-full"
                                            >
                                                {source.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Region */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold">{tFilters('shippingRegion')}</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={!shippingRegion ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onShippingRegionChange(null)}
                                            className="rounded-full"
                                        >
                                            {tFilters('allRegions')}
                                        </Button>
                                        {CAMEROON_REGIONS.map((region) => (
                                            <Button
                                                key={region.value}
                                                variant={shippingRegion === region.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onShippingRegionChange(region.value)}
                                                className="rounded-full"
                                            >
                                                {region.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t mt-auto">
                                <div className="flex w-full gap-3">
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="flex-1 h-12" onClick={clearFilters}>
                                            {tFilters('clearAll')}
                                        </Button>
                                    </SheetTrigger>
                                    <SheetTrigger asChild>
                                        <Button className="flex-1 h-12">
                                            {t('viewResults')}
                                        </Button>
                                    </SheetTrigger>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Add Order Button */}
                <Button size="icon" className="rounded-full shrink-0" asChild>
                    <Link href={`/workspace/${workspaceId}/store/orders/add`}>
                        <Plus className="h-5 w-5" />
                    </Link>
                </Button>
            </div>

            {/* Filter Chips */}
            <OrdersFilterChips
                activeTab={activeChip}
                onTabChange={onChipChange}
            />

            {/* Orders List */}
            {isLoading && orders.length === 0 ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <MobileOrderCardSkeleton key={i} />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 px-6">
                    <div className="bg-muted rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-lg font-semibold">{tList('noOrders')}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        {tList('adjustFilters')}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            workspaceId={workspaceId}
                            isSelected={selectedOrders.includes(order.id)}
                            isSelectionMode={selectedOrders.length > 0}
                            onSelect={onSelectOrder}
                            onLongPress={onLongPressOrder}
                        />
                    ))}
                    {/* Show skeletons at bottom if loading more pages */}
                    {isLoading && orders.length > 0 && (
                        <div className="flex flex-col gap-3 pt-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <MobileOrderCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Action Bar (fixed position) */}
            <MobileOrdersActionBar
                selectedCount={selectedOrders.length}
                onClearSelection={onClearSelection}
                onBulkArchive={onBulkArchive}
                onBulkMarkAsPaid={onBulkMarkAsPaid}
                onBulkCancel={onBulkCancel}
                onBulkStatusUpdate={onBulkStatusUpdate}
            />
        </div>
    );
}

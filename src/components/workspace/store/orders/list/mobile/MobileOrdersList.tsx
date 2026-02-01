'use client';

import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/shadcn-ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn-ui/select';
import { OrderCard } from './OrderCard';
import { MobileOrderCardSkeleton } from './MobileOrderCardSkeleton';
import { OrdersFilterChips } from './OrdersFilterChips';
import { MobileOrdersActionBar } from './MobileOrdersActionBar';
import {
    PAYMENT_STATUSES,
    PAYMENT_METHODS,
    ORDER_SOURCES,
    CAMEROON_REGIONS
} from '../OrdersFilters';
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
    chips: FilterChip[];
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
    onBulkMarkAsDelivered?: () => void;
    onBulkMarkOnHold?: () => void;
    onBulkMarkProcessing?: () => void;
    onBulkMarkAsNotDelivered?: () => void;
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
    chips,
    activeChip,
    onChipChange,
    selectedOrders,
    onSelectOrder,
    onLongPressOrder,
    onClearSelection,
    onBulkArchive,
    onBulkMarkAsPaid,
    onBulkCancel,
    onBulkMarkAsDelivered,
    onBulkMarkOnHold,
    onBulkMarkProcessing,
    onBulkMarkAsNotDelivered,
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
            {/* Search Bar */}
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                </div>

                {/* Filter Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className={hasActiveFilters ? "text-primary border-primary" : ""}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                        <SheetHeader className="mb-4">
                            <div className="flex items-center justify-between">
                                <SheetTitle>Filters</SheetTitle>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-xs h-auto py-1"
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>
                        </SheetHeader>

                        <div className="space-y-6 overflow-y-auto pb-8 h-full">
                            {/* Payment Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select
                                    value={paymentStatus || 'all'}
                                    onValueChange={(value) => onPaymentStatusChange(value === 'all' ? null : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        {PAYMENT_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select
                                    value={paymentMethod || 'all'}
                                    onValueChange={(value) => onPaymentMethodChange(value === 'all' ? null : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All methods</SelectItem>
                                        {PAYMENT_METHODS.map((method) => (
                                            <SelectItem key={method.value} value={method.value}>
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Order Source */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Order Source</label>
                                <Select
                                    value={orderSource || 'all'}
                                    onValueChange={(value) => onOrderSourceChange(value === 'all' ? null : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All sources" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All sources</SelectItem>
                                        {ORDER_SOURCES.map((source) => (
                                            <SelectItem key={source.value} value={source.value}>
                                                {source.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Shipping Region */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Shipping Region</label>
                                <Select
                                    value={shippingRegion || 'all'}
                                    onValueChange={(value) => onShippingRegionChange(value === 'all' ? null : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All regions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All regions</SelectItem>
                                        {CAMEROON_REGIONS.map((region) => (
                                            <SelectItem key={region.value} value={region.value}>
                                                {region.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                chips={chips}
                activeChip={activeChip}
                onChipChange={onChipChange}
            />

            {/* Orders List */}
            {isLoading && orders.length === 0 ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <MobileOrderCardSkeleton key={i} />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">No orders found</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                        Try adjusting your filters
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
                onCancel={onClearSelection}
                onArchive={onBulkArchive}
                onMarkAsPaid={onBulkMarkAsPaid}
                onBulkCancel={onBulkCancel}
                onMarkAsDelivered={onBulkMarkAsDelivered}
                onMarkOnHold={onBulkMarkOnHold}
                onMarkProcessing={onBulkMarkProcessing}
                onMarkAsNotDelivered={onBulkMarkAsNotDelivered}
            />
        </div>
    );
}

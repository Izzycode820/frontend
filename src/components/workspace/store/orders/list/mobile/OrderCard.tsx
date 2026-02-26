'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { formatCurrency } from '@/utils/currency';
import type { GetOrdersQuery } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrders.generated';

type OrderNode = NonNullable<
    NonNullable<
        NonNullable<GetOrdersQuery['orders']>['edges'][number]
    >['node']
>;

interface OrderCardProps {
    order: OrderNode;
    workspaceId: string;
    isSelected: boolean;
    isSelectionMode: boolean; // NEW: Are we in multi-select mode?
    onSelect: (orderId: string) => void;
    onLongPress: (orderId: string) => void;
}

export function OrderCard({
    order,
    workspaceId,
    isSelected,
    isSelectionMode,
    onSelect,
    onLongPress,
}: OrderCardProps) {
    const t = useTranslations('Orders.table');
    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
    const [isPressed, setIsPressed] = React.useState(false);

    const handleTouchStart = () => {
        setIsPressed(true);
        longPressTimer.current = setTimeout(() => {
            onLongPress(order.id);
        }, 500); // 500ms for long press
    };

    const handleTouchEnd = () => {
        setIsPressed(false);
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // If in selection mode, toggle selection instead of navigating
        if (isSelectionMode) {
            e.preventDefault();
            onSelect(order.id);
        }
    };

    const getChannelIcon = (orderSource: string) => {
        switch (orderSource?.toLowerCase()) {
            case 'whatsapp':
                return '💬';
            case 'web':
                return '🌐';
            case 'admin':
                return '👤';
            default:
                return '📦';
        }
    };

    return (
        <Link
            href={`/workspace/${workspaceId}/store/orders/${order.id}`}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 active:scale-[0.99]",
                isSelected
                    ? "bg-primary/10 border-2 border-primary ring-1 ring-primary/20"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
                isPressed && !isSelected && "bg-zinc-50 dark:bg-zinc-800/50"
            )}
        >
            {/* Left Side: Channel Icon (matching product thumbnail size) */}
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    <span className="text-xl">{getChannelIcon(order.orderSource)}</span>
                </div>
            </div>

            {/* Middle: Order Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm truncate">
                        #{order.orderNumber}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase">
                        {order.orderSource}
                    </span>
                </div>
                <div className="flex flex-col">
                    {order.customerName ? (
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {order.customerName}
                        </span>
                    ) : (
                        <span className="text-sm font-medium text-muted-foreground truncate">
                            {t('noCustomer')}
                        </span>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-xs text-zinc-500">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Side: Amount + Fulfillment Status */}
            <div className="flex-shrink-0 text-right space-y-1">
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {order.currency} {formatCurrency(order.totalAmount)}
                </div>
                <OrderStatusBadge status={order.status} type="fulfillment" />
                <div className="text-[10px] text-zinc-400">
                    {t('itemCount', { count: order.itemCount ?? 0 })}
                </div>
            </div>
        </Link>
    );
}

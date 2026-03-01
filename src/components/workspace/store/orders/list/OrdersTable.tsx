import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { Button } from '@/components/shadcn-ui/button';
import { MoreHorizontal, Archive, ArchiveRestore, RefreshCw } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency } from '@/utils/currency';
import type { GetOrdersQuery } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrders.generated';

type OrderNode = NonNullable<
  NonNullable<
    NonNullable<GetOrdersQuery['orders']>['edges'][number]
  >['node']
>;

interface OrdersTableProps {
  orders: OrderNode[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string) => void;
  onSelectAll: (selected: boolean) => void;
  workspaceId: string;
  onArchiveOrder?: (orderId: string) => void;
  onUnarchiveOrder?: (orderId: string) => void;
  onSyncPayment?: (orderId: string) => void;
  isSyncing?: boolean;
  totalCount: number;
}

export function OrdersTable({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  workspaceId,
  onArchiveOrder,
  onUnarchiveOrder,
  onSyncPayment,
  isSyncing,
  totalCount,
}: OrdersTableProps) {
  const t = useTranslations('Orders.table');
  const tActions = useTranslations('Orders.actions');
  const allSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const someSelected = selectedOrders.length > 0 && selectedOrders.length < orders.length;

  const getChannelBadge = (orderSource: string) => {
    switch (orderSource?.toLowerCase()) {
      case 'whatsapp':
        return <span className="text-xs text-green-600 font-medium">{t('channels.whatsapp')}</span>;
      case 'admin':
        return <span className="text-xs text-gray-600 font-medium">{t('channels.admin')}</span>;
      case 'web':
        return <span className="text-xs text-blue-600 font-medium">{t('channels.web')}</span>;
      default:
        return <span className="text-xs text-gray-600 font-medium">{orderSource}</span>;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label={tActions('selectedCount', { count: totalCount })} // Wait totalCount not in scope, using orders.length? Actually the prop is OrdersTableProps, orders might be just current page.
                className={someSelected ? 'data-[state=checked]:bg-primary' : ''}
              />
            </TableHead>
            <TableHead>{t('order')}</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('channel')}</TableHead>
            <TableHead className="text-right">{t('total')}</TableHead>
            <TableHead>{t('paymentStatus')}</TableHead>
            <TableHead>{t('fulfillmentStatus')}</TableHead>
            <TableHead className="text-right">{t('items')}</TableHead>
            <TableHead>{t('paymentMethod')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                {t('noOrders')}
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => onSelectOrder(order.id)}
                    aria-label={`Select order ${order.orderNumber}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/workspace/${workspaceId}/store/orders/${order.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : '-'}
                </TableCell>
                <TableCell>
                  {order.customerName ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t('noCustomer')}</span>
                  )}
                </TableCell>
                <TableCell>
                  {getChannelBadge(order.orderSource)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {order.currency} {formatCurrency(order.totalAmount)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.paymentStatus} type="payment" />
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} type="fulfillment" />
                </TableCell>
                <TableCell className="text-right text-sm">
                  {t('itemCount', { count: order.itemCount ?? 0 })}
                </TableCell>
                <TableCell className="text-sm">
                  {order.isCashOnDelivery ? (
                    <span className="text-xs">{t('methods.cash_on_delivery')}</span>
                  ) : (
                    <span className="text-xs capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{tActions('openMenu')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {order.canBeArchived && onArchiveOrder && (
                        <DropdownMenuItem onClick={() => onArchiveOrder(order.id)}>
                          <Archive className="mr-2 h-4 w-4" />
                          {tActions('archive')}
                        </DropdownMenuItem>
                      )}
                      {order.canBeUnarchived && onUnarchiveOrder && (
                        <DropdownMenuItem onClick={() => onUnarchiveOrder(order.id)}>
                          <ArchiveRestore className="mr-2 h-4 w-4" />
                          {tActions('unarchive')}
                        </DropdownMenuItem>
                      )}
                       {(order.paymentStatus as string) === 'PENDING' && onSyncPayment && (
                        <DropdownMenuItem onClick={() => onSyncPayment(order.id)} disabled={isSyncing}>
                          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          {tActions('syncPayment')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

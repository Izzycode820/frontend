import { useTranslations } from 'next-intl';
import { ArrowLeft, MoreVertical, Printer } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { OrderStatusBadge } from '../list/OrderStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface OrderDetailsHeaderProps {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  orderSource: string;
  workspaceId: string;
  onEdit: () => void;
  onRefund: () => void;
  onCancel: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  canBeCancelled: boolean;
  canBeRefunded: boolean;
  canBeArchived: boolean;
  canBeUnarchived: boolean;
  canMarkAsPaid?: boolean;
  onMarkAsPaid?: () => void;
}

export function OrderDetailsHeader({
  orderNumber,
  status,
  paymentStatus,
  createdAt,
  orderSource,
  workspaceId,
  onEdit,
  onRefund,
  onCancel,
  onArchive,
  onUnarchive,
  canBeCancelled,
  canBeRefunded,
  canBeArchived,
  canBeUnarchived,
  canMarkAsPaid,
  onMarkAsPaid,
}: OrderDetailsHeaderProps) {
  const t = useTranslations('Orders.details.header');
  return (
    <div className="border-b bg-background">
      <div className="px-4 lg:px-6 py-4">
        {/* Top Row: Back Button + Title + Statuses */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/workspace/${workspaceId}/store/orders`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 sm:ml-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold">#{orderNumber}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <OrderStatusBadge status={paymentStatus} type="payment" />
            <OrderStatusBadge status={status} type="fulfillment" />
          </div>
        </div>

        {/* Bottom Row: Date + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {t('placedOn')} {new Date(createdAt).toLocaleDateString()} {t('at')} {new Date(createdAt).toLocaleTimeString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('ago', { time: formatDistanceToNow(new Date(createdAt)) })} {t('from')} {orderSource}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Desktop: Show Primary Actions */}
            <div className="hidden sm:flex gap-2">
              {canMarkAsPaid && (
                <Button onClick={onMarkAsPaid} size="sm">
                  {t('markAsPaid')}
                </Button>
              )}
              {canBeRefunded && (
                <Button variant="outline" onClick={onRefund} size="sm">
                  {t('refund')}
                </Button>
              )}
              <Button variant="outline" onClick={onEdit} size="sm">
                {t('edit')}
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Printer className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile: Consolidated Menu */}
            <div className="sm:hidden flex gap-2">
              {canMarkAsPaid && (
                <Button onClick={onMarkAsPaid} size="sm" className="flex-1">
                  {t('markPaidShort')}
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size={canMarkAsPaid ? "icon" : "default"} className="sm:w-auto">
                  <span className="sr-only sm:not-sr-only sm:mr-2">{t('moreActions')}</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Mobile-only menu items */}
                <div className="sm:hidden">
                  <DropdownMenuItem onClick={onEdit}>{t('edit')}</DropdownMenuItem>
                  {canBeRefunded && (
                    <DropdownMenuItem onClick={onRefund}>{t('refund')}</DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="gap-2">
                    <Printer className="h-4 w-4" /> {t('print')}
                  </DropdownMenuItem>
                </div>

                <DropdownMenuItem>{t('duplicate')}</DropdownMenuItem>
                {canBeArchived && (
                  <DropdownMenuItem onClick={onArchive}>{t('archive')}</DropdownMenuItem>
                )}
                {canBeUnarchived && (
                  <DropdownMenuItem onClick={onUnarchive}>{t('unarchive')}</DropdownMenuItem>
                )}
                {canBeCancelled && (
                  <DropdownMenuItem onClick={onCancel} className="text-destructive">
                    {t('cancel')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

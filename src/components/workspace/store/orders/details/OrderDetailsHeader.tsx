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
  canBeCancelled: boolean;
  canBeRefunded: boolean;
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
  canBeCancelled,
  canBeRefunded,
}: OrderDetailsHeaderProps) {
  return (
    <div className="border-b bg-background sticky top-0 z-10">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/workspace/${workspaceId}/store/orders`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">#{orderNumber}</h1>
            <OrderStatusBadge status={paymentStatus} type="payment" />
            <OrderStatusBadge status={status} type="fulfillment" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground ml-12">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })} from {orderSource}
          </p>
          <div className="flex gap-2">
            {canBeRefunded && (
              <Button variant="outline" onClick={onRefund}>
                Refund
              </Button>
            )}
            <Button variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More actions
                  <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate order</DropdownMenuItem>
                <DropdownMenuItem>Archive order</DropdownMenuItem>
                {canBeCancelled && (
                  <DropdownMenuItem onClick={onCancel} className="text-destructive">
                    Cancel order
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

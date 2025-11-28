import { Badge } from '@/components/shadcn-ui/badge';

interface OrderStatusBadgeProps {
  status: string;
  type: 'payment' | 'fulfillment' | 'order';
}

export function OrderStatusBadge({ status, type }: OrderStatusBadgeProps) {
  const getStatusConfig = () => {
    if (type === 'payment') {
      switch (status?.toLowerCase()) {
        case 'paid':
          return { label: 'Paid', variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' };
        case 'pending':
          return { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
        case 'unpaid':
          return { label: 'Unpaid', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' };
        case 'refunded':
          return { label: 'Refunded', variant: 'outline' as const, className: 'text-gray-600' };
        default:
          return { label: status || 'Unknown', variant: 'outline' as const, className: '' };
      }
    }

    if (type === 'fulfillment') {
      switch (status?.toLowerCase()) {
        case 'unfulfilled':
          return { label: 'Unfulfilled', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
        case 'fulfilled':
          return { label: 'Fulfilled', variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' };
        case 'partially_fulfilled':
          return { label: 'Partially fulfilled', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
        case 'cancelled':
          return { label: 'Cancelled', variant: 'destructive' as const, className: '' };
        default:
          return { label: status || 'Unknown', variant: 'outline' as const, className: '' };
      }
    }

    // Order status
    switch (status?.toLowerCase()) {
      case 'open':
        return { label: 'Open', variant: 'default' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
      case 'archived':
        return { label: 'Archived', variant: 'secondary' as const, className: '' };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'destructive' as const, className: '' };
      default:
        return { label: status || 'Unknown', variant: 'outline' as const, className: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

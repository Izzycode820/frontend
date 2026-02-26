import { Badge } from '@/components/shadcn-ui/badge';
import { useTranslations } from 'next-intl';

interface OrderStatusBadgeProps {
  status: string;
  type: 'payment' | 'fulfillment' | 'order';
}

export function OrderStatusBadge({ status, type }: OrderStatusBadgeProps) {
  const t = useTranslations('Orders.badges');

  const getStatusConfig = () => {
    if (type === 'payment') {
      switch (status?.toLowerCase()) {
        case 'paid':
          return { label: t('paid'), variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30' };
        case 'pending':
          return { label: t('pending'), variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' };
        case 'unpaid':
          return { label: t('unpaid'), variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' };
        case 'refunded':
          return { label: t('refunded'), variant: 'outline' as const, className: 'text-gray-600 dark:text-gray-400' };
        case 'failed':
          return { label: t('failed'), variant: 'destructive' as const, className: '' };
        default:
          return { label: status || t('unknown'), variant: 'outline' as const, className: '' };
      }
    }

    if (type === 'fulfillment') {
      switch (status?.toLowerCase()) {
        case 'unfulfilled':
          return { label: t('unfulfilled'), variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' };
        case 'fulfilled':
          return { label: t('fulfilled'), variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30' };
        case 'partially_fulfilled':
          return { label: t('partially_fulfilled'), variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30' };
        case 'cancelled':
          return { label: t('cancelled'), variant: 'destructive' as const, className: '' };
        default:
          return { label: status || t('unknown'), variant: 'outline' as const, className: '' };
      }
    }

    // Order status
    switch (status?.toLowerCase()) {
      case 'open':
        return { label: t('open'), variant: 'default' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30' };
      case 'archived':
        return { label: t('archived'), variant: 'secondary' as const, className: '' };
      case 'cancelled':
        return { label: t('cancelled'), variant: 'destructive' as const, className: '' };
      default:
        return { label: status || t('unknown'), variant: 'outline' as const, className: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

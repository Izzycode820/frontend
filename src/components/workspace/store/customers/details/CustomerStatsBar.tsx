import { Card, CardContent } from '@/components/shadcn-ui/card';
import { formatCurrency } from '@/utils/currency';
import { useTranslations } from 'next-intl';

interface CustomerStatsBarProps {
  totalSpent: string;
  totalOrders: number;
  customerSince: string;
  rfmGroup: string;
}

export function CustomerStatsBar({
  totalSpent,
  totalOrders,
  customerSince,
  rfmGroup,
}: CustomerStatsBarProps) {
  const t = useTranslations('Customers');

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('details.stats.amountSpent')}</p>
              <p className="text-base font-medium">FCFA {formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('details.stats.orders')}</p>
              <p className="text-base font-medium">{totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('details.stats.customerSince')}</p>
              <p className="text-base font-medium">{customerSince}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('details.stats.rfmGroup')}</p>
              <p className="text-base font-medium">{rfmGroup}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

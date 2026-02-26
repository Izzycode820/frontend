import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface LastOrderCardProps {
  totalOrders: number;
  lastOrderAt?: string | null;
  onCreateOrder: () => void;
}

export function LastOrderCard({
  totalOrders,
  lastOrderAt,
  onCreateOrder,
}: LastOrderCardProps) {
  const t = useTranslations('Customers');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('details.lastOrder.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {totalOrders === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('details.lastOrder.noOrders')}
            </p>
            <Button variant="outline" size="sm" onClick={onCreateOrder}>
              {t('details.lastOrder.createOrder')}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t('details.lastOrder.lastOrder', {
                date: lastOrderAt ? format(new Date(lastOrderAt as string), 'MMM d, yyyy') : ''
              })}
            </p>
            <Button variant="outline" size="sm" onClick={onCreateOrder}>
              {t('details.lastOrder.createOrder')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

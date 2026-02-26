'use client';

import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';

interface DiscountsEmptyStateProps {
  onAddDiscount: () => void;
}

 export function DiscountsEmptyState({ onAddDiscount }: DiscountsEmptyStateProps) {
  const t = useTranslations('Discounts');

  return (
    <Card>
       <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">{t('list.noDiscountsYet')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('list.createDesc')}
            </p>
            <Button onClick={onAddDiscount} className="mt-4">
              {t('list.create')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

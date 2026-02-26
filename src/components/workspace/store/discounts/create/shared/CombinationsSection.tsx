'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Label } from '@/components/shadcn-ui/label';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { useTranslations } from 'next-intl';

interface CombinationsSectionProps {
  canCombineWithProductDiscounts: boolean;
  canCombineWithOrderDiscounts: boolean;
  onProductDiscountsChange: (checked: boolean) => void;
  onOrderDiscountsChange: (checked: boolean) => void;
}

export function CombinationsSection({
  canCombineWithProductDiscounts,
  canCombineWithOrderDiscounts,
  onProductDiscountsChange,
  onOrderDiscountsChange,
}: CombinationsSectionProps) {
  const t = useTranslations('Discounts');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form.combinations.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Discounts (Active) */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="combine-product"
            checked={canCombineWithProductDiscounts}
            onCheckedChange={(checked) => onProductDiscountsChange(checked as boolean)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="combine-product" className="font-semibold cursor-pointer">
              {t('form.combinations.products')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('form.combinations.productsHelp')}
            </p>
          </div>
        </div>

        {/* Order Discounts (Disabled / Coming Soon) */}
        <div className="relative group">
          <div className="flex items-start space-x-2 opacity-50 blur-[1px] select-none pointer-events-none">
            <Checkbox
              id="combine-order"
              checked={canCombineWithOrderDiscounts}
              onCheckedChange={(checked) => onOrderDiscountsChange(checked as boolean)}
              disabled
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="combine-order" className="font-semibold">
                {t('form.combinations.orders')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('form.combinations.ordersHelp')}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
              {t('type.comingSoon')}
            </span>
          </div>
        </div>

        {/* Shipping Discounts (Disabled / Coming Soon) */}
        <div className="relative group">
          <div className="flex items-start space-x-2 opacity-50 blur-[1px] select-none pointer-events-none">
            <Checkbox
              id="combine-shipping"
              checked={false}
              disabled
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="combine-shipping" className="font-semibold">
                {t('form.combinations.shipping')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('form.combinations.shippingHelp')}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
              {t('type.comingSoon')}
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

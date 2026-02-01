'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Label } from '@/components/shadcn-ui/label';
import { Checkbox } from '@/components/shadcn-ui/checkbox';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Combinations</CardTitle>
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
              Product discounts
            </Label>
            <p className="text-sm text-muted-foreground">
              Each eligible item in the cart may receive up to one product discount
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
                Order discounts
              </Label>
              <p className="text-sm text-muted-foreground">
                All eligible order discounts will apply in addition to eligible product discounts
              </p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
              Coming Soon
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
                Shipping discounts
              </Label>
              <p className="text-sm text-muted-foreground">
                The largest eligible shipping discount will apply in addition to eligible product discounts
              </p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
              Coming Soon
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Label } from '@/components/shadcn-ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Separator } from '@/components/shadcn-ui/separator';
import { usePaymentCalculations } from './usePaymentCalculations';
import { formatCurrency } from '@/utils/currency';
import type { PaymentSectionProps } from './types';
export function PaymentSection({
  items,
  paymentMethod,
  onPaymentMethodChange,
}: PaymentSectionProps) {
  const t = useTranslations('Orders.form');
  const { subtotal, taxAmount, total } = usePaymentCalculations(items);

  const PAYMENT_METHODS = [
    { value: 'cash_on_delivery', label: useTranslations('Orders.table.methods')('cash_on_delivery') },
    { value: 'mobile_money', label: useTranslations('Orders.table.methods')('mobile_money') },
    { value: 'bank_transfer', label: useTranslations('Orders.table.methods')('bank_transfer') },
    { value: 'card', label: useTranslations('Orders.table.methods')('card') },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('sections.payment')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Method Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="payment-method">{t('payment.method.label')}</Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger id="payment-method">
              <SelectValue placeholder={t('payment.method.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Payment Summary */}
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('payment.summary.subtotal')}
              {items.length > 0 && (
                <span className="ml-2">
                  {t('payment.summary.itemCount', { count: items.length })}
                </span>
              )}
            </span>
            <span className="font-medium">FCFA {formatCurrency(subtotal)}</span>
          </div>

          {/* Tax (shown but 0 for now) */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('payment.summary.tax')}</span>
            <span className="text-muted-foreground">FCFA {formatCurrency(taxAmount)}</span>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t('payment.summary.total')}</span>
            <span className="font-bold text-lg">FCFA {formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

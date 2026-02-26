'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';

type PaymentBreakdownProps = {
    data: {
        mobileMoney: number | null;
        cashOnDelivery: number | null;
        card: number | null;
        whatsapp: number | null;
        bankTransfer: number | null;
    } | null;
};

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
    const t = useTranslations('Analytics');
    if (!data) {
        return null;
    }

    const methods = [
        { label: t('payments.mobileMoney'), value: data.mobileMoney },
        { label: t('payments.cashOnDelivery'), value: data.cashOnDelivery },
        { label: t('payments.card'), value: data.card },
        { label: t('payments.whatsapp'), value: data.whatsapp },
        { label: t('payments.bankTransfer'), value: data.bankTransfer },
    ].filter(m => m.value !== null);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{t('payments.title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col justify-between h-full text-sm">
                    {methods.map((method, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{method.label}</span>
                            <span className="font-medium">{method.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

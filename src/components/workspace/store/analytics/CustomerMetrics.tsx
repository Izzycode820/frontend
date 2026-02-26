'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';

type CustomerMetricsProps = {
    data: {
        newCustomers: number | null;
        returningCustomers: number | null;
        total: number | null;
        newRate: number | null;
    } | null;
};

export function CustomerMetrics({ data }: CustomerMetricsProps) {
    const t = useTranslations('Analytics');
    if (!data) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('metrics.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {data.newCustomers !== null && (
                        <div>
                            <div className="text-muted-foreground">{t('metrics.newCustomers')}</div>
                            <div className="text-2xl font-semibold">{data.newCustomers}</div>
                        </div>
                    )}
                    {data.returningCustomers !== null && (
                        <div>
                            <div className="text-muted-foreground">{t('metrics.returning')}</div>
                            <div className="text-2xl font-semibold">{data.returningCustomers}</div>
                        </div>
                    )}
                    {data.total !== null && (
                        <div>
                            <div className="text-muted-foreground">{t('metrics.total')}</div>
                            <div className="text-2xl font-semibold">{data.total}</div>
                        </div>
                    )}
                    {data.newRate !== null && (
                        <div>
                            <div className="text-muted-foreground">{t('metrics.newCustomerRate')}</div>
                            <div className="text-2xl font-semibold">{data.newRate.toFixed(1)}%</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

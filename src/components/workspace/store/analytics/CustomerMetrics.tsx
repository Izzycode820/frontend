'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';

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
    if (!data) return null;

    const total = data.total || 0;
    const newCount = data.newCustomers || 0;
    const returningCount = data.returningCustomers || 0;
    const newRate = data.newRate || 0;
    const returningRate = total > 0 ? (returningCount / total) * 100 : 0;

    return (
        <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{t('metrics.title', { fallback: 'Customer Metrics' })}</CardTitle>
                    <div className="h-[2px] w-full border-b border-dashed border-muted-foreground/30 mt-1" />
                </div>
                <Users className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-4 pb-6 justify-center gap-6">
                
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight">{total.toLocaleString()}</span>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('metrics.total', { fallback: 'Total' })}</span>
                </div>

                <div className="space-y-3">
                    {/* Progress Bar showing ratio */}
                    <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-foreground flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                            {t('metrics.newCustomers', { fallback: 'New Customers' })}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            {t('metrics.returning', { fallback: 'Returning' })}
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm" />
                        </span>
                    </div>
                    
                    <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${newRate}%` }}
                        />
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                            style={{ width: `${returningRate}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground font-medium pt-1">
                        <span>{newCount.toLocaleString()} <span className="text-xs opacity-70">({newRate.toFixed(1)}%)</span></span>
                        <span>{returningCount.toLocaleString()} <span className="text-xs opacity-70">({returningRate.toFixed(1)}%)</span></span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

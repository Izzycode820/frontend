'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';

type ConversionFunnelProps = {
    data: {
        stages: ({
            name: string;
            count: number;
            rate: number;
        } | null)[];
        metrics: {
            conversionRate: number | null;
            abandonmentRate: number | null;
            cartAbandoned: number | null;
        } | null;
    } | null;
};

export function ConversionFunnel({ data }: ConversionFunnelProps) {
    const t = useTranslations('Analytics');
    if (!data) {
        return null;
    }

    const validStages = data.stages.filter((s): s is NonNullable<typeof s> => s !== null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('funnel.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {validStages.map((stage, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{stage.name}</span>
                                <span className="font-medium">
                                    {stage.count} ({stage.rate.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${stage.rate}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {data.metrics && (
                        <div className="pt-3 mt-3 border-t space-y-2 text-sm">
                            {data.metrics.conversionRate !== null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('funnel.conversionRate')}</span>
                                    <span className="font-medium">
                                        {data.metrics.conversionRate.toFixed(2)}%
                                    </span>
                                </div>
                            )}
                            {data.metrics.abandonmentRate !== null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('funnel.abandonmentRate')}</span>
                                    <span className="font-medium">
                                        {data.metrics.abandonmentRate.toFixed(2)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

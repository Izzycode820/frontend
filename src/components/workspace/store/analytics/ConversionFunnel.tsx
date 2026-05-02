'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';

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
            trend?: number | null;
        } | null;
    } | null;
};

export function ConversionFunnel({ data }: ConversionFunnelProps) {
    const t = useTranslations('Analytics');
    if (!data) {
        return null;
    }

    const validStages = data.stages.filter((s): s is NonNullable<typeof s> => s !== null);

    const getStageLabel = (name: string) => {
        if (name.includes('Page Views') || name.includes('Sessions')) return 'Sessions';
        if (name.includes('Add')) return 'Added to cart';
        if (name.includes('Checkout')) return 'Checkout';
        if (name.includes('Order') || name.includes('Purchase')) return 'Completed';
        return name;
    };

    const chartData = validStages.map(s => ({
        name: getStageLabel(s.name),
        rate: s.rate,
        count: s.count
    }));

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('funnel.title', { fallback: 'Conversion rate breakdown' })}
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">
                        {data.metrics?.conversionRate !== null ? data.metrics?.conversionRate?.toFixed(2) : 0}%
                    </span>
                    {data.metrics?.trend && (
                        <span className={`text-sm ${data.metrics.trend > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            {data.metrics.trend > 0 ? '↑' : '↓'} {Math.abs(data.metrics.trend)}%
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 px-2 pb-6">
                <div className="h-[200px] w-full text-foreground mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: 'currentColor', fontSize: 11 }}
                                interval={0}
                            />
                            <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="rate" position="top" formatter={(val: number) => `${val.toFixed(1)}%`} style={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }} />
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#3B82F6" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

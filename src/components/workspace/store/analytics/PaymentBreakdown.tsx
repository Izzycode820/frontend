'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';

type PaymentBreakdownProps = {
    data: {
        mobileMoney: number | null;
        cashOnDelivery: number | null;
        whatsapp: number | null;
    } | null;
};

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
    const t = useTranslations('Analytics');
    if (!data) {
        return null;
    }

    const methods = [
        { label: t('payments.cashOnDelivery'), value: data.cashOnDelivery },
        { label: t('payments.mobileMoney'), value: data.mobileMoney },
        { label: t('payments.whatsapp'), value: data.whatsapp },
    ];

    const getPaymentColor = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('whatsapp')) return '#25D366'; // WhatsApp Green
        if (lower.includes('mobile money') || lower.includes('momo') || lower.includes('money')) return '#F59E0B'; // Amber
        if (lower.includes('cash') || lower.includes('livraison')) return '#3B82F6'; // Blue
        if (lower.includes('card') || lower.includes('carte')) return '#8B5CF6'; // Purple
        return '#64748B'; // Slate
    };

    const chartData = methods
        .map(m => ({ 
            name: m.label, 
            value: (m.value || 0) as number,
            fill: getPaymentColor(m.label)
        }));

    // If perfectly zero across the board, Recharts won't draw a pie, which is fine, but the legend will still show.
    if (chartData.every(d => d.value === 0)) {
        // Option to display an empty state or let it gracefully draw 0 pies.
    }
    const COLORS = [
        'hsl(var(--primary))', 
        'hsl(var(--secondary))', 
        'hsl(var(--accent))', 
        'hsl(var(--muted-foreground))',
        'hsl(var(--destructive))'
    ];

    // ... (rest of imports/types)

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{t('payments.title', { fallback: 'Sales by Channel' })}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="h-[200px] w-full relative">
                    {chartData.every(d => d.value === 0) && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm z-10 font-medium">
                            No Sales Yet
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value: number) => [`${value}%`, 'Orders']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-4 mt-4 pt-4 border-t">
                    {chartData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.fill }} />
                            <span className="font-medium text-foreground">{entry.name} <span className="text-muted-foreground font-normal ml-1">({entry.value}%)</span></span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

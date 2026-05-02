'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';
import { Maximize2 } from 'lucide-react'; // Icon reference from image

type DeviceMetrics = {
    desktop: number;
    mobile: number;
    tablet: number;
};

export function DeviceBreakdown({ data }: { data: DeviceMetrics | null | undefined }) {
    const t = useTranslations('Analytics');
    if (!data) return null;

    // Define colors perfectly matching Image 2
    const getDeviceColor = (name: string) => {
        if (name === 'mobile') return '#22D3EE'; // Cyan/Teal
        if (name === 'desktop') return '#8B5CF6'; // Purple
        if (name === 'tablet') return '#3B82F6'; // Blue
        return '#F472B6'; // Pink
    };

    const rawData = [
        { name: t('devices.mobile', { fallback: 'Mobile' }), value: data.mobile || 0, fill: getDeviceColor('mobile') },
        { name: t('devices.desktop', { fallback: 'Desktop' }), value: data.desktop || 0, fill: getDeviceColor('desktop') },
        { name: t('devices.tablet', { fallback: 'Tablet' }), value: data.tablet || 0, fill: getDeviceColor('tablet') },
    ];

    const chartData = rawData.filter(d => d.value > 0);
    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    // Format center text (e.g., 10K, 1.5K, etc)
    const formatCompactNumber = (number: number) => {
        if (number < 1000) return number.toString();
        const units = ["K", "M", "B", "T"];
        const unitIndex = Math.floor(Math.log10(number) / 3) - 1;
        const scaled = number / Math.pow(10, (unitIndex + 1) * 3);
        const fractionDigits = scaled % 1 === 0 ? 0 : 1;
        return `${scaled.toFixed(fractionDigits)}${units[unitIndex]}`;
    };

    return (
        <Card className="h-full flex flex-col border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{t('devices.title', { fallback: 'Sessions by device' })}</CardTitle>
                    <div className="h-[2px] w-full border-b border-dashed border-muted-foreground/30 mt-1" />
                </div>
                <button className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center pb-6 pt-4">
                <div className="flex items-center justify-between gap-6 px-2">
                    {/* Donut Chart Side */}
                    <div className="relative w-[150px] h-[150px] shrink-0">
                        {total === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs z-10 font-medium whitespace-nowrap">
                                {t('devices.noTraffic', { fallback: 'No Traffic Yet' })}
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={total === 0 ? [{ value: 1, fill: 'hsl(var(--muted)/0.5)' }] : chartData}
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={2}
                                >
                                    {(total === 0 ? [{ fill: 'hsl(var(--muted)/0.5)' }] : chartData).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                {total > 0 && (
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        formatter={(value: number) => [value.toLocaleString(), 'Sessions']}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Total Label */}
                        {total > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold tracking-tight text-foreground">{formatCompactNumber(total)}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Legend Side */}
                    <div className="flex-1 flex flex-col gap-3">
                        {chartData.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="w-3.5 h-3.5 rounded-sm shadow-sm" style={{ backgroundColor: entry.fill }} />
                                    <span className="text-muted-foreground font-medium">{entry.name}</span>
                                </div>
                                <span className="font-bold text-foreground tabular-nums">{entry.value.toLocaleString()}</span>
                            </div>
                        ))}
                        {/* Decorative "+1 more" logic if needed, hiding for now if all fit */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

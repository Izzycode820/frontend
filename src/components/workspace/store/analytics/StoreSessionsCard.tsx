'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';

type StoreSessionsData = {
    total: number;
    trend: number;
    visitors: number;
    visitorsTrend: number;
};

type ChartDataPoint = {
    date: string;
    sessions: number;
    previousSessions?: number | null;
    previousDate?: string | null;
};

interface StoreSessionsCardProps {
    sessionsData: StoreSessionsData | null | undefined;
    chartData: ChartDataPoint[] | null | undefined;
}

export function StoreSessionsCard({ sessionsData, chartData }: StoreSessionsCardProps) {
    const t = useTranslations('Analytics');
    const format = useFormatter();

    if (!sessionsData || !chartData) return null;

    const renderTrend = (value: number) => {
        const isPositive = value >= 0;
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
        const colorClass = isPositive ? 'text-emerald-500' : 'text-red-500';

        return (
            <div className={`flex items-center text-sm font-semibold ${colorClass}`}>
                <Icon className="w-4 h-4 mr-0.5" />
                {Math.abs(value).toFixed(0)}%
            </div>
        );
    };

    // Calculate dynamic start/end dates for legend based on available data
    const currentDateRange = chartData.length > 0 
        ? `${format.dateTime(new Date(chartData[0].date), { month: 'short', day: 'numeric'})} - ${format.dateTime(new Date(chartData[chartData.length - 1].date), { month: 'short', day: 'numeric', year: 'numeric'})}`
        : t('sessions.currentPeriod', { fallback: 'Current Period' });

    const previousDateRange = chartData.length > 0 && chartData[0].previousDate
        ? `${format.dateTime(new Date(chartData[0].previousDate), { month: 'short', day: 'numeric'})} - ${format.dateTime(new Date(chartData[chartData.length - 1].previousDate!), { month: 'short', day: 'numeric', year: 'numeric'})}`
        : t('sessions.previousPeriod', { fallback: 'Previous Period' });

    return (
        <Card className="h-full flex flex-col border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">{t('sessions.title', { fallback: 'Online store sessions' })}</CardTitle>
                    <div className="h-[2px] w-full border-b border-dashed border-muted-foreground/30 mt-1" />
                </div>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {t('sessions.viewReport', { fallback: 'View report' })}
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-4 pb-2 px-0">
                {/* Main Metrics Area */}
                <div className="px-6 space-y-4 mb-6">
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold tracking-tighter">
                            {sessionsData.total.toLocaleString()}
                        </span>
                        {renderTrend(sessionsData.trend)}
                    </div>
                    
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{t('sessions.visitors', { fallback: 'Visitors' })}</span>
                        <span className="text-base font-bold ml-1">{sessionsData.visitors.toLocaleString()}</span>
                        <div className="ml-1 opacity-80">
                            {renderTrend(sessionsData.visitorsTrend)}
                        </div>
                    </div>
                </div>

                {/* Chart Header Divider */}
                <div className="w-full bg-muted/30 border-y py-1.5 px-6 mb-4">
                    <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                        {t('sessions.chartTitle', { fallback: 'Sessions over time' })}
                    </span>
                </div>

                {/* Chart Area */}
                <div className="h-[180px] w-full px-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                            />
                            
                            {/* Previous Period Line (Dashed, gray) */}
                            <Line
                                type="monotone"
                                dataKey="previousSessions"
                                name={t('sessions.previousPeriod', { fallback: 'Previous Period' })}
                                stroke="#9CA3AF"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                activeDot={{ r: 4, fill: '#9CA3AF' }}
                            />
                            
                            {/* Current Period Line (Solid, purple/indigo) */}
                            <Line
                                type="monotone"
                                dataKey="sessions"
                                name={t('sessions.currentPeriod', { fallback: 'Current Period' })}
                                stroke="#6366F1"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5, fill: '#6366F1', strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend Area */}
                <div className="flex flex-wrap items-center gap-4 px-6 mt-2 pt-2 pb-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-[#6366F1] rounded-full" />
                        <span>{currentDateRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-gray-400 border-dashed border-b-2 rounded-full" />
                        <span>{previousDateRange}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

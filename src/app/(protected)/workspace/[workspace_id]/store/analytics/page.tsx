'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GetStoreAnalyticsDocument } from '@/services/graphql/admin-store/queries/analytics/__generated__/getStoreAnalytics.generated';
import { useTranslations, useLocale } from 'next-intl';
import { SectionCards } from '@/components/workspace/store/dashboard/section-cards';
import { TierBadge } from '@/components/workspace/store/analytics/TierBadge';
import { LockedSection } from '@/components/workspace/store/analytics/LockedSection';
import { PaymentBreakdown } from '@/components/workspace/store/analytics/PaymentBreakdown';
import { ConversionFunnel } from '@/components/workspace/store/analytics/ConversionFunnel';
import { CustomerMetrics } from '@/components/workspace/store/analytics/CustomerMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { ComparativeLineChart } from '@/components/workspace/store/analytics/ComparativeLineChart';
import { TopProductsList } from '@/components/workspace/store/analytics/TopProductsList';
import { DeviceBreakdown } from '@/components/workspace/store/analytics/DeviceBreakdown';
import { StoreSessionsCard } from '@/components/workspace/store/analytics/StoreSessionsCard';

export default function AnalyticsPage() {
    const t = useTranslations('Analytics');
    const locale = useLocale();
    
    // Auto-compact formatter for Y-axis scaling (e.g. 360,000 -> 360K)
    const formatCompactCurrency = (val: number) => new Intl.NumberFormat(locale, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(val) + ' XAF';
    const formatCompactNumber = (val: number) => new Intl.NumberFormat(locale, { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(val);
    const { data, loading, error } = useQuery(GetStoreAnalyticsDocument, {
        variables: { days: 30 },
        fetchPolicy: 'network-only', // Always fetch fresh data on navigation
    });

    const analytics = data?.storeAnalytics;

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col gap-4 py-4 px-4 lg:px-6 md:gap-6 md:py-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">{t('loading')}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    if (error || !analytics) {
        return (
            <div className="flex flex-col gap-4 py-4 px-4 lg:px-6 md:gap-6 md:py-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-destructive">
                            <p>{t('failed')}</p>
                            <p className="text-sm text-muted-foreground">
                                {error?.message || t('unknownError')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No access state
    if (!analytics.hasAccess) {
        return (
            <div className="flex flex-col gap-4 py-4 px-4 lg:px-6 md:gap-6 md:py-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <p className="text-lg font-semibold mb-2">{t('notAvailable')}</p>
                            <p className="text-muted-foreground">
                                {analytics.error || t('notAvailable')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentTier = analytics.analyticsLevel as 'none' | 'basic' | 'pro' | 'advanced';
    const hasPro = currentTier === 'pro' || currentTier === 'advanced';

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 py-4 px-4 lg:px-6 md:gap-6 md:py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('last30Days')}</p>
                </div>
                <TierBadge currentTier={currentTier} />
            </div>

            {/* KPI Cards - Full width */}
            <SectionCards cards={analytics.cards || []} />

            {/* Row 2: Sales Over Time + Sales Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ComparativeLineChart 
                        title={t('charts.sales', { fallback: 'Total Sales Over Time' })}
                        data={analytics.chart?.data as any}
                        currentDataKey="revenue"
                        previousDataKey="previousRevenue"
                        valueFormatter={formatCompactCurrency}
                    />
                </div>
                <div className="lg:col-span-1">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>{t('breakdown.title', { fallback: 'Total Sales Breakdown' })}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                            <div className="space-y-6 text-sm">
                                <div className="flex justify-between pb-4 border-b">
                                    <span className="text-muted-foreground">Gross sales</span>
                                    <span className="font-medium">
                                        {(analytics.chart?.data?.reduce((acc: number, curr: any) => acc + (curr?.revenue || 0), 0) || 0).toLocaleString()} XAF
                                    </span>
                                </div>
                                <div className="flex justify-between pb-4 border-b">
                                    <span className="text-muted-foreground text-destructive">Discounts</span>
                                    <span className="font-medium text-destructive">-0 XAF</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="font-semibold text-base">Net sales</span>
                                    <span className="font-bold text-base">
                                        {(analytics.chart?.data?.reduce((acc: number, curr: any) => acc + (curr?.revenue || 0), 0) || 0).toLocaleString()} XAF
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Row 3: Payment + AOV */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <PaymentBreakdown data={analytics.paymentBreakdown} />
                </div>
                <div className="lg:col-span-2">
                    {hasPro ? (
                        <ComparativeLineChart 
                            title={t('charts.aov', { fallback: 'Average Order Value' })}
                            data={analytics.chart?.data as any}
                            currentDataKey="aov"
                            previousDataKey="previousAov"
                            valueFormatter={formatCompactCurrency}
                            yAxisWidth={55}
                        />
                    ) : (
                        <LockedSection title="Average Order Value" requiredPlan="Pro" />
                    )}
                </div>
            </div>

            {/* Row 4: Conversion Rate + Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    {hasPro ? (
                        <ComparativeLineChart 
                            title={t('charts.conversionRate', { fallback: 'Conversion Rate Over Time' })}
                            data={analytics.chart?.data as any}
                            currentDataKey="conversionRate"
                            previousDataKey="previousConversionRate"
                            valueFormatter={(val: number) => `${val.toFixed(2)}%`}
                            yAxisWidth={55}
                        />
                    ) : (
                        <LockedSection title="Conversion Rate Over Time" requiredPlan="Pro" />
                    )}
                </div>
                <div>
                    {hasPro && analytics.funnel ? (
                        <ConversionFunnel data={analytics.funnel as any} />
                    ) : (
                        <LockedSection title={t('funnel.title', { fallback: 'Conversion Funnel' })} requiredPlan="Pro" />
                    )}
                </div>
            </div>

            {/* Row 5: Customers + Store Sessions + Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[440px]">
                <div className="h-full">
                    {hasPro && analytics.customers ? (
                        <CustomerMetrics data={analytics.customers as any} />
                    ) : (
                        <LockedSection title={t('metrics.title', { fallback: 'Customer Metrics' })} requiredPlan="Pro" />
                    )}
                </div>
                <div className="h-full">
                    {hasPro && analytics.sessions ? (
                        <StoreSessionsCard 
                            sessionsData={analytics.sessions as any} 
                            chartData={analytics.chart?.data as any} 
                        />
                    ) : (
                        <LockedSection title="Online store sessions" requiredPlan="Pro" />
                    )}
                </div>
                <div className="h-full">
                    {currentTier === 'advanced' && analytics.devices ? (
                        <DeviceBreakdown data={analytics.devices as any} />
                    ) : (
                        <LockedSection title="Device Breakdown" requiredPlan="Advanced" />
                    )}
                </div>
            </div>

            {/* Row 6: Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                    {hasPro ? (
                        <TopProductsList data={analytics.topProducts as any} />
                    ) : (
                        <LockedSection title="Top Products" requiredPlan="Pro" />
                    )}
                </div>
            </div>
        </div>
    );
}

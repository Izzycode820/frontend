'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GetStoreAnalyticsDocument } from '@/services/graphql/admin-store/queries/analytics/__generated__/getStoreAnalytics.generated';
import { useTranslations } from 'next-intl';
import { SectionCards } from '@/components/workspace/store/dashboard/section-cards';
import { ChartAreaInteractive } from '@/components/workspace/store/dashboard/chart-area-interactive';
import { TierBadge } from '@/components/workspace/store/analytics/TierBadge';
import { LockedSection } from '@/components/workspace/store/analytics/LockedSection';
import { PaymentBreakdown } from '@/components/workspace/store/analytics/PaymentBreakdown';
import { ConversionFunnel } from '@/components/workspace/store/analytics/ConversionFunnel';
import { CustomerMetrics } from '@/components/workspace/store/analytics/CustomerMetrics';
import { Card, CardContent } from '@/components/shadcn-ui/card';

export default function AnalyticsPage() {
    const t = useTranslations('Analytics');
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

            {/* Brick Layout: Chart + Payment Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ChartAreaInteractive chartData={analytics.chart} />
                </div>
                <div className="lg:col-span-1 w-full h-full">
                    <PaymentBreakdown data={analytics.paymentBreakdown} />
                </div>
            </div>

            {/* Brick Layout: Conversion Funnel + Customer Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    {hasPro && analytics.funnel ? (
                        <ConversionFunnel data={analytics.funnel} />
                    ) : (
                        <LockedSection title={t('funnel.title')} requiredPlan="Pro" />
                    )}
                </div>
                <div>
                    {hasPro && analytics.customers ? (
                        <CustomerMetrics data={analytics.customers} />
                    ) : (
                        <LockedSection title={t('metrics.title')} requiredPlan="Pro" />
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GetCurrentPlanDocument } from '@/services/graphql/subscription/queries/plan/__generated__/get-current-plan.generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Badge } from '@/components/shadcn-ui/badge';
import { Settings } from 'lucide-react';

export function PlanPage() {
  // Query for current plan
  const { data, loading } = useQuery(GetCurrentPlanDocument);

  const subscription = data?.currentPlan;
  const plan = subscription?.plan;

  const isFree = plan?.name?.toLowerCase() === 'free';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '0';
    return amount.toFixed(0);
  };

  // Determine current price
  const getCurrentPrice = () => {
    if (subscription?.isOnIntroPricing && plan?.introPrice !== null && plan.introPrice > 0) {
      return plan.introPrice;
    }
    if (subscription?.billingCycle === 'yearly' && plan?.regularPriceYearly !== null) {
      return plan.regularPriceYearly;
    }
    return plan?.regularPriceMonthly ?? 0;
  };

  const currentPrice = getCurrentPrice();
  const billingPeriod = subscription?.billingCycle === 'yearly' ? 'year' : 'month';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Plan</h1>
      </div>

      {/* Plan Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan details</CardTitle>
            <Button variant="outline">
              {isFree ? 'Choose plan' : 'Change plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-48" />
            </>
          ) : isFree ? (
            // FREE PLAN - Simple Display
            <div className="flex items-start justify-between">
              <h2 className="text-4xl font-bold">{plan?.name}</h2>
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                {subscription?.status || 'ACTIVE'}
              </Badge>
            </div>
          ) : (
            // PAID PLAN - Detailed Display
            <>
              {/* Plan Name and Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-4xl font-bold">{plan?.name}</h2>
                  {subscription?.isOnIntroPricing && plan?.regularPriceMonthly && plan.regularPriceMonthly > 0 && (
                    <span className="text-xl text-muted-foreground line-through">
                      XAF {formatCurrency(plan.regularPriceMonthly)}
                    </span>
                  )}
                </div>
                <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 hover:bg-green-100">
                  {subscription?.status || 'ACTIVE'}
                </Badge>
              </div>

              {/* Current Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">XAF {formatCurrency(currentPrice)}</span>
                <span className="text-xl text-muted-foreground">
                  /{billingPeriod}
                </span>
                {subscription?.expiresAt && (
                  <span className="text-sm text-muted-foreground ml-2">
                    until {formatDate(subscription.expiresAt)}
                  </span>
                )}
                {subscription?.isOnIntroPricing && subscription?.introEndsAt && (
                  <span className="text-sm text-muted-foreground ml-2">
                    until {formatDate(subscription.introEndsAt)}
                  </span>
                )}
              </div>

              {/* Yearly Savings Banner */}
              {subscription?.billingCycle === 'monthly' && plan?.regularPriceYearly && plan.regularPriceYearly > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Settings className="h-4 w-4" />
                    <p className="font-medium">
                      Pay XAF {formatCurrency(plan.regularPriceYearly)}/year
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Terms and Cancel - Only show for paid plans */}
      {!isFree && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            View the{' '}
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              terms of service
            </Button>
            {' '}and{' '}
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              privacy policy
            </Button>
          </p>
          <Button variant="outline" className="text-destructive hover:text-destructive">
            Cancel plan
          </Button>
        </div>
      )}
    </div>
  );
}

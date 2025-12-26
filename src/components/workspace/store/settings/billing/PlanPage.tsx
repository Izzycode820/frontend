'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GetCurrentPlanDocument } from '@/services/graphql/subscription/queries/plan/__generated__/get-current-plan.generated';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Badge } from '@/components/shadcn-ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { Settings } from 'lucide-react';

export function PlanPage() {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Query for current plan
  const { data, loading } = useQuery(GetCurrentPlanDocument);
  const { cancelActiveSubscription, resumeSubscription } = useSubscription();

  const subscription = data?.currentPlan;
  const plan = subscription?.plan;

  const isFree = plan?.name?.toLowerCase() === 'free';
  const isCancelled = subscription?.status === 'CANCELLED';

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

  const handleChangePlan = () => {
    router.push('/billing');
  };

  const handleCancelPlan = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelActiveSubscription();

      if (result.success) {
        setShowCancelDialog(false);
        alert(result.message || 'Subscription cancelled successfully.');
        window.location.reload();
      } else {
        alert(`Cancellation failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Cancellation error: ${error.message || 'Failed to cancel subscription'}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResumePlan = async () => {
    setIsResuming(true);
    try {
      const result = await resumeSubscription();

      if (result.success) {
        alert(result.message || 'Subscription resumed successfully.');
        window.location.reload();
      } else {
        alert(`Resume failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Resume error: ${error.message || 'Failed to resume subscription'}`);
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Plan</h1>
        </div>

        {/* Plan Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Plan details</CardTitle>
              <Button variant="outline" onClick={handleChangePlan}>
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
              <h2 className="text-3xl font-bold">{plan?.name}</h2>
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
                  <h2 className="text-3xl font-bold">{plan?.name}</h2>
                  {subscription?.isOnIntroPricing && plan?.regularPriceMonthly && plan.regularPriceMonthly > 0 && (
                    <span className="text-lg text-muted-foreground line-through">
                      XAF {formatCurrency(plan.regularPriceMonthly)}
                    </span>
                  )}
                </div>
                <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'} className="bg-green-100 text-green-800 hover:bg-green-100">
                  {subscription?.status || 'ACTIVE'}
                </Badge>
              </div>

              {/* Current Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">XAF {formatCurrency(currentPrice)}</span>
                  <span className="text-lg text-muted-foreground">
                    /{billingPeriod}
                  </span>
                </div>

                {/* Status Text - Conditional based on subscription status */}
                {subscription?.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    {isCancelled
                      ? `Resume before ${formatDate(subscription.expiresAt)}`
                      : `Until ${formatDate(subscription.expiresAt)}`
                    }
                  </p>
                )}
              </div>

              {/* Yearly Savings Banner */}
              {subscription?.billingCycle === 'monthly' && plan?.regularPriceYearly && plan.regularPriceYearly > 0 && (
                <div className="bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Settings className="h-4 w-4" />
                    <p className="font-medium">
                      Pay XAF {formatCurrency(plan.regularPriceYearly)}/year
                    </p>
                  </div>
                </div>
              )}

              {/* Resume Button - Show only if cancelled */}
              {isCancelled && subscription?.expiresAt && (
                <div className="pt-4">
                  <Button
                    onClick={handleResumePlan}
                    disabled={isResuming || new Date(subscription.expiresAt) < new Date()}
                    className={new Date(subscription.expiresAt) < new Date() ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {isResuming ? 'Resuming...' : 'Resume Subscription'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
        </Card>

        {/* Terms and Cancel - Always show for paid plans (blur when cancelled) */}
        {!isFree && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              View the{' '}
              <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                terms of service
              </Button>
              {' '}and{' '}
              <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                privacy policy
              </Button>
            </p>
            <Button
              variant="outline"
              className={`text-destructive hover:text-destructive ${
                isCancelled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => !isCancelled && setShowCancelDialog(true)}
              disabled={isCancelling || isCancelled}
            >
              {isCancelled ? 'Plan Cancelled' : 'Cancel plan'}
            </Button>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel {plan?.name} Plan?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Current:</span> {plan?.name} Plan {subscription?.isOnIntroPricing && '(Intro Pricing)'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Paid:</span> {formatCurrency(currentPrice)} XAF on{' '}
                {subscription?.expiresAt && formatDate(subscription.expiresAt)}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-sm font-medium text-amber-900">⚠️ What happens:</div>
              <div className="text-sm text-amber-800 mt-1">
                ✗ After {subscription?.expiresAt && formatDate(subscription.expiresAt)}: Downgrade to Free
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Keep Plan
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelPlan}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

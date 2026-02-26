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
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Settings, AlertCircle, RefreshCw, XCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useFormatter } from 'next-intl';

export function PlanPage() {
  const router = useRouter();
  const t = useTranslations('Billing');
  const format = useFormatter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Query for current plan
  const { data, loading } = useQuery(GetCurrentPlanDocument);
  const { cancelActiveSubscription, resumeSubscription, voidPendingPayment, retrySubscriptionPayment } = useSubscription();

  const subscription = data?.currentPlan;
  const plan = subscription?.plan;

  const isFree = plan?.name?.toLowerCase() === 'free';
  const isCancelled = subscription?.status === 'CANCELLED';
  const isPendingPayment = subscription?.status === 'PENDING_PAYMENT';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format.dateTime(date, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return format.number(0);
    return format.number(amount);
  };

  // Determine current price
  const getCurrentPrice = () => {
    if (subscription?.isOnIntroPricing && plan?.introPrice !== null && (plan?.introPrice ?? 0) > 0) {
      return plan?.introPrice ?? 0;
    }
    if (subscription?.billingCycle === 'yearly' && plan?.regularPriceYearly !== null) {
      return plan?.regularPriceYearly ?? 0;
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
        toast.success(result.message || t('cancelSuccess'));
        window.location.reload();
      } else {
        toast.error(t('cancelFailed', { error: result.error || 'Unknown error' }));
      }
    } catch (error: any) {
      toast.error(t('cancelFailed', { error: error.message || 'Failed to cancel subscription' }));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResumePlan = async () => {
    setIsResuming(true);
    try {
      const result = await resumeSubscription();

      if (result.success) {
        toast.success(result.message || t('resumeSuccess'));
        window.location.reload();
      } else {
        toast.error(t('resumeFailed', { error: result.error || 'Unknown error' }));
      }
    } catch (error: any) {
      toast.error(t('resumeFailed', { error: error.message || 'Failed to resume subscription' }));
    } finally {
      setIsResuming(false);
    }
  };

  const handleVoidPendingPayment = async () => {
    if (!subscription?.id) return;
    setIsVoiding(true);
    try {
      const result = await voidPendingPayment(subscription.id);

      if (result.success) {
        setShowVoidDialog(false);
        toast.success(result.message || t('cancelSuccess'));
        window.location.reload();
      } else {
        toast.error(t('error') + `: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      toast.error(t('error') + `: ${error.message || 'Failed to cancel pending subscription'}`);
    } finally {
      setIsVoiding(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error(t('please_enter_your_phone_number'));
      return;
    }

    setIsRetrying(true);
    try {
      const result = await retrySubscriptionPayment({
        phone_number: phoneNumber.trim(),
        provider: 'fapshi'
      });

      if (result.success) {
        setShowRetryDialog(false);
        if (result.existing_payment) {
          toast.success(t('ussdPromptHint'));
        } else {
          toast.success(result.message || t('ussdPromptHint'));
        }
        // Refresh the page to update status
        window.location.reload();
      } else {
        toast.error(result.error || t('failedToSaveGeneric'));
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error.message || t('failedToSaveGeneric');
      toast.error(errorMessage);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('plan')}</h1>
        </div>

        {/* Plan Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{t('planDetails')}</CardTitle>
              <Button variant="outline" onClick={handleChangePlan}>
                {isFree ? t('choosePlan') : t('changePlan')}
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
            ) : isPendingPayment ? (
              // PENDING PAYMENT - Action Required
              <>
                {/* Header - responsive stacking on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-2xl sm:text-3xl font-bold">{plan?.name}</h2>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 w-fit">
                    {t('paymentPending')}
                  </Badge>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-amber-900 dark:text-amber-200">
                        {t('paymentRequired')}
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                        {t('paymentRequiredDesc', { plan: plan?.name || '' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - stack on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={() => setShowRetryDialog(true)}
                    disabled={isRetrying}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? t('resuming') : t('completePayment')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowVoidDialog(true)}
                    disabled={isVoiding}
                    className="flex items-center justify-center gap-2 text-destructive hover:text-destructive w-full sm:w-auto"
                  >
                    <XCircle className="h-4 w-4" />
                    {t('cancelRequest')}
                  </Button>
                </div>
              </>
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
                      /{billingPeriod === 'year' ? t('year') : t('month')}
                    </span>
                  </div>

                  {/* Status Text - Conditional based on subscription status */}
                  {subscription?.expiresAt && (
                    <p className="text-sm text-muted-foreground">
                      {isCancelled
                        ? t('resumeBefore', { date: formatDate(subscription.expiresAt) })
                        : t('until', { date: formatDate(subscription.expiresAt) })
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
                        {t('payYearly', { amount: `XAF ${formatCurrency(plan.regularPriceYearly)}` })}
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
                      {isResuming ? t('resuming') : t('resumeSubscription')}
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
              {t('viewTerms')}
              <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                {t('termsOfService')}
              </Button>
              {t('and')}
              <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                {t('privacyPolicy')}
              </Button>
            </p>
            <Button
              variant="outline"
              className={`text-destructive hover:text-destructive ${isCancelled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={() => !isCancelled && setShowCancelDialog(true)}
              disabled={isCancelling || isCancelled}
            >
              {isCancelled ? t('planCancelled') : t('cancelPlan')}
            </Button>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelDialogTitle', { plan: plan?.name || '' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{t('currentLabel')}</span> {plan?.name} {t('plan')} {subscription?.isOnIntroPricing && '(Intro Pricing)'}
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('paidLabel')}</span> {formatCurrency(currentPrice)} XAF {t('on')}{' '}
                {subscription?.expiresAt && formatDate(subscription.expiresAt)}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-sm font-medium text-amber-900">{t('warningWhatHappens')}</div>
              <div className="text-sm text-amber-800 mt-1">
                {t('downgradeWarning', { date: subscription?.expiresAt ? formatDate(subscription.expiresAt) : '' })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              {t('keepPlan')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelPlan}
              disabled={isCancelling}
            >
              {isCancelling ? t('resuming') : t('cancelPlan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Pending Payment Confirmation Modal */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('voidDialogTitle', { plan: plan?.name || '' })}</DialogTitle>
            <DialogDescription>
              {t('voidDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="text-sm font-medium text-amber-900 dark:text-amber-200">{t('whatHappens')}</div>
              <ul className="text-sm text-amber-800 dark:text-amber-300 mt-1 space-y-1">
                <li>- {t('voidWhatHappens1')}</li>
                <li>- {t('voidWhatHappens2')}</li>
                <li>- {t('voidWhatHappens3')}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVoidDialog(false)}
              disabled={isVoiding}
            >
              {t('keepRequest')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoidPendingPayment}
              disabled={isVoiding}
            >
              {isVoiding ? t('resuming') : t('yesCancelRequest')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retry Payment Dialog */}
      <Dialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('retryDialogTitle', { plan: plan?.name || '' })}</DialogTitle>
            <DialogDescription>
              {t('retryDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('phoneNumber')}
              </Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isRetrying}
              />
              <p className="text-xs text-muted-foreground">
                {t('ussdPromptHint')}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {t('amountLabel', { amount: `XAF ${formatCurrency(currentPrice)}` })}
              </div>
              <div className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                {t('billingCycleLabel', { plan: plan?.name || '', cycle: billingPeriod === 'year' ? t('year') : t('month') })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRetryDialog(false);
                setPhoneNumber('');
              }}
              disabled={isRetrying}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleRetryPayment}
              disabled={isRetrying || !phoneNumber.trim()}
            >
              {isRetrying ? t('resuming') : t('payNow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

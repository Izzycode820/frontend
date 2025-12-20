'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { PaymentWizard } from '@/components/subscription/payment/PaymentWizard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shadcn-ui/card';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import { PrepareSubscriptionCheckoutDocument } from '@/services/graphql/subscription/mutations/pricing/__generated__/prepare-checkout.generated';
import type { SubscriptionTier, BillingCycle, PricingMode } from '@/types/subscription/subscription';

/**
 * Checkout Flow Component - Handles subscription checkout with authoritative pricing
 *
 * Flow (SECURITY BOUNDARY):
 * 1. Reads URL params (?tier=pro&cycle=monthly&mode=intro)
 * 2. Calls backend mutation to get AUTHORITATIVE PRICING
 * 3. Displays backend-computed price
 * 4. PaymentWizard processes payment with authoritative amount
 * 5. Success → Redirect to workspace
 *
 * Pattern: Shopify/Stripe checkout preparation
 * See: c:\S.T.E.V.E\V2\HUZILERZ\ZCHAT\p.md
 */
export function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  // Extract URL params (USER INTENT - not authoritative)
  const tier = (searchParams?.get('tier') || 'pro') as SubscriptionTier;
  const cycle = (searchParams?.get('cycle') || 'monthly') as BillingCycle;
  const requestedMode = (searchParams?.get('mode') || 'regular') as PricingMode;

  // Map frontend tier to backend tier (frontend: 'beginner', backend: 'beginning')
  const backendTier = tier === 'beginner' ? 'beginning' : tier;

  // Backend mutation to get AUTHORITATIVE PRICING
  const [prepareCheckout, { data, loading, error }] = useMutation(PrepareSubscriptionCheckoutDocument);

  // Call mutation on mount (SECURITY BOUNDARY)
  useEffect(() => {
    prepareCheckout({
      variables: {
        checkoutData: {
          tier: backendTier,
          cycle,
          requestedMode
        }
      }
    }).catch((err) => {
      console.error('Checkout preparation failed:', err);
    });
  }, [backendTier, cycle, requestedMode, prepareCheckout]);

  // Extract authoritative data from backend response
  const checkoutData = data?.prepareSubscriptionCheckout;
  const effectiveMode = checkoutData?.effectiveMode || 'regular';
  const authoritativeAmount = checkoutData?.amount || 0;
  const planName = checkoutData?.planName || 'Pro';
  const breakdown = checkoutData?.breakdown;

  const handlePaymentSuccess = (result: { success: boolean; payment_intent_id?: string; subscription_id?: string; error?: string }) => {
    if (result.success) {
      setShowSuccess(true);

      // Redirect to workspace after 2 seconds
      setTimeout(() => {
        router.push('/workspace');
      }, 2000);
    }
  };

  const handleCancel = () => {
    // Go back to billing/pricing page
    router.push('/billing');
  };

  // Loading state - Fetching authoritative price from backend
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-16 px-6">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Preparing Checkout</h1>
            <p className="text-muted-foreground">
              Validating pricing and eligibility...
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - Backend validation failed
  if (error || (checkoutData && !checkoutData.success)) {
    const errorMessage = checkoutData?.error || error?.message || 'Failed to prepare checkout';
    const errorCode = checkoutData?.errorCode;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Checkout Error</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorCode === 'INTRO_ALREADY_USED' && (
              <Alert>
                <AlertDescription>
                  You've already used the introductory pricing offer. You can still subscribe at the regular price.
                </AlertDescription>
              </Alert>
            )}
            <button
              onClick={() => router.push('/billing')}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Pricing
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (payment completed)
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your {planName} subscription has been activated
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Redirecting to your workspace...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Checkout state - Display with AUTHORITATIVE PRICING from backend
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
          <p className="text-muted-foreground">
            {planName} - {cycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
            {effectiveMode === 'intro' && ' (Introductory pricing)'}
          </p>
          {checkoutData?.message && (
            <p className="text-sm text-muted-foreground mt-2">
              {checkoutData.message}
            </p>
          )}
        </div>

        {/* Price Breakdown (if intro discount applied) */}
        {breakdown && breakdown.discount && breakdown.discount > 0 && (
          <div className="max-w-md mx-auto mb-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Regular Price:</span>
                    <span className="line-through">{breakdown.basePrice?.toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Intro Discount:</span>
                    <span>-{breakdown.discount?.toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>You Pay:</span>
                    <span>{breakdown.finalAmount?.toLocaleString()} XAF</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Payment Wizard with AUTHORITATIVE AMOUNT */}
        <PaymentWizard
          planTier={tier}
          planName={planName}
          amount={authoritativeAmount}
          billingPeriod={cycle}
          pricingMode={effectiveMode as PricingMode}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

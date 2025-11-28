/**
 * Billing Page - Clean Implementation with Trial Support
 * Uses modernized subscription components with proper hooks
 * Follows auth page pattern for simplicity
 * Enhanced with JWT trial claims for eligibility checking
 */

"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { Separator } from "@/components/shadcn-ui/separator";
import { Alert, AlertDescription } from "@/components/shadcn-ui/alert";
import {
  Crown,
  Check,
  Smartphone,
  AlertCircle,
  Loader2,
  Clock,
  TrendingUp,
  ArrowLeft,
  Star,
} from "lucide-react";
import { PricingTable } from "@/components/subscription/pricing/PricingTable";
import { PaymentWizard } from "@/components/subscription/payment/PaymentWizard";
import {
  useSubscription,
  usePricing,
  useTrial,
} from "@/hooks/subscription";
import { useAuth } from "@/hooks/authentication/useAuth";
import type { SubscriptionApiError } from "@/types/subscription";
import {
  showPaymentRecoveryToast,
  showPaymentCancelledToast,
} from "@/utils/payment-recovery-toast";
import { handleSubscriptionError } from "@/utils/subscription-error-toast";
import { handlePaymentError } from "@/utils/payment-error-toast";
import paymentService from "@/services/subscription/payment";

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params from potential signup redirect
  const urlSubscriptionType = searchParams.get("type") as
    | "standard"
    | "trial"
    | null;
  const urlBillingPeriod = searchParams.get("period") as
    | "monthly"
    | "yearly"
    | null;

  const {
    subscription,
    isLoading,
    error,
    createSubscription,
    upgradeSubscription,
  } = useSubscription();
  const {
    standardPricing,
    trialPricing,
    isLoading: pricingLoading,
  } = usePricing();
  const {
    createTrial,
    upgradeTrial,
    hasTrial,
    isActive: isTrialActive,
  } = useTrial();
  const { isOnActiveTrial, trial, trialDaysRemaining, canUpgradeTrial } =
    useAuth();

  // Payment wizard state
  const [selectedPlanTier, setSelectedPlanTier] = useState<
    "beginning" | "pro" | "enterprise" | null
  >(null);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState<
    "standard" | "trial"
  >("standard");
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [showPaymentWizard, setShowPaymentWizard] = useState(false);

  // Handle plan selection - create/upgrade BEFORE opening payment wizard (industry standard)
  const handlePlanSelect = async (
    planTier: string,
    subscriptionType: "standard" | "trial",
    billingPeriod?: "monthly" | "yearly",
  ) => {
    if (planTier === "free") {
      // Cannot "upgrade" to free
      return;
    }

    if (!["beginning", "pro", "enterprise"].includes(planTier)) {
      return;
    }

    setSelectedPlanTier(planTier as "beginning" | "pro" | "enterprise");
    setSelectedSubscriptionType(subscriptionType);
    setSelectedBillingPeriod(billingPeriod || "monthly");

    try {
      // Determine which action to take based on user state (industry pattern from Stripe/Chargebee)
      if (subscriptionType === "trial") {
        // Trial flow
        if (hasTrial && isTrialActive) {
          // User has active trial → upgrade it
          await upgradeTrial({
            target_tier: planTier as "beginning" | "pro" | "enterprise",
          });

          // Show success toast
          toast.success('Trial Upgraded', {
            description: `Successfully upgraded your trial to ${planTier}.`,
            duration: 4000,
          });
        } else {
          // No trial or inactive → create new trial
          await createTrial({
            tier: planTier as "beginning" | "pro" | "enterprise",
          });

          // Show success toast
          toast.success('Trial Started', {
            description: `Your ${planTier} trial has been activated!`,
            duration: 4000,
          });
        }
      } else {
        // Standard subscription flow
        if (subscription && subscription.plan?.tier !== "free") {
          // User has paid subscription → upgrade it
          await upgradeSubscription({
            new_plan_tier: planTier as "beginning" | "pro" | "enterprise",
          });

          // Show success toast
          toast.success('Upgrade Prepared', {
            description: `Complete payment to activate your ${planTier} upgrade.`,
            duration: 5000,
          });
        } else {
          // No subscription or free tier → create new subscription
          await createSubscription({
            plan_tier: planTier as "beginning" | "pro" | "enterprise",
          });

          // Show success toast
          toast.success('Subscription Created', {
            description: `Complete payment to activate your ${planTier} subscription.`,
            duration: 5000,
          });
        }
      }

      // Success - open payment wizard
      setShowPaymentWizard(true);
    } catch (err) {
      // Check for pending payment error (custom handling for payment recovery)
      const apiError = err as SubscriptionApiError;

      if (apiError.error_code === 'PENDING_PAYMENT' && apiError.pending_payment) {
        // Show payment recovery toast with resume/cancel actions
        showPaymentRecoveryToast({
          pendingPayment: apiError.pending_payment,
          onResume: () => {
            // Open PaymentWizard with pending payment details
            setSelectedPlanTier(apiError.pending_payment!.plan_tier as "beginning" | "pro" | "enterprise");
            setSelectedSubscriptionType(subscriptionType);
            setSelectedBillingPeriod(billingPeriod || "monthly");
            setShowPaymentWizard(true);
            toast.success('Payment wizard opened', {
              description: 'Complete your pending payment',
              duration: 3000,
            });
          },
          onCancel: async () => {
            try {
              await paymentService.cancelPayment(apiError.pending_payment!.payment_id);
              showPaymentCancelledToast();
              // Refresh subscription data
              window.location.reload();
            } catch (cancelErr) {
              handlePaymentError({
                error: cancelErr,
                fallbackMessage: 'Failed to cancel payment. Please try again.',
              });
            }
          },
        });
      } else {
        // Discriminated union error handling for all other errors
        // Handles: PAID_SUBSCRIPTION_EXISTS, ACTIVE_TRIAL_EXISTS,
        // PAYMENT_EXPIRED_RETRY_AVAILABLE, CANNOT_CANCEL_ACTIVE_SUBSCRIPTION, etc.
        handleSubscriptionError({
          error: err,
          fallbackMessage: 'Failed to process your request. Please try again.',
          onRetryPayment: () => {
            // Open payment wizard to retry
            setShowPaymentWizard(true);
          },
          onCancelSubscription: async () => {
            // Redirect to subscription management
            toast.info('Redirecting to subscription management...');
            router.push('/workspace/settings?tab=billing');
          },
        });
      }

      console.error("Subscription operation failed:", err);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentWizard(false);
    setSelectedPlanTier(null);
    router.push("/billing?success=plan_changed");
  };

  const handlePaymentCancel = () => {
    setShowPaymentWizard(false);
    setSelectedPlanTier(null);
  };

  // Get plan details for payment wizard
  const getSelectedPlanDetails = () => {
    if (!selectedPlanTier) return null;

    // Trial pricing
    if (selectedSubscriptionType === "trial") {
      if (!trialPricing) return null;
      const trialPlan = trialPricing[selectedPlanTier];
      if (!trialPlan) return null;

      return {
        tier: selectedPlanTier,
        name: standardPricing?.[selectedPlanTier]?.name || selectedPlanTier,
        amount: trialPlan.amount,
        subscriptionType: "trial" as const,
        billingPeriod: "monthly" as const,
      };
    }

    // Standard pricing
    if (!standardPricing) return null;
    const planData = standardPricing[selectedPlanTier];
    if (!planData) return null;

    const amount =
      selectedBillingPeriod === "yearly"
        ? planData.pricing.yearly.discounted_price
        : planData.pricing.monthly.base_price;

    return {
      tier: selectedPlanTier,
      name: planData.name,
      amount,
      subscriptionType: "subscription" as const,
      billingPeriod: selectedBillingPeriod,
    };
  };

  const selectedPlan = getSelectedPlanDetails();

  // Loading state
  if ((isLoading && !subscription) || pricingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show payment wizard
  if (showPaymentWizard && selectedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handlePaymentCancel}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </div>

          <PaymentWizard
            planTier={selectedPlan.tier}
            planName={selectedPlan.name}
            amount={selectedPlan.amount}
            billingPeriod={selectedPlan.billingPeriod}
            paymentType={selectedPlan.subscriptionType}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-6">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free. Upgrade to unlock all features and build professional
              websites.
            </p>
          </div>

          {/* Current Plan Badge */}
          {subscription && (
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 text-base"
              >
                <Crown className="w-4 h-4" />
                Current Plan: {subscription.plan?.name || "Free"}
              </Badge>
            </div>
          )}
        </div>

        {/* Trial Status Card (if active trial) */}
        {isOnActiveTrial && trial && (
          <Card className="mb-8 max-w-2xl mx-auto border-blue-500 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Clock className="w-5 h-5" />
                Active Trial: {trial.current_tier?.toUpperCase()}
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                You&apos;re currently trying out the {trial.current_tier} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Days Remaining
                </span>
                <Badge className="bg-blue-600 text-white">
                  {trialDaysRemaining} days
                </Badge>
              </div>
              {trial.expires_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Expires On
                  </span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {new Date(trial.expires_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {canUpgradeTrial && (
                <>
                  <Separator className="bg-blue-200 dark:bg-blue-800" />
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <TrendingUp className="w-4 h-4" />
                    <span>You can upgrade to a higher trial tier below</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load subscription data: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Benefits */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Why upgrade your subscription?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Deploy your websites instantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Custom domains included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Analytics and insights</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Table */}
        <div className="mb-16">
          <PricingTable
            onPlanSelect={handlePlanSelect}
            showFeatureComparison={true}
            initialSubscriptionType={urlSubscriptionType || "standard"}
            initialBillingPeriod={urlBillingPeriod || "monthly"}
          />
        </div>

        {/* Payment Methods Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">
              Secure payment via MTN Mobile Money, Orange Money, and Fapshi
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              <span>Automatic updates</span>
            </div>
          </div>
        </div>

        {/* Current Subscription Info */}
        {subscription && subscription.plan?.tier !== "free" && (
          <Card className="mt-12 max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                Your Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Current Plan</span>
                <Badge variant="outline">{subscription.plan.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge
                  variant={subscription.is_active ? "default" : "secondary"}
                >
                  {subscription.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {subscription.expires_at && (
                <div className="flex justify-between">
                  <span>Next Payment</span>
                  <span className="text-sm">
                    {new Date(subscription.expires_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              )}

              <Separator />

              <div className="pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push("/workspace/settings?tab=billing")}
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

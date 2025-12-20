'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useAuthWithRedirect } from '@/hooks/authentication/useAuthWithRedirect';
import { buildPathWithParams } from '@/utils/redirect-with-intent';
import { GetPlansDocument } from '@/services/graphql/subscription/queries/pricing/__generated__/get-plans.generated';
import { GetCurrentPlanDocument } from '@/services/graphql/subscription/queries/plan/__generated__/get-current-plan.generated';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Badge } from '@/components/shadcn-ui/badge';
import { AlertCircle, Smartphone, Check } from 'lucide-react';
import { PricingCard } from './PricingCard';
import { cn } from '@/lib/utils';

interface PricingPageProps {
  className?: string;
}

export function PricingPage({ className }: PricingPageProps) {
  const router = useRouter();
  const { requireAuth } = useAuthWithRedirect();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Query all plans
  const { data: plansData, loading: plansLoading, error: plansError } = useQuery(GetPlansDocument);

  // Query current plan (for highlighting current plan)
  const { data: currentPlanData, loading: currentPlanLoading } = useQuery(GetCurrentPlanDocument);

  const plans = plansData?.plans || [];
  const currentTier = currentPlanData?.currentPlan?.plan?.name?.toLowerCase();

  /**
   * Intro Pricing Eligibility Logic (per error.md)
   *
   * isIntroPricingEligible from backend:
   * - true  = User authenticated AND eligible (never used intro)
   * - false = User authenticated AND already used intro
   * - null  = User NOT authenticated (public visitor)
   *
   * Frontend display logic:
   * - null or true  → Show intro pricing (unauth or eligible)
   * - false         → Show regular pricing (already used)
   */
  const isIntroPricingEligible = plansData?.isIntroPricingEligible;
  const shouldShowIntroPrice = isIntroPricingEligible === null || isIntroPricingEligible === true;

  /**
   * Handle plan selection with Auth Gate (following guide p.md)
   *
   * Flow:
   * 1. Determine pricing_mode based on intro eligibility (AUTO, not user choice)
   * 2. Build checkout path with INTENT-ONLY params (tier, cycle, mode)
   * 3. Use requireAuth to gate checkout (preserves params through login)
   * 4. Backend validates eligibility and computes authoritative price
   */
  const handlePlanSelect = (tier: string) => {
    // Find plan to check if it has intro discount
    const selectedPlan = plans.find(p => p?.tier?.toLowerCase() === tier.toLowerCase());
    const hasIntroDiscount = selectedPlan?.showcase?.pricingDisplay?.hasIntroDiscount;

    // AUTO-DETERMINE MODE (backend will validate, this is just frontend intent)
    // If user eligible for intro AND plan offers intro → request intro
    // Otherwise → request regular
    const requestedMode = (shouldShowIntroPrice && hasIntroDiscount) ? 'intro' : 'regular';

    // Build checkout path with INTENT-ONLY params (NOT amount!)
    const checkoutPath = buildPathWithParams('/checkout', {
      tier: tier.toLowerCase(),
      cycle: billingCycle,
      mode: requestedMode
    });

    // AUTH GATE: Capture intent before redirecting
    // If unauthenticated → redirects to login with ?next=<checkoutPath>
    // After login → restores checkoutPath
    // If authenticated → proceeds to checkout immediately
    requireAuth(checkoutPath, () => {
      router.push(checkoutPath);
    });
  };

  // Calculate yearly savings for badge
  const calculateYearlySavings = () => {
    const proMonthly = plans.find(p => p?.tier === 'PRO')?.regularPriceMonthly ?? 0;
    const proYearly = plans.find(p => p?.tier === 'PRO')?.regularPriceYearly ?? 0;
    if (proMonthly > 0 && proYearly > 0) {
      const monthlyCost = proMonthly * 12;
      const savings = monthlyCost - proYearly;
      return savings > 0 ? Math.round((savings / monthlyCost) * 100) : 0;
    }
    return 0;
  };

  const savingsPercent = calculateYearlySavings();

  // Loading state
  if (plansLoading || currentPlanLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-6 w-[500px] mx-auto" />
        </div>
        <Skeleton className="h-12 w-[400px] mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (plansError) {
    return (
      <div className={cn('space-y-4', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load pricing plans. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Sort plans by showcase order
  const sortedPlans = [...plans].sort((a, b) => {
    const orderA = a?.showcase?.order ?? 999;
    const orderB = b?.showcase?.order ?? 999;
    return orderA - orderB;
  });

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Flexible pricing with Mobile Money payment to grow your business
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
          <TabsList className="grid w-[350px] grid-cols-2 bg-muted">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-background">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="data-[state=active]:bg-background">
              Yearly
              {savingsPercent > 0 && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  Save {savingsPercent}%
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {sortedPlans.map((plan) => {
          if (!plan) return null;

          const isCurrentPlan = plan.tier === currentTier?.toUpperCase();

          return (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={isCurrentPlan}
              onSelect={handlePlanSelect}
              showIntroPrice={shouldShowIntroPrice}
            />
          );
        })}
      </div>

      {/* Mobile Money Footer */}
      <div className="text-center space-y-4 mt-12">
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
            <span>No hidden fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

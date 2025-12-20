"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentForm } from './PaymentForm';
import { PaymentProcessor } from './PaymentProcessor';
import { usePlatformPaymentMethods } from '@/hooks/payment/usePayment';
import { useAuth } from '@/hooks/authentication/useAuth';
import subscriptionService from '@/services/subscription/subscription';
import type { SubscriptionTier, BillingCycle, PricingMode } from '@/types/subscription/subscription';

interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  subscription_id?: string;
  error?: string;
}

interface PaymentWizardProps {
  planTier?: SubscriptionTier; // Made optional - can come from URL params
  planName: string;
  amount: number;
  billingPeriod?: BillingCycle; // Made optional - can come from URL params
  pricingMode?: PricingMode; // NEW: Made optional - can come from URL params
  onSuccess: (result: PaymentResult) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Payment Wizard Component - Refactored
 * Orchestrates subscription payment flow:
 * 1. Read URL params (tier, cycle, mode) from pricing page
 * 2. Auto-select recommended payment method (Fapshi)
 * 3. Compose PaymentMethodSelector + PaymentForm for input
 * 4. Call subscription service with complete payload
 * 5. Switch to PaymentProcessor for polling
 * 6. Handle redirecting on success/failure
 */
export function PaymentWizard({
  planTier: propPlanTier,
  planName,
  amount,
  billingPeriod: propBillingPeriod,
  pricingMode: propPricingMode,
  onSuccess,
  onCancel,
  className
}: PaymentWizardProps) {
  // Read URL params (from pricing page navigation)
  const searchParams = useSearchParams();

  // Extract URL params with fallbacks to props
  const urlPlanTier = searchParams?.get('tier') as SubscriptionTier;
  const urlBillingCycle = searchParams?.get('cycle') as BillingCycle;
  const urlPricingMode = searchParams?.get('mode') as PricingMode;

  const planTier = urlPlanTier || propPlanTier || 'pro'; // Default to pro
  const billingCycle = urlBillingCycle || propBillingPeriod || 'monthly';
  const pricingMode = urlPricingMode || propPricingMode || 'regular'; // Default to regular

  // Component state
  const [stage, setStage] = useState<'input' | 'processing'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Platform payment methods hook (auto-fetches and auto-selects recommended)
  const {
    selectedPaymentMethod,
    selectPaymentMethod,
    hasPaymentMethods
  } = usePlatformPaymentMethods(true, 'subscription');

  const { isAuthenticated, user } = useAuth();

  // Generate idempotency key (prevents double-click submissions)
  const generateIdempotencyKey = () => {
    return `${user?.id || 'anon'}-${planTier}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  };

  // Get client context (browser info for fraud detection)
  const getClientContext = () => {
    return {
      user_agent: navigator.userAgent,
      language: navigator.language,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '');
    const regex = /^6[0-9]{8}$/;
    return regex.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phoneNumber)) {
      setError('Invalid phone number format. Use Cameroonian number (e.g., 670123456)');
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to subscribe');
      onCancel();
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Build complete payload for initiate_subscription
      const payload = {
        plan_tier: planTier,
        phone_number: phoneNumber.replace(/\s+/g, ''),
        provider: selectedPaymentMethod.provider, // 'fapshi'
        billing_cycle: billingCycle, // 'monthly' or 'yearly'
        pricing_mode: pricingMode, // 'intro' or 'regular'
        idempotency_key: generateIdempotencyKey(),
        // workspace_id is handled by backend from authenticated user
      };

      // Call subscription service (which calls initiate_subscription on backend)
      const response = await subscriptionService.createSubscription(payload);

      if (!response.success) {
        throw new Error(response.error || 'Subscription creation failed');
      }

      // Store payment intent ID for polling
      if (response.payment_intent_id) {
        setPaymentIntentId(response.payment_intent_id);
        setStage('processing');
      } else {
        throw new Error('No payment intent ID returned');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || 'Subscription failed';
      setError(errorMessage);
      console.error('Subscription error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = (result: PaymentResult) => {
    if (result.success) {
      onSuccess({
        ...result,
        payment_intent_id: paymentIntentId || result.payment_intent_id
      });
    } else {
      setError(result.error || 'Payment failed');
      setStage('input');
      setPaymentIntentId(null);
    }
  };

  // Stage 2: Processing - Poll payment status and redirect
  if (stage === 'processing' && paymentIntentId) {
    return (
      <div className={className}>
        <PaymentProcessor
          paymentId={paymentIntentId}
          amount={amount}
          phoneNumber={phoneNumber}
          operator={selectedPaymentMethod?.displayName || 'Mobile Money'}
          onComplete={handlePaymentComplete}
          onRetry={() => {
            setStage('input');
            setPaymentIntentId(null);
            setError(null);
          }}
        />
      </div>
    );
  }

  // Stage 1: Input - Compose PaymentMethodSelector + PaymentForm
  return (
    <PaymentForm
      planName={planName}
      amount={amount}
      phoneNumber={phoneNumber}
      onPhoneNumberChange={setPhoneNumber}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting || !hasPaymentMethods}
      error={error}
      className={className}
    >
      <PaymentMethodSelector
        value={selectedPaymentMethod?.provider || ''}
        onChange={(provider) => {
          const method = {
            provider,
            displayName: provider,
            mode: 'ussd' as const
          };
          selectPaymentMethod(method);
        }}
        disabled={isSubmitting}
      />
    </PaymentForm>
  );
}

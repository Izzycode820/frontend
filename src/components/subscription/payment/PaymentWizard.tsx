"use client";

import React, { useState } from 'react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentForm } from './PaymentForm';
import { PaymentProcessor } from './PaymentProcessor';
import { usePayment } from '@/hooks/subscription';
import { useAuth } from '@/hooks/authentication/useAuth';

interface PaymentResult {
  success: boolean;
  error?: string;
}

interface PaymentWizardProps {
  planTier: 'beginning' | 'pro' | 'enterprise';
  planName: string;
  amount: number;
  billingPeriod?: 'monthly' | 'yearly';
  paymentType?: 'subscription' | 'trial';
  onSuccess: (result: PaymentResult) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * Payment Wizard Component
 * Orchestrates payment flow:
 * 1. Compose PaymentMethodSelector + PaymentForm for input
 * 2. Switch to PaymentProcessor for polling
 * 3. Handle redirecting on success/failure
 */
export function PaymentWizard({
  planTier,
  planName,
  amount,
  billingPeriod = 'monthly',
  paymentType = 'subscription',
  onSuccess,
  onCancel,
  className
}: PaymentWizardProps) {
  const [stage, setStage] = useState<'input' | 'processing'>('input');
  const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange'>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentPayment,
    initiatePayment,
    clearError: clearPaymentError
  } = usePayment();

  const { isAuthenticated } = useAuth();

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '');
    const regex = /^6[0-9]{8}$/;
    return regex.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phoneNumber)) {
      setError('Invalid phone number');
      return;
    }

    if (!isAuthenticated) {
      setError('Authentication required');
      onCancel();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      clearPaymentError();

      await initiatePayment({
        payment_type: paymentType,
        plan_tier: planTier,
        phone_number: phoneNumber.replace(/\s+/g, ''),
        payment_method: 'fapshi',
        amount
      });

      setStage('processing');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = (result: PaymentResult) => {
    if (result.success) {
      onSuccess(result);
    } else {
      setError(result.error || 'Payment failed');
      setStage('input');
    }
  };

  // Stage 2: Processing - Poll payment status and redirect
  if (stage === 'processing' && currentPayment?.payment_id) {
    return (
      <div className={className}>
        <PaymentProcessor
          paymentId={currentPayment.payment_id}
          amount={amount}
          phoneNumber={currentPayment.phone_display}
          operator={currentPayment.operator}
          onComplete={handlePaymentComplete}
          onRetry={() => {
            setStage('input');
            clearPaymentError();
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
      isSubmitting={isSubmitting}
      error={error}
      className={className}
    >
      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={isSubmitting}
      />
    </PaymentForm>
  );
}

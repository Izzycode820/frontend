"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Progress } from '@/components/shadcn-ui/progress';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Badge } from '@/components/shadcn-ui/badge';
import { cn } from '@/lib/utils';
import usePayment from '@/hooks/payment/usePayment';

interface PaymentProcessorProps {
  paymentId: string;
  amount: number;
  phoneNumber: string;
  operator?: string;
  onComplete: (result: { success: boolean; error?: string }) => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Payment Processor Component - Refactored
 * Real-time payment status polling using refactored usePayment hook
 * Uses webhook-driven polling with progressive intervals
 * Follows best practices: security, performance, scalability
 */
export function PaymentProcessor({
  paymentId,
  amount,
  phoneNumber,
  operator = 'Mobile Money',
  onComplete,
  onRetry,
  className
}: PaymentProcessorProps) {
  const t = useTranslations('subscription.payment');
  // Use refactored payment hook for polling
  const {
    paymentStatus,
    isPolling,
    error,
    startPolling,
    stopPolling,
    isPaymentSuccess,
    isPaymentFailed,
    isPaymentPending
  } = usePayment();

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Store latest callbacks in refs to prevent effect re-runs (React best practice)
  // This prevents parent re-renders from restarting polling
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Track which payment we've started polling for (prevent duplicate polling)
  const pollingStartedForRef = useRef<string | null>(null);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get operator display info
  const getOperatorDisplay = () => {
    const operatorLower = operator.toLowerCase();

    if (operatorLower.includes('mtn')) {
      return {
        name: t('operators.mtn'),
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: <Smartphone className="w-4 h-4" />
      };
    }
    if (operatorLower.includes('orange')) {
      return {
        name: t('operators.orange'),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: <Smartphone className="w-4 h-4" />
      };
    }
    return {
      name: t('operators.momo'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: <Smartphone className="w-4 h-4" />
    };
  };

  const operatorDisplay = getOperatorDisplay();

  // Get status display
  const getStatusDisplay = () => {
    if (error) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: t('processor.failed'),
        subtitle: error,
        variant: 'destructive' as const
      };
    }

    if (isPaymentSuccess) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        title: t('processor.success'),
        subtitle: t('processor.confirmed'),
        variant: 'default' as const
      };
    }

    if (isPaymentFailed) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: t('processor.failed'),
        subtitle: t('checkout.tryAgain'), // Reuse try again key
        variant: 'destructive' as const
      };
    }

    if (isPaymentPending) {
      return {
        icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
        title: t('processor.processing'),
        subtitle: t('processor.instructions'),
        variant: 'default' as const
      };
    }

    return {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      title: t('processor.waiting'),
      subtitle: t('processor.prompt'),
      variant: 'default' as const
    };
  };

  const statusDisplay = getStatusDisplay();

  // Start polling for payment status
  // Industry standard: Only run once when paymentId changes, not when callbacks/actions change
  useEffect(() => {
    if (!paymentId) return;

    // Prevent duplicate polling for same payment (idempotency guard)
    if (pollingStartedForRef.current === paymentId) {
      console.log('[PaymentProcessor] Already polling for this payment:', paymentId);
      return;
    }

    console.log('[PaymentProcessor] Starting polling for payment:', paymentId);
    pollingStartedForRef.current = paymentId;

    // Start polling with new hook (uses webhook-driven progressive intervals)
    startPolling(
      paymentId,
      // onSuccess callback - use ref to get latest callback
      (payment) => {
        onCompleteRef.current({ success: true });
      },
      // onError callback - use ref to get latest callback
      (errorMsg) => {
        onCompleteRef.current({ success: false, error: errorMsg });
      }
    );

    // Timer for elapsed time display
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      console.log('[PaymentProcessor] Cleanup - stopping polling for:', paymentId);
      clearInterval(timer);
      stopPolling();
      pollingStartedForRef.current = null;
    };
    // Only re-run if paymentId changes (not when store actions or callbacks change)
    // Store actions (startPolling, stopPolling) are stable from Zustand
    // Callback changes are handled via ref
  }, [paymentId, startPolling, stopPolling]);

  // Format elapsed time
  const formatElapsedTime = () => {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress (mock progress based on time)
  const getProgress = () => {
    if (isPaymentSuccess) return 100;
    if (isPaymentFailed) return 0;
    // Show gradual progress up to 90% over 2 minutes
    return Math.min((secondsElapsed / 120) * 90, 90);
  };

  const handleRetry = () => {
    stopPolling();
    setSecondsElapsed(0);
    onRetry?.();
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <div className={cn('mx-auto p-3 rounded-full mb-4', operatorDisplay.bgColor)}>
          <div className={operatorDisplay.color}>
            {operatorDisplay.icon}
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {statusDisplay.icon}
          {statusDisplay.title}
        </CardTitle>
        <CardDescription>
          {statusDisplay.subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('processor.amount')}</span>
            <span className="font-medium">{formatCurrency(amount)} FCFA</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('processor.method')}</span>
            <Badge variant="outline" className={operatorDisplay.color}>
              {operatorDisplay.name}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('processor.phone')}</span>
            <span className="font-mono text-sm">{phoneNumber}</span>
          </div>

          {paymentStatus?.metadata?.payment_reference && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('processor.reference')}</span>
              <span className="font-mono text-xs">{paymentStatus.metadata.payment_reference}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {isPolling && !isPaymentSuccess && !isPaymentFailed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('processor.progress')}</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Timer */}
        {isPolling && secondsElapsed > 0 && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">{t('processor.timeElapsed')}</div>
            <div className="text-lg font-mono font-medium">
              {formatElapsedTime()}
            </div>
          </div>
        )}

        {/* Instructions */}
        {isPolling && !isPaymentSuccess && !isPaymentFailed && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <div>{t('processor.step1')}</div>
                <div>{t('processor.step2')}</div>
                <div>{t('processor.step3')}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {(error || isPaymentFailed) && onRetry && (
            <Button
              onClick={handleRetry}
              className="flex-1"
              disabled={isPolling}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('shared.tryAgain')}
            </Button>
          )}

          {isPolling && !isPaymentSuccess && !isPaymentFailed && (
            <Button
              variant="outline"
              onClick={() => {
                stopPolling();
                onComplete({ success: false, error: 'Payment cancelled by user' });
              }}
              className="flex-1"
            >
              {t('shared.cancel')}
            </Button>
          )}
        </div>

        {/* Success State */}
        {isPaymentSuccess && (
          <div className="text-center text-green-600 font-medium">
            ✅ {t('processor.successMsg')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

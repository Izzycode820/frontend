"use client";

import React, { useEffect, useState } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Progress } from '@/components/shadcn-ui/progress';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Badge } from '@/components/shadcn-ui/badge';
import { cn } from '@/lib/utils';
import { usePayment } from '@/hooks/subscription';

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
 * Payment Processor Component - Modern Version
 * Real-time payment status polling using modern usePayment hook
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
  const {
    currentPayment,
    paymentStatus,
    isLoading,
    error,
    checkPaymentStatus,
    pollPaymentStatus,
    clearError,
    isPaymentComplete,
    isPaymentFailed,
    isPaymentPending
  } = usePayment();

  const [pollingActive, setPollingActive] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

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
        name: 'MTN Mobile Money',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: <Smartphone className="w-4 h-4" />
      };
    }
    if (operatorLower.includes('orange')) {
      return {
        name: 'Orange Money',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: <Smartphone className="w-4 h-4" />
      };
    }
    return {
      name: 'Mobile Money',
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
        title: 'Payment Failed',
        subtitle: error,
        variant: 'destructive' as const
      };
    }

    if (isPaymentComplete()) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        title: 'Payment Successful',
        subtitle: 'Your payment has been confirmed',
        variant: 'default' as const
      };
    }

    if (isPaymentFailed()) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: 'Payment Failed',
        subtitle: 'Please try again or use a different payment method',
        variant: 'destructive' as const
      };
    }

    if (isPaymentPending()) {
      return {
        icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
        title: 'Processing Payment',
        subtitle: 'Please complete the payment on your mobile device',
        variant: 'default' as const
      };
    }

    return {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      title: 'Waiting for Payment',
      subtitle: 'Check your phone for the payment prompt',
      variant: 'default' as const
    };
  };

  const statusDisplay = getStatusDisplay();

  // Start polling for payment status
  useEffect(() => {
    if (!paymentId || pollingActive) return;

    setPollingActive(true);

    // Start polling (max 60 attempts = 5 minutes with 5s interval)
    pollPaymentStatus(paymentId, 60)
      .then((finalStatus) => {
        if (finalStatus.status === 'completed' || finalStatus.status === 'successful') {
          onComplete({ success: true });
        } else if (finalStatus.status === 'failed' || finalStatus.status === 'cancelled') {
          onComplete({ success: false, error: 'Payment was not completed' });
        }
      })
      .catch((err) => {
        console.error('Polling error:', err);
        onComplete({ success: false, error: err.message || 'Payment verification failed' });
      })
      .finally(() => {
        setPollingActive(false);
      });

    // Timer for elapsed time
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [paymentId, pollPaymentStatus, onComplete, pollingActive]);

  // Format elapsed time
  const formatElapsedTime = () => {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress (mock progress based on time)
  const getProgress = () => {
    if (isPaymentComplete()) return 100;
    if (isPaymentFailed()) return 0;
    // Show gradual progress up to 90% over 2 minutes
    return Math.min((secondsElapsed / 120) * 90, 90);
  };

  const handleRetry = () => {
    clearError();
    setSecondsElapsed(0);
    setPollingActive(false);
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
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-medium">{formatCurrency(amount)} FCFA</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Method:</span>
            <Badge variant="outline" className={operatorDisplay.color}>
              {operatorDisplay.name}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Phone:</span>
            <span className="font-mono text-sm">{phoneNumber}</span>
          </div>

          {currentPayment?.payment_reference && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reference:</span>
              <span className="font-mono text-xs">{currentPayment.payment_reference}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {pollingActive && !isPaymentComplete() && !isPaymentFailed() && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* Timer */}
        {pollingActive && secondsElapsed > 0 && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Time elapsed</div>
            <div className="text-lg font-mono font-medium">
              {formatElapsedTime()}
            </div>
          </div>
        )}

        {/* Instructions */}
        {pollingActive && !isPaymentComplete() && !isPaymentFailed() && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <div>1. Check your phone for the payment prompt</div>
                <div>2. Enter your Mobile Money PIN to approve</div>
                <div>3. Wait for confirmation (this may take up to 2 minutes)</div>
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
          {(error || isPaymentFailed()) && onRetry && (
            <Button
              onClick={handleRetry}
              className="flex-1"
              disabled={pollingActive}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}

          {pollingActive && !isPaymentComplete() && !isPaymentFailed() && (
            <Button
              variant="outline"
              onClick={() => {
                setPollingActive(false);
                onComplete({ success: false, error: 'Payment cancelled by user' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Success State */}
        {isPaymentComplete() && (
          <div className="text-center text-green-600 font-medium">
            ✅ Payment completed successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

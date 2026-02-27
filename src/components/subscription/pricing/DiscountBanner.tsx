"use client";

import React, { useState } from 'react';
import { Percent, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import { cn } from '@/lib/utils';

interface DiscountBannerProps {
  className?: string;
  dismissible?: boolean;
  show?: boolean; // Control visibility from parent
}

/**
 * Discount Banner Component - Simplified Version
 * Currently hardcoded for 15% yearly billing discount
 * TODO: Make dynamic by connecting to discount API endpoint in the future
 */
export function DiscountBanner({
  className,
  dismissible = true,
  show = true
}: DiscountBannerProps) {
  const t = useTranslations('subscription.discount');
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !show) return null;

  // Hardcoded discount information
  // TODO: Replace with API call to /api/subscription/discounts/ when backend is ready
  const YEARLY_DISCOUNT = {
    percentage: 15,
    title: t('title'),
    description: t('description'),
    badge: t('badge')
  };

  return (
    <Alert className={cn(
      'border-green-200 bg-green-50 text-green-800 relative',
      className
    )}>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 hover:bg-transparent"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-start gap-3 pr-8">
        <div className="mt-1 text-green-600">
          <Percent className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertDescription className="font-semibold text-base m-0">
              {YEARLY_DISCOUNT.title}
            </AlertDescription>

            {/* Discount value badge */}
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              {YEARLY_DISCOUNT.badge}
            </Badge>
          </div>

          <AlertDescription className="text-sm">
            {YEARLY_DISCOUNT.description}
          </AlertDescription>

          {/* Cameroon market specific messaging */}
          <div className="text-xs opacity-75 mt-2">
            {t('paymentNote')}
          </div>
        </div>
      </div>
    </Alert>
  );
}
"use client";

import React from 'react';
import NumberFlow from '@number-flow/react';
import { Check, Star, Users, Zap, Crown, Smartphone } from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/shadcn-ui/card';
import { Progress } from '@/components/shadcn-ui/progress';
import { cn } from '@/lib/utils';

interface PlanCardData {
  tier: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  features?: string[];
  card_features?: string[];
  resources?: {
    deployed_sites: number | 'unlimited';
    storage_gb: number;
    bandwidth_gb: number;
    workspaces: number | 'unlimited';
  };
  pricing?: {
    monthly: number;
    quarterly: number;
    annually: number;
  };
  description?: string;
  tagline?: string;
  discount_available?: boolean;
  is_popular?: boolean;
  is_current_plan?: boolean;
  is_upgrade?: boolean;
  is_downgrade?: boolean;
  cta_text?: string;
  badge_text?: string;
}

interface PricingCardProps {
  plan: PlanCardData;
  onSelect: (tier: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  usageProgress?: number;
  periodLabel?: string;
  savings?: number | null;
  subscriptionType?: 'standard' | 'trial';
}

/**
 * Pricing Card Component - Clean Modern Version
 * Optimized for Cameroon market with Mobile Money integration
 * Ready for NumberFlow price animations
 */
export function PricingCard({
  plan,
  onSelect,
  loading = false,
  disabled = false,
  className,
  usageProgress = 0,
  periodLabel = '/month',
  savings = null,
  subscriptionType = 'standard'
}: PricingCardProps) {
  const handleSelect = () => {
    if (!disabled && !loading) {
      onSelect(plan.tier);
    }
  };

  const formatPrice = (amount: number): string => {
    if (amount === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get tier-specific minimal styling
  const getTierConfig = () => {
    switch (plan.tier) {
      case 'beginning':
        return {
          icon: <Users className="w-5 h-5 text-foreground" />,
          description: 'Ideal for students and personal projects'
        };
      case 'pro':
        return {
          icon: <Zap className="w-5 h-5 text-foreground" />,
          description: 'For entrepreneurs and solopreneurs'
        };
      case 'enterprise':
        return {
          icon: <Crown className="w-5 h-5 text-foreground" />,
          description: 'Businesses and agencies'
        };
      default:
        return {
          icon: <Smartphone className="w-5 h-5 text-muted-foreground" />,
          description: 'Explore all features'
        };
    }
  };

  const tierConfig = getTierConfig();

  const getCardStyle = () => {
    if (plan.is_popular) {
      return 'border-foreground shadow-lg';
    }
    if (plan.is_current_plan) {
      return 'border-foreground/30 bg-muted/20';
    }
    return 'border-border';
  };

  const getButtonStyle = () => {
    if (plan.is_current_plan) {
      return 'bg-muted text-muted-foreground cursor-not-allowed';
    }
    if (plan.tier === 'free') {
      return 'bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background';
    }
    return 'bg-foreground text-background hover:bg-foreground/90';
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (plan.is_current_plan) return 'Current Plan';
    if (subscriptionType === 'trial') return 'Start Trial';
    if (plan.is_upgrade) return `Upgrade to ${plan.name}`;
    if (plan.is_downgrade) return `Downgrade to ${plan.name}`;
    return plan.cta_text || `Choose ${plan.name}`;
  };

  return (
    <Card
      className={cn(
        'relative transition-all duration-300',
        {
          // Popular plan gets subtle shine animation
          "animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#0c0a09,45%,#1c1917,55%,#0c0a09)] bg-[length:200%_100%]": plan.is_popular,
          // Hover effects only when not disabled
          "hover:scale-105 hover:shadow-md": !disabled,
          // Blur effect for ineligible trials
          "opacity-60 blur-[0.5px] pointer-events-none": disabled && subscriptionType === 'trial',
        },
        getCardStyle(),
        className
      )}
    >
      {/* Badges */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        {plan.is_popular && (
          <Badge className="bg-foreground text-background px-3 py-1 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Most Popular
          </Badge>
        )}
        {plan.is_current_plan && !plan.is_popular && (
          <Badge variant="outline" className="border-foreground/30 text-foreground bg-background px-3 py-1">
            Current Plan
          </Badge>
        )}
        {savings && savings > 0 && !plan.is_popular && !plan.is_current_plan && (
          <Badge className="bg-green-600 text-white px-3 py-1">
            Save {formatPrice(savings)} FCFA
          </Badge>
        )}
      </div>

      <CardHeader className="text-center pb-4 pt-6">
        {/* Plan name with icon */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {tierConfig.icon}
          <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
        </div>

        {/* Market positioning */}
        <CardDescription className="text-sm text-muted-foreground">
          {plan.description || tierConfig.description}
        </CardDescription>

        {/* Pricing with NumberFlow animation */}
        <div className="space-y-2 mt-4">
          <div className="flex items-baseline justify-center gap-2">
            {plan.price === 0 ? (
              <span className="text-4xl font-bold text-foreground">Free</span>
            ) : (
              <>
                <NumberFlow
                  value={plan.price}
                  format={{
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }}
                  transformTiming={{
                    duration: 400,
                    easing: 'ease-out'
                  }}
                  className="text-4xl font-bold text-foreground"
                />
                <span className="text-sm text-muted-foreground">FCFA</span>
                <span className="text-sm text-muted-foreground">{periodLabel}</span>
              </>
            )}
          </div>

          {/* Savings badge for yearly billing */}
          {savings && savings > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save {formatPrice(savings)} FCFA
            </Badge>
          )}
        </div>

        {/* Usage progress for current plan */}
        {plan.is_current_plan && usageProgress > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Usage this month</span>
              <span className="text-foreground font-medium">{usageProgress}%</span>
            </div>
            <Progress value={usageProgress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-6">
        {/* Key metrics grid */}
        {plan.resources && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">
                {plan.resources.deployed_sites === 'unlimited' ? '∞' : plan.resources.deployed_sites}
              </div>
              <div className="text-xs text-muted-foreground">Sites</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">
                {typeof plan.resources.workspaces === 'string' ? '∞' : plan.resources.workspaces}
              </div>
              <div className="text-xs text-muted-foreground">Workspace(s)</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">{plan.resources.storage_gb}GB</div>
              <div className="text-xs text-muted-foreground">Storage</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">{plan.resources.bandwidth_gb}GB</div>
              <div className="text-xs text-muted-foreground">Bandwidth</div>
            </div>
          </div>
        )}

        {/* Features list */}
        {plan.card_features && plan.card_features.length > 0 && (
          <div className="space-y-3">
            {plan.card_features.slice(0, 5).map((feature: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* Main CTA Button */}
        <Button
          onClick={handleSelect}
          disabled={disabled || loading || plan.is_current_plan}
          size="lg"
          className={cn(
            "relative inline-flex w-full items-center justify-center rounded-md px-6 font-medium transition-all duration-200",
            getButtonStyle()
          )}
        >
          {/* Subtle blur effect for non-current plans */}
          {!plan.is_current_plan && (
            <div className="absolute -inset-0.5 -z-10 rounded-lg bg-foreground/10 opacity-0 hover:opacity-100 transition-opacity duration-200 blur" />
          )}

          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            getButtonText()
          )}
        </Button>

        {/* Mobile Money hint */}
        {plan.tier !== 'free' && !plan.is_current_plan && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="w-3 h-3" />
            <span>MTN • Orange • Fapshi</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

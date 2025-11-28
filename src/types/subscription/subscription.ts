import { z } from 'zod';

/**
 * Subscription Management Types
 * Types matching exact backend API responses from subscription endpoints
 */

// Subscription status types from backend
export const SubscriptionStatus = {
  ACTIVE: 'active',
  PENDING_PAYMENT: 'pending_payment',
  EXPIRED: 'expired',
  GRACE_PERIOD: 'grace_period',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const;

export type SubscriptionStatusType = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// Plan tier types aligned with backend
export const PlanTier = {
  FREE: 'free',
  BEGINNING: 'beginning',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanTierType = typeof PlanTier[keyof typeof PlanTier];

/**
 * Create Subscription Request
 * POST /api/subscriptions/create/
 */
export const SubscriptionCreateSchema = z.object({
  plan_tier: z.enum(['beginning', 'pro', 'enterprise']),
});

export interface SubscriptionCreateRequest {
  readonly plan_tier: 'beginning' | 'pro' | 'enterprise';
}

/**
 * Create Subscription Response
 * Matches backend response structure exactly
 */
export interface SubscriptionCreateResponse {
  readonly subscription: {
    readonly id: string;
    readonly plan: {
      readonly name: string;
      readonly tier: PlanTierType;
      readonly price_fcfa: number;
    };
    readonly status: SubscriptionStatusType;
    readonly expires_at: string;
    readonly deployment_allowed: boolean;
  };
}

/**
 * Upgrade Subscription Request
 * POST /api/subscriptions/upgrade/
 */
export const SubscriptionUpgradeSchema = z.object({
  new_plan_tier: z.enum(['beginning', 'pro', 'enterprise']),
});

export interface SubscriptionUpgradeRequest {
  readonly new_plan_tier: 'beginning' | 'pro' | 'enterprise';
}

/**
 * Upgrade Subscription Response
 * Returns pending_payment status requiring payment completion
 */
export interface SubscriptionUpgradeResponse {
  readonly success: boolean;
  readonly message: string;
  readonly upgrade: {
    readonly id: string;
    readonly current_plan: PlanTierType;
    readonly target_plan: PlanTierType;
    readonly status: SubscriptionStatusType;
    readonly requires_payment: boolean;
    readonly amount_due: number;
  };
}

/**
 * Subscription Status Response
 * GET /api/subscriptions/status/
 */
export interface SubscriptionStatusResponse {
  readonly success: boolean;
  readonly subscription: {
    readonly id: string;
    readonly plan: {
      readonly name: string;
      readonly tier: PlanTierType;
      readonly price_fcfa: number;
    };
    readonly status: SubscriptionStatusType;
    readonly started_at: string;
    readonly expires_at: string;
    readonly days_remaining: number;
    readonly is_active: boolean;
    readonly deployment_allowed: boolean;
    readonly limits: {
      readonly storage_gb: number;
      readonly bandwidth_gb: number;
      readonly deployed_sites: number;
      readonly workspaces: number;
      readonly custom_domains: number;
    };
    readonly capabilities: {
      readonly deployment_allowed: boolean;
      readonly custom_domains_allowed: boolean;
      readonly analytics_enabled: boolean;
      readonly white_label_enabled: boolean;
      readonly dedicated_support: boolean;
      readonly api_access: boolean;
      readonly priority_support: boolean;
    };
  } | null;
}

/**
 * Type guard to check if subscription requires payment
 */
export function requiresPayment(status: SubscriptionStatusType): boolean {
  return status === SubscriptionStatus.PENDING_PAYMENT;
}

/**
 * Type guard to check if subscription is operational
 */
export function isOperational(status: SubscriptionStatusType): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.GRACE_PERIOD;
}

/**
 * Cancel Subscription Request
 * POST /api/subscriptions/cancel/{subscription_id}/
 * Only works for pending_payment, failed, or expired subscriptions
 */
export interface CancelSubscriptionRequest {
  readonly subscription_id: string;
}

/**
 * Cancel Subscription Response
 * Voids incomplete subscriptions (Stripe pattern)
 */
export interface CancelSubscriptionResponse {
  readonly success: boolean;
  readonly message: string;
  readonly subscription_id?: string;
  readonly status?: string;
  readonly error?: string;
  readonly current_status?: string;
}

/**
 * Type guard to check if subscription can be cancelled (voided)
 * Only pending_payment, failed, or expired subscriptions can be voided
 */
export function canCancelSubscription(status: SubscriptionStatusType): boolean {
  return (
    status === SubscriptionStatus.PENDING_PAYMENT ||
    status === SubscriptionStatus.EXPIRED ||
    status === 'failed' as SubscriptionStatusType
  );
}

// ============================================================================
// Subscription Error Types (Discriminated Unions)
// Aligned with PAYLOAD.md (2025-10-03)
// ============================================================================

/**
 * Trial Creation Blocked by Paid Subscription (403 FORBIDDEN)
 * POST /api/subscriptions/trials/create/
 */
export interface PaidSubscriptionExistsError {
  readonly error: string;
  readonly error_code: 'PAID_SUBSCRIPTION_EXISTS';
  readonly message: string;
  readonly current_plan: 'beginning' | 'pro' | 'enterprise';
  readonly subscription_status: 'active';
}

/**
 * Subscription Creation Blocked by Active Trial (409 CONFLICT)
 * POST /api/subscriptions/create/
 */
export interface ActiveTrialExistsError {
  readonly error: string;
  readonly error_code: 'ACTIVE_TRIAL_EXISTS';
  readonly trial_tier: 'beginning' | 'pro' | 'enterprise';
  readonly trial_expires_at: string;
  readonly days_remaining: number;
}

/**
 * Payment Session Expired - Retry Available (409 CONFLICT)
 * POST /api/subscriptions/create/
 */
export interface PaymentExpiredRetryAvailableError {
  readonly error: string;
  readonly error_code: 'PAYMENT_EXPIRED_RETRY_AVAILABLE';
  readonly subscription_id: string;
  readonly plan_tier: 'beginning' | 'pro' | 'enterprise';
  readonly grace_period_remaining_hours: number;
  readonly actions: {
    readonly create_payment: string;
    readonly cancel_subscription: string;
  };
}

/**
 * Cannot Cancel Active Subscription (400 BAD REQUEST)
 * POST /api/subscriptions/cancel/{subscription_id}/
 */
export interface CannotCancelActiveSubscriptionError {
  readonly error: string;
  readonly error_code: 'CANNOT_CANCEL_ACTIVE_SUBSCRIPTION';
  readonly current_status: 'active';
}

/**
 * Discriminated Union for All Subscription Errors
 */
export type SubscriptionError =
  | PaidSubscriptionExistsError
  | ActiveTrialExistsError
  | PaymentExpiredRetryAvailableError
  | CannotCancelActiveSubscriptionError;

// ============================================================================
// Type Guards for Subscription Errors
// ============================================================================

export function isPaidSubscriptionExistsError(
  error: unknown
): error is PaidSubscriptionExistsError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error_code' in error &&
    error.error_code === 'PAID_SUBSCRIPTION_EXISTS'
  );
}

export function isActiveTrialExistsError(
  error: unknown
): error is ActiveTrialExistsError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error_code' in error &&
    error.error_code === 'ACTIVE_TRIAL_EXISTS'
  );
}

export function isPaymentExpiredRetryAvailableError(
  error: unknown
): error is PaymentExpiredRetryAvailableError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error_code' in error &&
    error.error_code === 'PAYMENT_EXPIRED_RETRY_AVAILABLE'
  );
}

export function isCannotCancelActiveSubscriptionError(
  error: unknown
): error is CannotCancelActiveSubscriptionError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error_code' in error &&
    error.error_code === 'CANNOT_CANCEL_ACTIVE_SUBSCRIPTION'
  );
}

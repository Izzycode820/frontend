/**
 * Subscription Hooks Index - 2024 Best Practices
 * Clean exports for all subscription-related hooks
 * Following patterns: direct exports only, no re-exports of internals
 */

// ============================================================================
// Main Subscription Hooks
// ============================================================================

export {
  useSubscription,
  useSubscriptionStatus,
  useSubscriptionData,
  useSubscriptionActions,
  type UseSubscriptionReturn
} from './useSubscription'

export {
  usePayment,
  usePaymentStatus,
  usePaymentDetails,
  usePaymentActions,
  type UsePaymentReturn
} from './usePayment'

export {
  useTrial,
  useTrialStatus,
  useTrialData,
  useTrialActions,
  type UseTrialReturn
} from './useTrial'

export {
  usePricing,
  useStandardPricing,
  useTrialPricing,
  usePricingActions,
  type UsePricingReturn
} from './usePricing'

// ============================================================================
// Default Export - Main Subscription Hook
// ============================================================================

export { default } from './useSubscription'
/**
 * Subscription Hook - 2024 Best Practices with Zustand
 * Custom hook layer for subscription store - provides clean interface and performance
 * Following patterns: single responsibility, selective subscriptions, error boundaries
 */

import { useCallback } from 'react'
import { useSubscriptionStore, subscriptionSelectors } from '../../stores/subscription/subscriptionStore'
import type {
  SubscriptionCreateRequest,
  SubscriptionCreateResponse,
  SubscriptionUpgradeRequest,
  SubscriptionUpgradeResponse,
  RenewSubscriptionRequest,
  ScheduleDowngradeRequest,
  ReactivateSubscriptionRequest,
} from '../../types/subscription'

// ============================================================================
// Hook Return Interface - Clean Contract
// ============================================================================

export interface UseSubscriptionReturn {
  // State selectors (performance optimized)
  subscription: ReturnType<typeof subscriptionSelectors.subscription>
  history: ReturnType<typeof subscriptionSelectors.history>
  isLoading: boolean
  error: string | null

  // Computed state
  isActive: boolean
  planTier: ReturnType<typeof subscriptionSelectors.planTier>
  planName: ReturnType<typeof subscriptionSelectors.planName>
  daysRemaining: ReturnType<typeof subscriptionSelectors.daysRemaining>
  deploymentAllowed: boolean
  hasSubscription: boolean

  // Actions (stable references)
  createSubscription: (request: SubscriptionCreateRequest) => Promise<SubscriptionCreateResponse>
  upgradeSubscription: (request: SubscriptionUpgradeRequest) => Promise<SubscriptionUpgradeResponse>
  getSubscriptionStatus: () => Promise<void>
  getSubscriptionHistory: () => Promise<void>
  renewSubscription: (request: RenewSubscriptionRequest) => Promise<void>
  scheduleDowngrade: (request: ScheduleDowngradeRequest) => Promise<void>
  reactivateSubscription: (request: ReactivateSubscriptionRequest) => Promise<void>
  clearError: () => void
  clearSubscription: () => void

  // Helper methods
  isOperational: () => boolean
  requiresPayment: () => boolean
  daysUntilExpiry: () => number | null
  canUpgrade: () => boolean
  canDowngrade: () => boolean
}

// ============================================================================
// Main Subscription Hook
// ============================================================================

export function useSubscription(): UseSubscriptionReturn {
  // Selective store subscriptions (performance optimized)
  const subscription = useSubscriptionStore(subscriptionSelectors.subscription)
  const history = useSubscriptionStore(subscriptionSelectors.history)
  const isLoading = useSubscriptionStore(subscriptionSelectors.isLoading)
  const error = useSubscriptionStore(subscriptionSelectors.error)
  const isActive = useSubscriptionStore(subscriptionSelectors.isActive)
  const planTier = useSubscriptionStore(subscriptionSelectors.planTier)
  const planName = useSubscriptionStore(subscriptionSelectors.planName)
  const daysRemaining = useSubscriptionStore(subscriptionSelectors.daysRemaining)
  const deploymentAllowed = useSubscriptionStore(subscriptionSelectors.deploymentAllowed)
  const hasSubscription = useSubscriptionStore(subscriptionSelectors.hasSubscription)

  // Store actions (use stable selectors for performance)
  const createSubscriptionAction = useSubscriptionStore(subscriptionSelectors.createSubscription)
  const upgradeSubscriptionAction = useSubscriptionStore(subscriptionSelectors.upgradeSubscription)
  const getSubscriptionStatusAction = useSubscriptionStore(subscriptionSelectors.getSubscriptionStatus)
  const getSubscriptionHistoryAction = useSubscriptionStore(subscriptionSelectors.getSubscriptionHistory)
  const renewSubscriptionAction = useSubscriptionStore(subscriptionSelectors.renewSubscription)
  const scheduleDowngradeAction = useSubscriptionStore(subscriptionSelectors.scheduleDowngrade)
  const reactivateSubscriptionAction = useSubscriptionStore(subscriptionSelectors.reactivateSubscription)
  const clearError = useSubscriptionStore(subscriptionSelectors.clearError)
  const clearSubscription = useSubscriptionStore(subscriptionSelectors.clearSubscription)
  const isOperational = useSubscriptionStore(subscriptionSelectors.isOperational)
  const requiresPayment = useSubscriptionStore(subscriptionSelectors.requiresPayment)
  const daysUntilExpiry = useSubscriptionStore(subscriptionSelectors.daysUntilExpiry)
  const canUpgrade = useSubscriptionStore(subscriptionSelectors.canUpgrade)
  const canDowngrade = useSubscriptionStore(subscriptionSelectors.canDowngrade)

  // ============================================================================
  // Stable Action Implementations
  // ============================================================================

  const createSubscription = useCallback(async (request: SubscriptionCreateRequest): Promise<SubscriptionCreateResponse> => {
    return createSubscriptionAction(request)
  }, [createSubscriptionAction])

  const upgradeSubscription = useCallback(async (request: SubscriptionUpgradeRequest): Promise<SubscriptionUpgradeResponse> => {
    return upgradeSubscriptionAction(request)
  }, [upgradeSubscriptionAction])

  const getSubscriptionStatus = useCallback(async (): Promise<void> => {
    return getSubscriptionStatusAction()
  }, [getSubscriptionStatusAction])

  const getSubscriptionHistory = useCallback(async (): Promise<void> => {
    return getSubscriptionHistoryAction()
  }, [getSubscriptionHistoryAction])

  const renewSubscription = useCallback(async (request: RenewSubscriptionRequest): Promise<void> => {
    return renewSubscriptionAction(request)
  }, [renewSubscriptionAction])

  const scheduleDowngrade = useCallback(async (request: ScheduleDowngradeRequest): Promise<void> => {
    return scheduleDowngradeAction(request)
  }, [scheduleDowngradeAction])

  const reactivateSubscription = useCallback(async (request: ReactivateSubscriptionRequest): Promise<void> => {
    return reactivateSubscriptionAction(request)
  }, [reactivateSubscriptionAction])

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State (reactive)
    subscription,
    history,
    isLoading,
    error,

    // Computed state
    isActive,
    planTier,
    planName,
    daysRemaining,
    deploymentAllowed,
    hasSubscription,

    // Actions (stable)
    createSubscription,
    upgradeSubscription,
    getSubscriptionStatus,
    getSubscriptionHistory,
    renewSubscription,
    scheduleDowngrade,
    reactivateSubscription,
    clearError,
    clearSubscription,

    // Helper methods
    isOperational,
    requiresPayment,
    daysUntilExpiry,
    canUpgrade,
    canDowngrade,
  }
}

// ============================================================================
// Granular Hooks (Performance Optimization)
// ============================================================================

/**
 * Hook for subscription status only - minimal re-renders
 */
export function useSubscriptionStatus() {
  return {
    isActive: useSubscriptionStore(subscriptionSelectors.isActive),
    planTier: useSubscriptionStore(subscriptionSelectors.planTier),
    deploymentAllowed: useSubscriptionStore(subscriptionSelectors.deploymentAllowed),
    hasSubscription: useSubscriptionStore(subscriptionSelectors.hasSubscription),
    isLoading: useSubscriptionStore(subscriptionSelectors.isLoading)
  }
}

/**
 * Hook for subscription data only - minimal re-renders
 */
export function useSubscriptionData() {
  return {
    subscription: useSubscriptionStore(subscriptionSelectors.subscription),
    planName: useSubscriptionStore(subscriptionSelectors.planName),
    planTier: useSubscriptionStore(subscriptionSelectors.planTier),
    daysRemaining: useSubscriptionStore(subscriptionSelectors.daysRemaining),
  }
}

/**
 * Hook for subscription actions only - no reactive state
 */
export function useSubscriptionActions() {
  const clearError = useSubscriptionStore(subscriptionSelectors.clearError)
  const clearSubscription = useSubscriptionStore(subscriptionSelectors.clearSubscription)

  return { clearError, clearSubscription }
}

// ============================================================================
// Default Export
// ============================================================================

export default useSubscription
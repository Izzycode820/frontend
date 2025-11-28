/**
 * Subscription Store - Zustand 2024 Best Practices
 * Manages subscription state, status, and operations
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  SubscriptionStatusResponse,
  SubscriptionCreateRequest,
  SubscriptionCreateResponse,
  SubscriptionUpgradeRequest,
  SubscriptionUpgradeResponse,
  SubscriptionHistoryResponse,
  RenewSubscriptionRequest,
  ScheduleDowngradeRequest,
  ReactivateSubscriptionRequest,
} from '../../types/subscription'
import type { SubscriptionData } from '../../types/authentication'
import subscriptionService from '../../services/subscription/subscription'

// ============================================================================
// Subscription Store State Interface
// ============================================================================

interface SubscriptionStoreState {
  // Subscription Data
  subscription: SubscriptionStatusResponse['subscription'] | null
  history: SubscriptionHistoryResponse | null

  // UI State
  isLoading: boolean
  error: string | null

  // Actions - Subscription Management
  createSubscription: (request: SubscriptionCreateRequest) => Promise<SubscriptionCreateResponse>
  upgradeSubscription: (request: SubscriptionUpgradeRequest) => Promise<SubscriptionUpgradeResponse>
  getSubscriptionStatus: () => Promise<void>
  getSubscriptionHistory: () => Promise<void>
  renewSubscription: (request: RenewSubscriptionRequest) => Promise<void>
  scheduleDowngrade: (request: ScheduleDowngradeRequest) => Promise<void>
  reactivateSubscription: (request: ReactivateSubscriptionRequest) => Promise<void>

  // UI Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  clearSubscription: () => void

  // Sync Actions (Industry standard: Auth0, Firebase, Stripe pattern)
  syncFromAuth: (jwtSubscription: SubscriptionData | null) => void

  // Computed/Helper Methods
  isActive: () => boolean
  isOperational: () => boolean
  requiresPayment: () => boolean
  daysUntilExpiry: () => number | null
  canUpgrade: () => boolean
  canDowngrade: () => boolean
}

// ============================================================================
// Create Subscription Store
// ============================================================================

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================
      subscription: null,
      history: null,
      isLoading: false,
      error: null,

      // ========================================================================
      // Subscription Actions
      // ========================================================================

      createSubscription: async (request) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await subscriptionService.createSubscription(request)

          set((state) => {
            state.subscription = response.subscription as SubscriptionStatusResponse['subscription']
            state.isLoading = false
          })

          return response
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      upgradeSubscription: async (request) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await subscriptionService.upgradeSubscription(request)

          set((state) => {
            state.isLoading = false
          })

          // Refresh subscription status after upgrade
          await get().getSubscriptionStatus()

          return response
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      getSubscriptionStatus: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response = await subscriptionService.getSubscriptionStatus()

          set((state) => {
            state.subscription = response.subscription
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      getSubscriptionHistory: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const history = await subscriptionService.getSubscriptionHistory()

          set((state) => {
            state.history = history
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      renewSubscription: async (request) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          await subscriptionService.renewSubscription(request)

          set((state) => {
            state.isLoading = false
          })

          // Refresh subscription status after renewal
          await get().getSubscriptionStatus()
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      scheduleDowngrade: async (request) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          await subscriptionService.scheduleDowngrade(request)

          set((state) => {
            state.isLoading = false
          })

          // Refresh subscription status
          await get().getSubscriptionStatus()
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      reactivateSubscription: async (request) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          await subscriptionService.reactivateSubscription(request)

          set((state) => {
            state.isLoading = false
          })

          // Refresh subscription status
          await get().getSubscriptionStatus()
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Operation failed'
            state.isLoading = false
          })
          throw error
        }
      },

      // ========================================================================
      // UI State Actions
      // ========================================================================

      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      setError: (error) => {
        set((state) => {
          state.error = error
          if (error) {
            state.isLoading = false
          }
        })
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      clearSubscription: () => {
        set((state) => {
          state.subscription = null
          state.history = null
          state.error = null
        })
      },

      // ========================================================================
      // Sync Actions - Industry Standard Pattern (Auth0, Firebase, Stripe)
      // ========================================================================

      syncFromAuth: (jwtSubscription) => {
        set((state) => {
          if (!jwtSubscription) {
            state.subscription = null
            return
          }

          // Convert JWT SubscriptionData to SubscriptionStatusResponse format
          // This keeps subscriptionStore in sync with authStore automatically

          // Map JWT status to API status (JWT uses 'inactive', API uses 'expired')
          const statusMap: Record<string, 'active' | 'pending_payment' | 'expired' | 'grace_period' | 'suspended'> = {
            'active': 'active',
            'grace_period': 'grace_period',
            'expired': 'expired',
            'inactive': 'expired', // JWT inactive → API expired
            'pending_payment': 'pending_payment',
            'suspended': 'suspended'
          }

          state.subscription = {
            id: jwtSubscription.plan_id || 'free',
            plan: {
              name: jwtSubscription.tier.charAt(0).toUpperCase() + jwtSubscription.tier.slice(1),
              tier: jwtSubscription.tier,
              price_fcfa: 0, // Price not included in JWT (fetch from pricing if needed)
            },
            status: statusMap[jwtSubscription.status] || 'expired',
            started_at: new Date().toISOString(), // Not in JWT
            expires_at: jwtSubscription.expires_at || '',
            days_remaining: jwtSubscription.trial?.days_remaining || 0,
            is_active: jwtSubscription.status === 'active',
            deployment_allowed: jwtSubscription.limits.deployment_allowed,
            limits: {
              storage_gb: jwtSubscription.limits.storage_gb,
              bandwidth_gb: jwtSubscription.limits.bandwidth_gb,
              deployed_sites: jwtSubscription.limits.sites_limit,
              workspaces: jwtSubscription.limits.max_workspaces,
              custom_domains: jwtSubscription.limits.custom_domains,
            },
            capabilities: {
              deployment_allowed: jwtSubscription.limits.deployment_allowed,
              custom_domains_allowed: jwtSubscription.limits.custom_domains > 0,
              analytics_enabled: jwtSubscription.infrastructure?.analytics_level !== 'none',
              white_label_enabled: jwtSubscription.infrastructure?.white_label || false,
              dedicated_support: jwtSubscription.infrastructure?.support || false,
              api_access: jwtSubscription.tier === 'pro' || jwtSubscription.tier === 'enterprise',
              priority_support: jwtSubscription.tier === 'enterprise',
            },
          }
        })
      },

      // ========================================================================
      // Computed/Helper Methods
      // ========================================================================

      isActive: () => {
        const { subscription } = get()
        return subscription?.is_active ?? false
      },

      isOperational: () => {
        const { subscription } = get()
        return subscription?.status === 'active' || subscription?.status === 'grace_period'
      },

      requiresPayment: () => {
        const { subscription } = get()
        return subscription?.status === 'pending_payment'
      },

      daysUntilExpiry: () => {
        const { subscription } = get()
        return subscription?.days_remaining ?? null
      },

      canUpgrade: () => {
        const { subscription } = get()
        if (!subscription) return false
        return subscription.plan.tier !== 'enterprise' && subscription.is_active
      },

      canDowngrade: () => {
        const { subscription } = get()
        if (!subscription) return false
        return subscription.plan.tier !== 'free' && subscription.is_active
      },
    }))
  )
)

// ============================================================================
// Selectors for Performance
// ============================================================================

export const subscriptionSelectors = {
  // Core selectors
  subscription: (state: SubscriptionStoreState) => state.subscription,
  history: (state: SubscriptionStoreState) => state.history,
  isLoading: (state: SubscriptionStoreState) => state.isLoading,
  error: (state: SubscriptionStoreState) => state.error,

  // Computed selectors
  isActive: (state: SubscriptionStoreState) => state.subscription?.is_active ?? false,
  planTier: (state: SubscriptionStoreState) => state.subscription?.plan.tier,
  planName: (state: SubscriptionStoreState) => state.subscription?.plan.name,
  daysRemaining: (state: SubscriptionStoreState) => state.subscription?.days_remaining,
  deploymentAllowed: (state: SubscriptionStoreState) => state.subscription?.deployment_allowed ?? false,
  hasSubscription: (state: SubscriptionStoreState) => state.subscription !== null,

  // Action selectors (stable references)
  createSubscription: (state: SubscriptionStoreState) => state.createSubscription,
  upgradeSubscription: (state: SubscriptionStoreState) => state.upgradeSubscription,
  getSubscriptionStatus: (state: SubscriptionStoreState) => state.getSubscriptionStatus,
  getSubscriptionHistory: (state: SubscriptionStoreState) => state.getSubscriptionHistory,
  renewSubscription: (state: SubscriptionStoreState) => state.renewSubscription,
  scheduleDowngrade: (state: SubscriptionStoreState) => state.scheduleDowngrade,
  reactivateSubscription: (state: SubscriptionStoreState) => state.reactivateSubscription,
  clearError: (state: SubscriptionStoreState) => state.clearError,
  clearSubscription: (state: SubscriptionStoreState) => state.clearSubscription,
  syncFromAuth: (state: SubscriptionStoreState) => state.syncFromAuth,
  isOperational: (state: SubscriptionStoreState) => state.isOperational,
  requiresPayment: (state: SubscriptionStoreState) => state.requiresPayment,
  daysUntilExpiry: (state: SubscriptionStoreState) => state.daysUntilExpiry,
  canUpgrade: (state: SubscriptionStoreState) => state.canUpgrade,
  canDowngrade: (state: SubscriptionStoreState) => state.canDowngrade,
}

// ============================================================================
// Export
// ============================================================================

export default useSubscriptionStore
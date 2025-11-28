/**
 * Core Authentication Store - Zustand 2024 Best Practices
 * Manages user authentication state, tokens, and core auth flow
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  UserData,
  LoginResponse,
  RefreshTokenResponse,
  LeaveWorkspaceResponse,
  SubscriptionData,
  WorkspaceAuthContext
} from '../../types/authentication'
import authService from '../../services/authentication/auth'
import { extractSubscriptionFromJWT, extractWorkspaceFromJWT } from '../../utils/jwt'
import { useSubscriptionStore } from '../subscription/subscriptionStore'
import { useWorkspaceStore } from './workspaceStore'

// ============================================================================
// Token Refresh Race Condition Prevention
// ============================================================================

let refreshPromise: Promise<RefreshTokenResponse> | null = null

// ============================================================================
// Auth Store State Interface
// ============================================================================

interface AuthStoreState {
  // Core Authentication State
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Token Management
  token: string | null
  tokenExpiresAt: number | null

  // User Context
  subscription: SubscriptionData | null
  workspace: WorkspaceAuthContext | null

  // Session Info
  lastActivity: number | null
  isSessionValid: boolean

  // Initialization State (for session restoration)
  isInitialized: boolean

  // Actions
  setLoginSuccess: (response: LoginResponse) => void
  setLogoutSuccess: () => void
  setRefreshSuccess: (response: RefreshTokenResponse) => void
  setLeaveSuccess: (response: LeaveWorkspaceResponse) => void
  setUser: (user: UserData) => void
  updateUser: (updates: Partial<UserData>) => void
  setSubscription: (subscription: SubscriptionData | null) => void
  setWorkspace: (workspace: WorkspaceAuthContext | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  setToken: (token: string, expiresIn?: number) => void
  clearTokens: () => void
  updateLastActivity: () => void
  setInitialized: (initialized: boolean) => void
  initializeSession: () => Promise<void>

  // Computed/Helper Methods
  isTokenExpired: () => boolean
  getTimeUntilExpiry: () => number | null
  hasPermission: (permission: string) => boolean
  hasFeature: (featureBitmap: number) => boolean
  refreshTokenSafe: () => Promise<RefreshTokenResponse>
}

// ============================================================================
// Create Auth Store with 2024 Best Practices
// ============================================================================

export const useAuthStore = create<AuthStoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      tokenExpiresAt: null,
      subscription: null,
      workspace: null,
      lastActivity: null,
      isSessionValid: false,
      isInitialized: false,

      // ========================================================================
      // Authentication Actions
      // ========================================================================

      setLoginSuccess: (response) => {
        set((state) => {
          const accessToken = response.tokens?.access_token

          state.user = response.user || null
          state.isAuthenticated = !!(response.user && accessToken)
          state.isLoading = false
          state.error = null
          state.token = accessToken || null
          state.tokenExpiresAt = response.tokens?.expires_in
            ? Date.now() + (response.tokens.expires_in * 1000)
            : null

          // Extract subscription from JWT (industry standard - Auth0, Firebase, Stripe pattern)
          const subscription = accessToken ? extractSubscriptionFromJWT(accessToken) : null
          state.subscription = subscription

          // Sync subscription to subscriptionStore (keeps all stores in sync)
          useSubscriptionStore.getState().syncFromAuth(subscription)

          // Extract workspace from JWT or response
          if (accessToken) {
            const jwtWorkspace = extractWorkspaceFromJWT(accessToken)
            state.workspace = jwtWorkspace ? {
              id: jwtWorkspace.id,
              type: jwtWorkspace.type as 'store' | 'blog' | 'services' | 'portfolio',
              name: response.workspace?.name || '',
              status: response.workspace?.status || 'active',
              permissions: jwtWorkspace.permissions,
              role: jwtWorkspace.role,
              is_default: response.workspace?.is_default ?? true
            } : response.workspace || null

            // Track workspace context if present (for refresh flow)
            if (state.workspace?.id) {
              WorkspaceContextManager.setCurrentWorkspace(state.workspace.id)
            }
          } else {
            state.workspace = response.workspace || null
          }

          state.lastActivity = Date.now()
          state.isSessionValid = true
        })
      },

      setLogoutSuccess: () => {
        set((state) => {
          state.user = null
          state.isAuthenticated = false
          state.isLoading = false
          state.error = null
          state.token = null
          state.tokenExpiresAt = null
          state.subscription = null
          state.workspace = null
          state.lastActivity = null
          state.isSessionValid = false
        })

        // Clear workspace context on logout
        WorkspaceContextManager.clearWorkspace()

        // Notify other tabs about logout
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-logout', Date.now().toString())
          localStorage.removeItem('auth-logout')
        }
      },

      setRefreshSuccess: (response) => {
        set((state) => {
          const accessToken = response.tokens?.access_token
          const expiresIn = response.tokens?.expires_in

          if (accessToken) {
            state.token = accessToken
            state.tokenExpiresAt = expiresIn
              ? Date.now() + (expiresIn * 1000)
              : null

            // Extract subscription from JWT on refresh
            state.subscription = extractSubscriptionFromJWT(accessToken)

            // Sync subscription to subscriptionStore (keeps all stores in sync)
            useSubscriptionStore.getState().syncFromAuth(state.subscription)

            // Extract workspace from JWT (v2.0: Backend now includes workspace_id in refresh token)
            // This ensures workspace context is preserved across token refreshes (Shopify pattern)
            const jwtWorkspace = extractWorkspaceFromJWT(accessToken)
            if (jwtWorkspace) {
              // Merge JWT claims (id, type, role, permissions) with response data (name, status)
              const completeWorkspace: WorkspaceAuthContext = {
                id: jwtWorkspace.id,
                type: jwtWorkspace.type as 'store' | 'blog' | 'services' | 'portfolio',
                name: response.workspace?.name || state.workspace?.name || '',
                status: response.workspace?.status || state.workspace?.status || 'active',
                permissions: jwtWorkspace.permissions,
                role: jwtWorkspace.role,
                is_default: response.workspace?.is_default ?? (state.workspace?.is_default ?? true)
              }

              state.workspace = completeWorkspace

              // Sync to workspaceStore for unified state management
              useWorkspaceStore.getState().setCurrentWorkspace(completeWorkspace)

              // Update workspace context tracking
              WorkspaceContextManager.setCurrentWorkspace(completeWorkspace.id)
            } else {
              // No workspace claims in JWT - clear workspace context
              state.workspace = null
              useWorkspaceStore.getState().setCurrentWorkspace(null)
              WorkspaceContextManager.clearWorkspace()
            }
          }

          if (response.user && state.user) {
            // Merge refresh user data with existing user data
            Object.assign(state.user, response.user)
          }

          state.lastActivity = Date.now()
        })
      },

      setLeaveSuccess: (response) => {
        set((state) => {
          const accessToken = response.tokens?.access_token
          const expiresIn = response.tokens?.expires_in

          if (accessToken) {
            // Update token (new token WITHOUT workspace claims)
            state.token = accessToken
            state.tokenExpiresAt = expiresIn
              ? Date.now() + (expiresIn * 1000)
              : null

            // Extract subscription from JWT (unchanged)
            state.subscription = extractSubscriptionFromJWT(accessToken)

            // Sync subscription to subscriptionStore
            useSubscriptionStore.getState().syncFromAuth(state.subscription)

            // Clear workspace context (user left workspace)
            state.workspace = null

            // Sync to workspaceStore - clear currentWorkspace
            useWorkspaceStore.getState().setCurrentWorkspace(null)

            // Clear localStorage tracking
            WorkspaceContextManager.clearWorkspace()
          }

          state.lastActivity = Date.now()
        })
      },

      // ========================================================================
      // User Management Actions
      // ========================================================================

      setUser: (user) => {
        set((state) => {
          state.user = user
        })
      },

      updateUser: (updates) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates)
          }
        })
      },

      setSubscription: (subscription) => {
        set((state) => {
          state.subscription = subscription
          if (state.user && subscription) {
            state.user.subscription = subscription
          }
        })
      },

      setWorkspace: (workspace) => {
        set((state) => {
          state.workspace = workspace
          // Track workspace context for refresh flow
          if (workspace?.id) {
            WorkspaceContextManager.setCurrentWorkspace(workspace.id)
          } else {
            WorkspaceContextManager.clearWorkspace()
          }
        })
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

      // ========================================================================
      // Token Management Actions
      // ========================================================================

      setToken: (token, expiresIn) => {
        set((state) => {
          state.token = token
          state.tokenExpiresAt = expiresIn
            ? Date.now() + (expiresIn * 1000)
            : null
          state.isAuthenticated = !!token
        })
      },

      clearTokens: () => {
        set((state) => {
          state.token = null
          state.tokenExpiresAt = null
          state.isAuthenticated = false
        })
      },

      updateLastActivity: () => {
        set((state) => {
          state.lastActivity = Date.now()
        })
      },

      setInitialized: (initialized) => {
        set((state) => {
          state.isInitialized = initialized
        })
      },

      initializeSession: async () => {
        // Already initialized, skip
        if (get().isInitialized) return

        try {
          // Try to restore session from refresh token cookie
          const response = await authService.refreshToken()

          if (response.tokens?.access_token) {
            // Session restored successfully - setRefreshSuccess extracts subscription from JWT
            get().setRefreshSuccess(response)

            // If we got user data, update the store
            if (response.user) {
              const fullUserData: UserData = {
                ...response.user,
                bio: '',
                phone_verified: false,
                two_factor_enabled: false,
                preferred_auth_method: 'password',
                security_notifications: true,
                created_at: new Date().toISOString(),
                // Subscription comes from JWT (already set by setRefreshSuccess)
                subscription: get().subscription!
              }
              get().setUser(fullUserData)
            }

            // Initialize workspace store from JWT if workspace context exists
            const workspace = get().workspace
            if (workspace?.id) {
              useWorkspaceStore.getState().setCurrentWorkspace(workspace)
            }

            set((state) => {
              state.isAuthenticated = true
              state.isSessionValid = true
            })
          }
        } catch {
          // No valid refresh token or session expired - this is normal
          console.log('No valid session to restore')
        } finally {
          // Mark as initialized regardless of success
          get().setInitialized(true)
        }
      },

      // ========================================================================
      // Computed/Helper Methods
      // ========================================================================

      isTokenExpired: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return true
        return Date.now() >= tokenExpiresAt
      },

      getTimeUntilExpiry: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return null
        const timeLeft = tokenExpiresAt - Date.now()
        return timeLeft > 0 ? timeLeft : 0
      },

      hasPermission: (permission) => {
        const { workspace } = get()
        return workspace?.permissions?.includes(permission) ?? false
      },

      hasFeature: (featureBitmap) => {
        const { subscription } = get()
        if (!subscription?.features_bitmap) return false
        return (subscription.features_bitmap & featureBitmap) === featureBitmap
      },

      refreshTokenSafe: async () => {
        if (refreshPromise) return refreshPromise

        refreshPromise = authService.refreshToken()
        try {
          const result = await refreshPromise
          get().setRefreshSuccess(result)
          return result
        } finally {
          refreshPromise = null
        }
      }
    }))
  )
)

// ============================================================================
// Selectors for Performance (2024 Best Practice)
// ============================================================================

export const authSelectors = {
  // Core selectors
  isAuthenticated: (state: AuthStoreState) => state.isAuthenticated,
  isInitialized: (state: AuthStoreState) => state.isInitialized,
  user: (state: AuthStoreState) => state.user,
  workspace: (state: AuthStoreState) => state.workspace,
  subscription: (state: AuthStoreState) => state.subscription,
  isLoading: (state: AuthStoreState) => state.isLoading,
  error: (state: AuthStoreState) => state.error,
  token: (state: AuthStoreState) => state.token,

  // Computed selectors
  isFullyAuthenticated: (state: AuthStoreState) =>
    state.isAuthenticated && state.user !== null,
  hasActiveSubscription: (state: AuthStoreState) =>
    state.subscription?.status === 'active',
  isTrialUser: (state: AuthStoreState) =>
    state.subscription?.tier === 'free' || false,
  userDisplayName: (state: AuthStoreState) =>
    state.user ? `${state.user.first_name} ${state.user.last_name}` : null,
  currentWorkspaceName: (state: AuthStoreState) =>
    state.workspace?.name || null,

  // Trial selectors (O(1) performance)
  trial: (state: AuthStoreState) => state.subscription?.trial || null,
  isTrialEligible: (state: AuthStoreState) =>
    state.subscription?.trial?.eligible ?? false,
  hasUsedTrial: (state: AuthStoreState) =>
    state.subscription?.trial?.used_trial ?? false,
  isOnActiveTrial: (state: AuthStoreState) => {
    const trial = state.subscription?.trial;
    if (!trial?.current_tier) return false;
    if (!trial?.expires_at) return false;
    return new Date(trial.expires_at) > new Date();
  },
  trialDaysRemaining: (state: AuthStoreState) =>
    state.subscription?.trial?.days_remaining ?? null,
  canUpgradeTrial: (state: AuthStoreState) =>
    state.subscription?.trial?.can_upgrade ?? false,

  // Workspace limit selectors (from JWT subscription claims)
  maxWorkspaces: (state: AuthStoreState) =>
    state.subscription?.limits?.max_workspaces ?? 1,
  subscriptionLimits: (state: AuthStoreState) =>
    state.subscription?.limits || null,
}

// ============================================================================
// Cross-Tab Sync Setup
// ============================================================================

if (typeof window !== 'undefined') {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'auth-logout' && e.newValue) {
      useAuthStore.getState().setLogoutSuccess()
    }
  }

  window.addEventListener('storage', handleStorageChange)
}

// ============================================================================
// Workspace Context Tracking (Cross-Tab Sync Safe)
// ============================================================================

/**
 * Workspace Context Manager - Industry Standard for Multi-Tenant Apps
 *
 * v2.0 Update: Workspace context now preserved via refresh token (Shopify pattern)
 * - Backend includes workspace_id in refresh token payload
 * - On token refresh, backend automatically restores workspace context
 * - localStorage used as OPTIONAL override/fallback mechanism
 *
 * Security Note: workspace_id is a non-sensitive UUID reference, safe for localStorage
 * NEVER store tokens or PII here - only context identifiers
 *
 * Benefits:
 * - Seamless workspace context preservation across token refreshes ✅
 * - Cross-tab synchronization (user switches workspace, all tabs update)
 * - Survives page refresh (better UX than sessionStorage)
 * - Non-sensitive data (OWASP compliant)
 */
export const WorkspaceContextManager = {
  /**
   * Set current workspace context
   * Called when user switches to a workspace
   */
  setCurrentWorkspace: (workspaceId: string | null): void => {
    if (typeof window === 'undefined') return

    if (workspaceId) {
      localStorage.setItem('current_workspace_id', workspaceId)
      // Notify other tabs about workspace switch
      localStorage.setItem('workspace-switch', Date.now().toString())
      localStorage.removeItem('workspace-switch')
    } else {
      localStorage.removeItem('current_workspace_id')
    }
  },

  /**
   * Get current workspace context
   * Returns workspace_id if user is in a workspace, null otherwise
   */
  getCurrentWorkspace: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('current_workspace_id')
  },

  /**
   * Clear workspace context
   * Called on logout or when user leaves workspace
   */
  clearWorkspace: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('current_workspace_id')
  },

  /**
   * Check if user is currently in a workspace
   */
  hasWorkspaceContext: (): boolean => {
    return !!WorkspaceContextManager.getCurrentWorkspace()
  }
}

// ============================================================================
// Store Instance and Default Export
// ============================================================================

export default useAuthStore
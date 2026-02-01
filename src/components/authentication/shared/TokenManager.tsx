'use client'

console.log('[LOAD] TokenManager module');

/**
 * Token Management Component
 * Handles silent token refresh and session management
 * Uses existing auth store and service infrastructure
 *
 * v3.0 - Enhanced with TokenRefreshCoordinator integration
 * - Prevents race conditions with AuthInitializer
 * - De-duplicates refresh calls across components
 * - Graceful handling during initialization phase
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, authSelectors } from '@/stores/authentication/authStore'
import { storeAuthIntent } from '@/utils/redirect-with-intent'
import { TokenRefreshCoordinator } from '@/services/authentication/TokenRefreshCoordinator'

// ============================================================================
// Error Type Detection Helpers
// ============================================================================

/**
 * Check if error is a network/offline error
 * These should NOT trigger logout - just wait for network to come back
 */
function isNetworkOfflineError(error: unknown): boolean {
  if (!error) return false

  // Check navigator.onLine
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true
  }

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

  // Common network error patterns
  const networkErrorPatterns = [
    'network',
    'fetch',
    'failed to fetch',
    'networkerror',
    'net::',
    'econnrefused',
    'enotfound',
    'timeout',
    'abort',
    'offline',
    'internet',
    'connection',
    'cors' // Sometimes CORS errors happen during network issues
  ]

  return networkErrorPatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Check if error is an authentication error
 * ONLY these should trigger logout
 */
function isAuthenticationError(error: unknown): boolean {
  if (!error) return false

  // Check for APIError with status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status
    // 401 = Unauthorized (token invalid/expired)
    // 403 = Forbidden (but might be permission issue, not auth)
    return status === 401
  }

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

  // Auth error patterns - be conservative, only match clear auth failures
  const authErrorPatterns = [
    'unauthorized',
    'invalid token',
    'token expired',
    'token invalid',
    'authentication failed',
    'session expired',
    'refresh token',
    '401'
  ]

  return authErrorPatterns.some(pattern => errorMessage.includes(pattern))
}

interface TokenManagerProps {
  children: React.ReactNode
  refreshBeforeExpiry?: number // Minutes before expiry to refresh
  checkInterval?: number // How often to check token status (milliseconds)
}

export function TokenManager({
  children,
  refreshBeforeExpiry = 5, // Refresh 5 minutes before expiry
  checkInterval = 60000 // Check every minute
}: TokenManagerProps) {
  const router = useRouter()
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const refreshingRef = React.useRef(false)
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = React.useState(false)

  // Auth store selectors
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const isTokenExpired = useAuthStore((state: any) => state.isTokenExpired)
  const getTimeUntilExpiry = useAuthStore((state: any) => state.getTimeUntilExpiry)
  const refreshTokenSafe = useAuthStore((state: any) => state.refreshTokenSafe)
  const setLogoutSuccess = useAuthStore((state: any) => state.setLogoutSuccess)

  // Soft navigation effect - triggers after logout state update
  React.useEffect(() => {
    if (shouldRedirectToLogin) {
      router.push('/auth/login?expired=true')
      setShouldRedirectToLogin(false)
    }
  }, [shouldRedirectToLogin, router])

  const checkAndRefreshToken = React.useCallback(async () => {
    if (refreshingRef.current || !isAuthenticated) return

    // Check if coordinator allows refresh (prevents race condition during initialization)
    if (!TokenRefreshCoordinator.canTokenManagerRefresh()) {
      console.log('[TokenManager] Refresh blocked by coordinator - initialization in progress')
      return
    }

    // Don't refresh if we're on auth pages (login, signup, etc.)
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname.startsWith('/auth/')) {
        console.log('[TokenManager] On auth page, skipping refresh')
        return
      }
    }

    try {
      const timeUntilExpiry = getTimeUntilExpiry()

      if (timeUntilExpiry === null) return

      // Convert refreshBeforeExpiry from minutes to milliseconds
      const refreshThreshold = refreshBeforeExpiry * 60 * 1000

      // If token is expired or will expire soon, refresh it
      if (timeUntilExpiry <= refreshThreshold) {
        refreshingRef.current = true

        try {
          await refreshTokenSafe()
          console.log('[TokenManager] Token refreshed successfully')
        } catch (error) {
          // Check if this was blocked due to initialization - DON'T logout in this case
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('initialization') || errorMessage.includes('blocked')) {
            console.log('[TokenManager] Refresh blocked during initialization - this is expected')
            return
          }

          // Check for network errors - DON'T logout, just wait for network to come back
          const isNetworkError = isNetworkOfflineError(error)
          if (isNetworkError) {
            console.log('[TokenManager] Network error detected, will retry when online')
            return
          }

          // Check for auth errors (401, invalid token) - ONLY these should trigger logout
          const isAuthError = isAuthenticationError(error)
          if (!isAuthError) {
            console.log('[TokenManager] Non-auth error, not logging out:', errorMessage)
            return
          }

          console.error('[TokenManager] Authentication error, logging out:', error)

          // CRITICAL: Capture intent BEFORE logout (preserves workspace context)
          const currentPath = window.location.pathname + window.location.search
          const currentWorkspaceId = localStorage.getItem('current_workspace_id')
          storeAuthIntent(currentPath, currentWorkspaceId)

          // Now logout user (this clears workspace context in store)
          setLogoutSuccess()

          // Use soft navigation (preserves React state where possible)
          // router.push is called in useEffect below after state update
          setShouldRedirectToLogin(true)
        }
      }
    } catch (error) {
      console.error('[TokenManager] Error checking token status:', error)
    } finally {
      refreshingRef.current = false
    }
  }, [isAuthenticated, getTimeUntilExpiry, refreshBeforeExpiry, refreshTokenSafe, setLogoutSuccess])

  // Set up token checking interval
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial check
    checkAndRefreshToken()

    // Set up periodic checks
    intervalRef.current = setInterval(checkAndRefreshToken, checkInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated, checkAndRefreshToken, checkInterval])

  // Handle page visibility changes - refresh when page becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // Check token when page becomes visible
        checkAndRefreshToken()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, checkAndRefreshToken])

  // Handle online/offline events - retry refresh when network comes back
  React.useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated) {
        console.log('[TokenManager] Network restored, checking token status')
        // Small delay to ensure network is stable
        setTimeout(() => {
          checkAndRefreshToken()
        }, 1000)
      }
    }

    const handleOffline = () => {
      console.log('[TokenManager] Network offline, will retry when online')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated, checkAndRefreshToken])

  // Handle user activity - refresh on activity if token is close to expiry
  React.useEffect(() => {
    const handleUserActivity = () => {
      if (isAuthenticated && !refreshingRef.current) {
        const timeUntilExpiry = getTimeUntilExpiry()
        const refreshThreshold = refreshBeforeExpiry * 60 * 1000

        if (timeUntilExpiry !== null && timeUntilExpiry <= refreshThreshold) {
          checkAndRefreshToken()
        }
      }
    }

    // Throttle activity checks to avoid excessive calls
    let activityTimeout: NodeJS.Timeout | null = null
    const throttledActivityHandler = () => {
      if (activityTimeout) return

      activityTimeout = setTimeout(() => {
        handleUserActivity()
        activityTimeout = null
      }, 30000) // Throttle to once per 30 seconds
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    events.forEach(event => {
      document.addEventListener(event, throttledActivityHandler, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledActivityHandler)
      })
      if (activityTimeout) {
        clearTimeout(activityTimeout)
      }
    }
  }, [isAuthenticated, getTimeUntilExpiry, refreshBeforeExpiry, checkAndRefreshToken])

  return <>{children}</>
}

/**
 * Hook for manual token management operations
 */
export function useTokenManager() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const isTokenExpired = useAuthStore((state: any) => state.isTokenExpired)
  const getTimeUntilExpiry = useAuthStore((state: any) => state.getTimeUntilExpiry)
  const refreshTokenSafe = useAuthStore((state: any) => state.refreshTokenSafe)

  const forceRefresh = React.useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      await refreshTokenSafe()
      return true
    } catch (error) {
      console.error('Force refresh failed:', error)
      throw error
    }
  }, [isAuthenticated, refreshTokenSafe])

  const checkTokenStatus = React.useCallback(() => {
    const timeUntilExpiry = getTimeUntilExpiry()
    const expired = isTokenExpired()

    return {
      isExpired: expired,
      timeUntilExpiry,
      shouldRefresh: timeUntilExpiry !== null && timeUntilExpiry <= 5 * 60 * 1000 // 5 minutes
    }
  }, [getTimeUntilExpiry, isTokenExpired])

  return {
    isAuthenticated,
    forceRefresh,
    checkTokenStatus,
    isTokenExpired: isTokenExpired()
  }
}
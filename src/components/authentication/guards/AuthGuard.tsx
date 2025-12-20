/**
 * Authentication Guard Component
 * Protects routes requiring authentication using Zustand store
 * Follows 2024 best practices with proper loading states
 * OWASP-compliant context preservation with type-safe redirects
 */

'use client'

import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, authSelectors } from '@/stores/authentication/authStore'
import { AuthPageSpinner } from '../shared/AuthLoadingSpinner'
import { redirectToLogin } from '@/utils/redirect-with-intent'

export interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  fallback?: React.ReactNode
  onUnauthorized?: () => void
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallback,
  onUnauthorized
}: AuthGuardProps) {
  const router = useRouter()
  const [isClientMounted, setIsClientMounted] = React.useState(false)

  // Use selective subscriptions for performance
  const isFullyAuthenticated = useAuthStore(authSelectors.isFullyAuthenticated)
  const isLoading = useAuthStore(authSelectors.isLoading)
  const isAuthInitialized = useAuthStore(authSelectors.isInitialized)

  React.useEffect(() => {
    // Mark as mounted after first render to avoid hydration issues
    setIsClientMounted(true)
  }, [])

  React.useEffect(() => {
    // Wait for client mount, auth initialization, and loading to complete
    if (!isClientMounted || !isAuthInitialized || isLoading) return

    if (requireAuth && !isFullyAuthenticated) {
      // Call onUnauthorized callback
      onUnauthorized?.()

      // Redirect with intent preservation (industry standard pattern)
      // Captures current path + query params as the "intent"
      const currentPath = typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/workspace'

      // Use unified redirect helper (handles sessionStorage + ?next param)
      redirectToLogin(router, currentPath)
    }
  }, [isClientMounted, isAuthInitialized, isLoading, isFullyAuthenticated, requireAuth, router, onUnauthorized])

  // Show loading during client mount, auth initialization, or auth loading
  if (!isClientMounted || !isAuthInitialized || isLoading) {
    return fallback || <AuthPageSpinner />
  }

  // Show loading if we're about to redirect
  if (requireAuth && !isFullyAuthenticated) {
    return fallback || <AuthPageSpinner />
  }

  // Show content for authenticated users or when auth is not required
  return <>{children}</>
}

/**
 * Higher-Order Component version for class components or complex patterns
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AuthGuard {...guardProps}>
      <Component {...props} />
    </AuthGuard>
  )

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * Hook for conditional rendering based on auth state
 */
export function useAuthGuard() {
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const isFullyAuthenticated = useAuthStore(authSelectors.isFullyAuthenticated)
  const isLoading = useAuthStore(authSelectors.isLoading)
  const isInitialized = useAuthStore(authSelectors.isInitialized)
  const user = useAuthStore(authSelectors.user)

  return {
    isAuthenticated,
    isFullyAuthenticated,
    isInitialized,
    isLoading,
    user,
    canAccess: isFullyAuthenticated && isInitialized,
    shouldShowLoading: isLoading || !isInitialized,
    shouldRedirect: isInitialized && !isLoading && !isFullyAuthenticated
  }
}
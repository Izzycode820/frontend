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
import { buildLoginRedirect, type RedirectContext } from '@/utils/auth-redirect'

export interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  fallback?: React.ReactNode
  onUnauthorized?: (context?: RedirectContext) => void
  preserveContext?: RedirectContext // NEW: Context preservation
}

export function AuthGuard({
  children,
  redirectTo = '/auth/login',
  requireAuth = true,
  fallback,
  onUnauthorized,
  preserveContext // NEW
}: AuthGuardProps) {
  const router = useRouter()
  const [isClientMounted, setIsClientMounted] = React.useState(false)

  // Use selective subscriptions for performance
  const isFullyAuthenticated = useAuthStore(authSelectors.isFullyAuthenticated)
  const isLoading = useAuthStore(authSelectors.isLoading)
  const isAuthInitialized = useAuthStore(authSelectors.isInitialized)

  // Memoized redirect builder (performance optimization)
  const buildRedirect = useCallback(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''

    // Skip redirect for auth pages
    if (currentPath === '/auth/login' || currentPath === '/auth/register') {
      return redirectTo;
    }

    // Use buildLoginRedirect with OWASP validation and context
    return buildLoginRedirect(currentPath, preserveContext);
  }, [preserveContext, redirectTo]);

  React.useEffect(() => {
    // Mark as mounted after first render to avoid hydration issues
    setIsClientMounted(true)
  }, [])

  React.useEffect(() => {
    // Wait for client mount, auth initialization, and loading to complete
    if (!isClientMounted || !isAuthInitialized || isLoading) return

    if (requireAuth && !isFullyAuthenticated) {
      // Call onUnauthorized callback with context
      onUnauthorized?.(preserveContext)

      // Build and execute redirect
      const redirectUrl = buildRedirect();
      router.replace(redirectUrl);
    }
  }, [isClientMounted, isAuthInitialized, isLoading, isFullyAuthenticated, requireAuth, router, onUnauthorized, preserveContext, buildRedirect])

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
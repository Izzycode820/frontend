/**
 * Authentication Initializer Component
 * Handles session restoration from httpOnly refresh token cookie on app mount
 * Prevents hydration errors with Next.js App Router
 *
 * Flow:
 * 1. Wait for client-side hydration (avoid SSR mismatch)
 * 2. Check if session already initialized
 * 3. Call refresh token endpoint to restore session
 * 4. Hydrate Zustand store with user data
 * 5. Mark initialization complete
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore, authSelectors } from '@/stores/authentication/authStore'
import { AuthPageSpinner } from './AuthLoadingSpinner'

interface AuthInitializerProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthInitializer({
  children,
  fallback
}: AuthInitializerProps) {
  // Hydration protection: wait for client-side mount
  const [isHydrated, setIsHydrated] = useState(false)

  // Auth store state
  const isInitialized = useAuthStore(authSelectors.isInitialized)
  const initializeSession = useAuthStore(state => state.initializeSession)

  // Step 1: Wait for hydration (prevents SSR mismatch)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Step 2: Initialize session after hydration
  useEffect(() => {
    if (!isHydrated) return
    if (isInitialized) return

    // Restore session from refresh token cookie
    initializeSession()
  }, [isHydrated, isInitialized, initializeSession])

  // Show loading during hydration or initialization
  if (!isHydrated || !isInitialized) {
    return fallback || <AuthPageSpinner />
  }

  // Initialization complete - render app
  return <>{children}</>
}

/**
 * Hook for accessing initialization state
 */
export function useAuthInitialization() {
  const isInitialized = useAuthStore(authSelectors.isInitialized)
  const isHydrated = typeof window !== 'undefined'

  return {
    isInitialized,
    isHydrated,
    isReady: isHydrated && isInitialized
  }
}

/**
 * Intent-based Redirect System
 * Following Next.js/Vercel/Stripe industry standard
 *
 * Key principles from guide:
 * 1. Auth is a temporary interruption, not a destination
 * 2. Always preserve user intent through redirects
 * 3. Use sessionStorage for reload/tab safety
 * 4. Single unified helper for all gates (auth, payment, feature)
 */

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// ============================================================================
// Security: OWASP-compliant path validation
// ============================================================================

const ALLOWED_REDIRECT_PATHS = [
  '/billing',
  '/workspace',
  '/settings',
  '/dashboard',
  '/pricing',
  '/',
] as const

/**
 * Validate redirect path against OWASP best practices
 * Prevents open redirect vulnerabilities
 */
function isValidRedirectPath(path: string | null | undefined): boolean {
  if (!path) return false

  // Must be relative path
  if (!path.startsWith('/')) return false

  // Prevent protocol-relative URLs (//evil.com)
  if (path.startsWith('//')) return false

  // Prevent path traversal
  if (path.includes('..')) return false

  // Prevent external redirects
  if (path.startsWith('http://') || path.startsWith('https://')) return false

  // Allowlist check (OWASP recommended)
  return ALLOWED_REDIRECT_PATHS.some(allowed => path.startsWith(allowed))
}

/**
 * Sanitize and validate redirect path
 * Returns safe path or fallback to workspace
 */
function sanitizeRedirectPath(path: string | null | undefined, fallback = '/workspace'): string {
  if (!path || !isValidRedirectPath(path)) {
    if (path) {
      console.warn(`[Redirect] Invalid path blocked: ${path}. Using fallback: ${fallback}`)
    }
    return fallback
  }
  return path
}

// ============================================================================
// SessionStorage keys (per-tab, auto-clears)
// ============================================================================

const STORAGE_KEY = 'postAuthRedirect'

/**
 * Store redirect intent in sessionStorage
 * Survives page reloads, OAuth flows, tab switches
 */
function storeRedirectIntent(path: string): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(STORAGE_KEY, path)
  } catch (error) {
    console.warn('[Redirect] Failed to store intent:', error)
  }
}

/**
 * Retrieve and clear redirect intent from sessionStorage
 */
function getAndClearRedirectIntent(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const intent = sessionStorage.getItem(STORAGE_KEY)
    if (intent) {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    return intent
  } catch (error) {
    console.warn('[Redirect] Failed to retrieve intent:', error)
    return null
  }
}

// ============================================================================
// Unified Redirect Helper (Industry Standard)
// ============================================================================

/**
 * Redirect with intent preservation
 *
 * Used for:
 * - Auth gates (login/register)
 * - Payment gates (checkout)
 * - Feature gates (upgrade prompts)
 *
 * @param router - Next.js router instance
 * @param target - Gate page (e.g., '/auth/login', '/checkout')
 * @param next - Where to go after completing the gate
 *
 * @example
 * // User clicks "Start Pro Trial" while unauthenticated
 * redirectWithIntent(router, '/auth/login', '/pricing?plan=pro&type=trial')
 *
 * @example
 * // User needs to upgrade to access feature
 * redirectWithIntent(router, '/billing/upgrade', '/workspace/settings')
 */
export function redirectWithIntent(
  router: AppRouterInstance,
  target: string,
  next: string
): void {
  // Validate and sanitize the return path
  const safePath = sanitizeRedirectPath(next)

  // Store in sessionStorage for reload safety
  storeRedirectIntent(safePath)

  // Build URL with ?next param (industry standard)
  const url = `${target}?next=${encodeURIComponent(safePath)}`

  // Navigate to gate
  router.push(url)
}

/**
 * Get post-auth redirect destination
 *
 * Priority:
 * 1. URL ?next param (fresh navigation)
 * 2. sessionStorage (page reload / OAuth return)
 * 3. Fallback to default
 *
 * Use this in login/register pages after successful auth
 *
 * @param searchParams - URLSearchParams from current page
 * @param fallback - Default destination if no intent found
 * @returns Safe, validated redirect path
 *
 * @example
 * // In login page after successful auth
 * const destination = getPostAuthRedirect(searchParams)
 * router.replace(destination) // Use replace, not push!
 */
export function getPostAuthRedirect(
  searchParams: URLSearchParams,
  fallback = '/workspace'
): string {
  // Try URL param first
  const urlNext = searchParams.get('next')
  if (urlNext && isValidRedirectPath(urlNext)) {
    // Clear sessionStorage if we have valid URL param
    getAndClearRedirectIntent()
    return urlNext
  }

  // Fallback to sessionStorage (for reloads / OAuth)
  const storedNext = getAndClearRedirectIntent()
  if (storedNext && isValidRedirectPath(storedNext)) {
    return storedNext
  }

  // Safe default
  return sanitizeRedirectPath(fallback, fallback)
}

// ============================================================================
// Convenience Wrappers (Common Use Cases)
// ============================================================================

/**
 * Redirect to login with preserved intent
 *
 * @example
 * if (!isAuthenticated) {
 *   redirectToLogin(router, '/pricing?plan=pro')
 * }
 */
export function redirectToLogin(
  router: AppRouterInstance,
  next: string
): void {
  redirectWithIntent(router, '/auth/login', next)
}

/**
 * Redirect to register with preserved intent
 *
 * @example
 * if (!isAuthenticated) {
 *   redirectToRegister(router, '/billing/plans?plan=beginning&type=trial')
 * }
 */
export function redirectToRegister(
  router: AppRouterInstance,
  next: string
): void {
  redirectWithIntent(router, '/auth/register', next)
}

/**
 * Redirect to checkout with preserved return path
 *
 * @example
 * redirectToCheckout(router, '/workspace/settings', { plan: 'pro' })
 */
export function redirectToCheckout(
  router: AppRouterInstance,
  returnTo: string,
  checkoutParams?: Record<string, string>
): void {
  const params = new URLSearchParams(checkoutParams)
  const checkoutUrl = `/checkout${params.toString() ? `?${params.toString()}` : ''}`

  redirectWithIntent(router, checkoutUrl, returnTo)
}

// ============================================================================
// Smart Redirect (Context-Aware)
// ============================================================================

/**
 * Intelligently redirect based on authentication state
 * This is what components should use most of the time
 *
 * @param router - Next.js router
 * @param isAuthenticated - Current auth state
 * @param intendedDestination - Where user is trying to go
 * @param action - What happens if authenticated ('proceed' or custom callback)
 *
 * @example
 * // Pricing page "Start Trial" button
 * <button onClick={() =>
 *   smartRedirect(router, isAuthenticated, '/billing/plans?plan=pro&type=trial', () => {
 *     // User is authenticated, proceed directly
 *     router.push('/billing/plans?plan=pro&type=trial')
 *   })
 * }>
 */
export function smartRedirect(
  router: AppRouterInstance,
  isAuthenticated: boolean,
  intendedDestination: string,
  action?: 'proceed' | (() => void)
): void {
  if (!isAuthenticated) {
    // Gate: send to login with intent
    redirectToLogin(router, intendedDestination)
  } else {
    // Authenticated: execute action or proceed
    if (action === 'proceed') {
      router.push(intendedDestination)
    } else if (typeof action === 'function') {
      action()
    } else {
      router.push(intendedDestination)
    }
  }
}

// ============================================================================
// Helper: Build current path with query params
// ============================================================================

/**
 * Build current path with query params for redirect
 * Useful when you want to redirect back to current page with specific params
 *
 * @example
 * const currentPathWithParams = buildPathWithParams('/pricing', { plan: 'pro', promo: 'true' })
 * redirectToLogin(router, currentPathWithParams)
 */
export function buildPathWithParams(
  basePath: string,
  params?: Record<string, string>
): string {
  if (!params || Object.keys(params).length === 0) {
    return basePath
  }

  const searchParams = new URLSearchParams(params)
  return `${basePath}?${searchParams.toString()}`
}

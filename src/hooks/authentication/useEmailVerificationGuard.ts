/**
 * useEmailVerificationGuard
 *
 * Listens for the global 'email-not-verified' event dispatched by:
 *   - Apollo errorLink  (GraphQL — extensions.code === 'EMAIL_NOT_VERIFIED')
 *   - ErrorHandler.ts   (REST    — response { code: 'EMAIL_NOT_VERIFIED' })
 *
 * Uses window.location.href (hard redirect) instead of router.replace() so the
 * redirect is instant — no React render cycle, no async queuing.
 */

'use client'

import { useEffect } from 'react'

const EMAIL_NOT_VERIFIED_EVENT = 'email-not-verified'
const VERIFY_PATH = '/auth/verify'

export function useEmailVerificationGuard(): void {
  useEffect(() => {
    function handleVerificationRequired() {
      // Skip redirect if already on the verify page (avoid loop)
      if (typeof window !== 'undefined' && window.location.pathname === VERIFY_PATH) {
        return
      }
      console.warn('[Guard] Email not verified — hard redirecting to', VERIFY_PATH)
      window.location.href = VERIFY_PATH
    }

    window.addEventListener(EMAIL_NOT_VERIFIED_EVENT, handleVerificationRequired)

    return () => {
      window.removeEventListener(EMAIL_NOT_VERIFIED_EVENT, handleVerificationRequired)
    }
  }, [])
}


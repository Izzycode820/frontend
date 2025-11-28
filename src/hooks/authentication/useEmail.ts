/**
 * Email Hook - 2024 Best Practices with Zustand
 * Custom hook layer for email store - handles verification and email management
 * Following patterns: single responsibility, selective subscriptions, error boundaries
 */

import { useCallback } from 'react'
import { useEmailStore, emailSelectors } from '../../stores/authentication/emailStore'
import emailService from '../../services/authentication/email'
import type {
  EmailVerificationRequest,
  EmailVerificationResponse,
  EmailVerificationConfirmRequest,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirmRequest,
  EmailChangeRequest,
  EmailChangeResponse,
  EmailChangeConfirmRequest,
  EmailVerificationStatus
} from '../../types/authentication/email'

// ============================================================================
// Hook Return Interface - Clean Contract
// ============================================================================

export interface UseEmailReturn {
  // State selectors (performance optimized)
  verificationStatus: ReturnType<typeof emailSelectors.verificationStatus>
  verificationInProgress: boolean
  isLoading: boolean
  error: string | null

  // Computed state
  canRequestVerification: boolean
  verificationAttemptsCount: number
  lastVerificationRequest: number | null
  isEmailVerified: boolean

  // Actions (stable references)
  requestVerificationCode: (data: EmailVerificationRequest) => Promise<EmailVerificationResponse>
  verifyCode: (data: EmailVerificationConfirmRequest) => Promise<EmailVerificationResponse>
  requestPasswordReset: (data: PasswordResetRequest) => Promise<PasswordResetResponse>
  confirmPasswordReset: (data: PasswordResetConfirmRequest) => Promise<PasswordResetResponse>
  requestEmailChange: (data: EmailChangeRequest) => Promise<EmailChangeResponse>
  confirmEmailChange: (data: EmailChangeConfirmRequest) => Promise<EmailChangeResponse>
  clearError: () => void
  getVerificationStatus: () => Promise<EmailVerificationStatus>
}

// ============================================================================
// Main Email Hook
// ============================================================================

export function useEmail(): UseEmailReturn {
  // Selective store subscriptions (performance optimized)
  const verificationStatus = useEmailStore(emailSelectors.verificationStatus)
  const verificationInProgress = useEmailStore(emailSelectors.verificationInProgress)
  const isLoading = useEmailStore(emailSelectors.isLoading)
  const error = useEmailStore(emailSelectors.error)
  const canRequestVerification = useEmailStore(emailSelectors.canRequestVerification)
  const verificationAttemptsCount = useEmailStore(emailSelectors.verificationAttemptsCount)
  const lastVerificationRequest = useEmailStore(state => state.lastVerificationRequest || null)
  const isEmailVerified = useEmailStore(emailSelectors.isEmailVerified)

  // Store actions (direct references for performance)
  const setVerificationStatus = useEmailStore(state => state.setVerificationStatus)
  const setVerificationInProgress = useEmailStore(state => state.setVerificationInProgress)
  const setVerificationCode = useEmailStore(state => state.setVerificationCode)
  const setVerificationError = useEmailStore(state => state.setVerificationError)
  const setPasswordResetInProgress = useEmailStore(state => state.setPasswordResetInProgress)
  const setEmailChangeInProgress = useEmailStore(state => state.setEmailChangeInProgress)
  const setLoading = useEmailStore(state => state.setLoading)
  const setError = useEmailStore(state => state.setError)
  const clearError = useEmailStore(state => state.clearError)

  // ============================================================================
  // Stable Action Implementations
  // ============================================================================

  const requestVerificationCode = useCallback(async (data: EmailVerificationRequest): Promise<EmailVerificationResponse> => {
    try {
      setVerificationInProgress(true)
      setError(null)

      const response = await emailService.requestVerificationCode(data)

      if (response.success) {
        return response
      }

      throw new Error(response.error || 'Email verification request failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification request failed'
      setError(errorMessage)
      throw error
    } finally {
      setVerificationInProgress(false)
    }
  }, [setVerificationInProgress, setError])

  const verifyCode = useCallback(async (data: EmailVerificationConfirmRequest): Promise<EmailVerificationResponse> => {
    try {
      setVerificationInProgress(true)
      setError(null)

      const response = await emailService.verifyCode(data)

      if (response.success) {
        setVerificationCode('')
        return response
      }

      throw new Error(response.error || 'Code verification failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Code verification failed'
      setError(errorMessage)
      throw error
    } finally {
      setVerificationInProgress(false)
    }
  }, [setVerificationInProgress, setError, setVerificationCode])

  const requestPasswordReset = useCallback(async (data: PasswordResetRequest): Promise<PasswordResetResponse> => {
    try {
      setPasswordResetInProgress(true)
      setError(null)

      const response = await emailService.requestPasswordReset(data)

      if (response.success) {
        return response
      }

      throw new Error(response.error || 'Password reset request failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed'
      setError(errorMessage)
      throw error
    } finally {
      setPasswordResetInProgress(false)
    }
  }, [setPasswordResetInProgress, setError])

  const confirmPasswordReset = useCallback(async (data: PasswordResetConfirmRequest): Promise<PasswordResetResponse> => {
    try {
      setPasswordResetInProgress(true)
      setError(null)

      const response = await emailService.confirmPasswordReset(data)

      if (response.success) {
        return response
      }

      throw new Error(response.error || 'Password reset confirmation failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset confirmation failed'
      setError(errorMessage)
      throw error
    } finally {
      setPasswordResetInProgress(false)
    }
  }, [setPasswordResetInProgress, setError])

  const requestEmailChange = useCallback(async (data: EmailChangeRequest): Promise<EmailChangeResponse> => {
    try {
      setEmailChangeInProgress(true)
      setError(null)

      const response = await emailService.requestEmailChange(data)

      if (response.success) {
        return response
      }

      throw new Error(response.error || 'Email change request failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email change request failed'
      setError(errorMessage)
      throw error
    } finally {
      setEmailChangeInProgress(false)
    }
  }, [setEmailChangeInProgress, setError])

  const confirmEmailChange = useCallback(async (data: EmailChangeConfirmRequest): Promise<EmailChangeResponse> => {
    try {
      setEmailChangeInProgress(true)
      setError(null)

      const response = await emailService.confirmEmailChange(data)

      if (response.success) {
        return response
      }

      throw new Error(response.error || 'Email change confirmation failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email change confirmation failed'
      setError(errorMessage)
      throw error
    } finally {
      setEmailChangeInProgress(false)
    }
  }, [setEmailChangeInProgress, setError])

  const getVerificationStatus = useCallback(async (): Promise<EmailVerificationStatus> => {
    try {
      setLoading(true)
      setError(null)

      const response = await emailService.getVerificationStatus()

      setVerificationStatus(response)
      return response

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get verification status'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setVerificationStatus])

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State (reactive)
    verificationStatus,
    verificationInProgress,
    isLoading,
    error,

    // Computed state
    canRequestVerification,
    verificationAttemptsCount,
    lastVerificationRequest: lastVerificationRequest as number | null,
    isEmailVerified,

    // Actions (stable)
    requestVerificationCode,
    verifyCode,
    requestPasswordReset,
    confirmPasswordReset,
    requestEmailChange,
    confirmEmailChange,
    clearError,
    getVerificationStatus
  }
}

// ============================================================================
// Granular Hooks (Performance Optimization)
// ============================================================================

/**
 * Hook for verification status only - minimal re-renders
 */
export function useEmailVerificationStatus() {
  return {
    verificationStatus: useEmailStore(emailSelectors.verificationStatus),
    isEmailVerified: useEmailStore(emailSelectors.isEmailVerified),
    verificationInProgress: useEmailStore(emailSelectors.verificationInProgress)
  }
}

/**
 * Hook for verification actions only - minimal re-renders
 */
export function useEmailVerification() {
  return {
    verificationInProgress: useEmailStore(emailSelectors.verificationInProgress),
    verificationAttemptsCount: useEmailStore(emailSelectors.verificationAttemptsCount),
    canRequestVerification: useEmailStore(emailSelectors.canRequestVerification)
  }
}

/**
 * Hook for password reset functionality only - minimal re-renders
 */
export function usePasswordReset() {
  return {
    passwordResetInProgress: useEmailStore(emailSelectors.passwordResetInProgress),
    passwordResetSuccess: useEmailStore(emailSelectors.passwordResetSuccess)
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default useEmail
/**
 * Email Store - Zustand 2024 Best Practices
 * Manages email verification, password reset, and email change flows
 * Works directly with EmailService and comprehensive types
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  EmailVerificationRequest,
  EmailVerificationResponse,
  EmailVerificationConfirmRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  PasswordResetResponse,
  EmailChangeRequest,
  EmailChangeConfirmRequest,
  EmailChangeResponse,
  EmailVerificationStatus,
  EmailCodeType
} from '../../types/authentication/email'

// ============================================================================
// Email Store State Interface
// ============================================================================

interface EmailStoreState {
  // Email Verification Flow
  verificationStatus: EmailVerificationStatus | null
  verificationInProgress: boolean
  verificationCode: string
  verificationError: string | null
  lastVerificationRequest: number | null

  // Password Reset Flow
  passwordResetInProgress: boolean
  passwordResetToken: string | null
  passwordResetError: string | null
  passwordResetSuccess: boolean
  lastPasswordResetRequest: number | null

  // Email Change Flow
  emailChangeInProgress: boolean
  pendingEmailChange: string | null
  emailChangeError: string | null
  emailChangeSuccess: boolean
  lastEmailChangeRequest: number | null

  // UI State
  isLoading: boolean
  error: string | null
  currentCodeType: EmailCodeType | null

  // Actions
  setVerificationStatus: (status: EmailVerificationStatus | null) => void
  setVerificationCode: (code: string) => void
  setVerificationInProgress: (inProgress: boolean) => void
  setVerificationError: (error: string | null) => void
  setPasswordResetInProgress: (inProgress: boolean) => void
  setPasswordResetToken: (token: string | null) => void
  setPasswordResetError: (error: string | null) => void
  setPasswordResetSuccess: (success: boolean) => void
  setEmailChangeInProgress: (inProgress: boolean) => void
  setPendingEmailChange: (email: string | null) => void
  setEmailChangeError: (error: string | null) => void
  setEmailChangeSuccess: (success: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentCodeType: (codeType: EmailCodeType | null) => void
  clearError: () => void
  markVerificationRequested: () => void
  markPasswordResetRequested: () => void
  markEmailChangeRequested: () => void
  resetVerificationFlow: () => void
  resetPasswordResetFlow: () => void
  resetEmailChangeFlow: () => void

  // Helper Methods
  canRequestVerification: () => boolean
  canRequestPasswordReset: () => boolean
  canRequestEmailChange: () => boolean
  getTimeUntilNextVerification: () => number | null
  getTimeUntilNextPasswordReset: () => number | null
  getTimeUntilNextEmailChange: () => number | null
  isVerificationCodeValid: () => boolean
  isEmailVerified: () => boolean
}

// ============================================================================
// Create Email Store
// ============================================================================

export const useEmailStore = create<EmailStoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // ========================================================================
      // Initial State
      // ========================================================================
      verificationStatus: null,
      verificationInProgress: false,
      verificationCode: '',
      verificationError: null,
      lastVerificationRequest: null,
      passwordResetInProgress: false,
      passwordResetToken: null,
      passwordResetError: null,
      passwordResetSuccess: false,
      lastPasswordResetRequest: null,
      emailChangeInProgress: false,
      pendingEmailChange: null,
      emailChangeError: null,
      emailChangeSuccess: false,
      lastEmailChangeRequest: null,
      isLoading: false,
      error: null,
      currentCodeType: null,

      // ========================================================================
      // Email Verification Actions
      // ========================================================================

      setVerificationStatus: (status) => {
        set((state) => {
          state.verificationStatus = status
        })
      },

      setVerificationCode: (code) => {
        set((state) => {
          state.verificationCode = code.replace(/\D/g, '').substring(0, 8)
          state.verificationError = null
        })
      },

      setVerificationInProgress: (inProgress) => {
        set((state) => {
          state.verificationInProgress = inProgress
          if (inProgress) {
            state.verificationError = null
          }
        })
      },

      setVerificationError: (error) => {
        set((state) => {
          state.verificationError = error
          if (error) {
            state.verificationInProgress = false
          }
        })
      },

      markVerificationRequested: () => {
        set((state) => {
          state.lastVerificationRequest = Date.now()
          state.verificationCode = ''
          state.verificationError = null
        })
      },

      resetVerificationFlow: () => {
        set((state) => {
          state.verificationInProgress = false
          state.verificationCode = ''
          state.verificationError = null
          state.currentCodeType = null
        })
      },

      // ========================================================================
      // Password Reset Actions
      // ========================================================================

      setPasswordResetInProgress: (inProgress) => {
        set((state) => {
          state.passwordResetInProgress = inProgress
          if (inProgress) {
            state.passwordResetError = null
            state.passwordResetSuccess = false
          }
        })
      },

      setPasswordResetToken: (token) => {
        set((state) => {
          state.passwordResetToken = token
        })
      },

      setPasswordResetError: (error) => {
        set((state) => {
          state.passwordResetError = error
          if (error) {
            state.passwordResetInProgress = false
          }
        })
      },

      setPasswordResetSuccess: (success) => {
        set((state) => {
          state.passwordResetSuccess = success
          if (success) {
            state.passwordResetInProgress = false
            state.passwordResetError = null
            state.passwordResetToken = null
          }
        })
      },

      markPasswordResetRequested: () => {
        set((state) => {
          state.lastPasswordResetRequest = Date.now()
          state.passwordResetError = null
          state.passwordResetSuccess = false
        })
      },

      resetPasswordResetFlow: () => {
        set((state) => {
          state.passwordResetInProgress = false
          state.passwordResetToken = null
          state.passwordResetError = null
          state.passwordResetSuccess = false
        })
      },

      // ========================================================================
      // Email Change Actions
      // ========================================================================

      setEmailChangeInProgress: (inProgress) => {
        set((state) => {
          state.emailChangeInProgress = inProgress
          if (inProgress) {
            state.emailChangeError = null
            state.emailChangeSuccess = false
          }
        })
      },

      setPendingEmailChange: (email) => {
        set((state) => {
          state.pendingEmailChange = email
        })
      },

      setEmailChangeError: (error) => {
        set((state) => {
          state.emailChangeError = error
          if (error) {
            state.emailChangeInProgress = false
          }
        })
      },

      setEmailChangeSuccess: (success) => {
        set((state) => {
          state.emailChangeSuccess = success
          if (success) {
            state.emailChangeInProgress = false
            state.emailChangeError = null
            state.pendingEmailChange = null
          }
        })
      },

      markEmailChangeRequested: () => {
        set((state) => {
          state.lastEmailChangeRequest = Date.now()
          state.emailChangeError = null
          state.emailChangeSuccess = false
        })
      },

      resetEmailChangeFlow: () => {
        set((state) => {
          state.emailChangeInProgress = false
          state.pendingEmailChange = null
          state.emailChangeError = null
          state.emailChangeSuccess = false
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
            state.verificationInProgress = false
            state.passwordResetInProgress = false
            state.emailChangeInProgress = false
          }
        })
      },

      setCurrentCodeType: (codeType) => {
        set((state) => {
          state.currentCodeType = codeType
        })
      },

      clearError: () => {
        set((state) => {
          state.error = null
          state.verificationError = null
          state.passwordResetError = null
          state.emailChangeError = null
        })
      },

      // ========================================================================
      // Helper Methods
      // ========================================================================

      canRequestVerification: () => {
        const { lastVerificationRequest } = get()
        if (!lastVerificationRequest) return true

        // Rate limit: 1 request per 60 seconds
        const timeElapsed = Date.now() - lastVerificationRequest
        return timeElapsed >= 60000
      },

      canRequestPasswordReset: () => {
        const { lastPasswordResetRequest } = get()
        if (!lastPasswordResetRequest) return true

        // Rate limit: 1 request per 5 minutes
        const timeElapsed = Date.now() - lastPasswordResetRequest
        return timeElapsed >= 300000
      },

      canRequestEmailChange: () => {
        const { lastEmailChangeRequest } = get()
        if (!lastEmailChangeRequest) return true

        // Rate limit: 1 request per 10 minutes
        const timeElapsed = Date.now() - lastEmailChangeRequest
        return timeElapsed >= 600000
      },

      getTimeUntilNextVerification: () => {
        const { lastVerificationRequest } = get()
        if (!lastVerificationRequest) return null

        const timeElapsed = Date.now() - lastVerificationRequest
        const timeRemaining = 60000 - timeElapsed
        return timeRemaining > 0 ? timeRemaining : null
      },

      getTimeUntilNextPasswordReset: () => {
        const { lastPasswordResetRequest } = get()
        if (!lastPasswordResetRequest) return null

        const timeElapsed = Date.now() - lastPasswordResetRequest
        const timeRemaining = 300000 - timeElapsed
        return timeRemaining > 0 ? timeRemaining : null
      },

      getTimeUntilNextEmailChange: () => {
        const { lastEmailChangeRequest } = get()
        if (!lastEmailChangeRequest) return null

        const timeElapsed = Date.now() - lastEmailChangeRequest
        const timeRemaining = 600000 - timeElapsed
        return timeRemaining > 0 ? timeRemaining : null
      },

      isVerificationCodeValid: () => {
        const { verificationCode } = get()
        return verificationCode.length >= 4 && verificationCode.length <= 8
      },

      isEmailVerified: () => {
        const { verificationStatus } = get()
        return verificationStatus?.is_email_verified === true
      }
    }))
  )
)

// ============================================================================
// Selectors for Performance
// ============================================================================

export const emailSelectors = {
  // Core selectors
  verificationStatus: (state: EmailStoreState) => state.verificationStatus,
  verificationInProgress: (state: EmailStoreState) => state.verificationInProgress,
  verificationCode: (state: EmailStoreState) => state.verificationCode,
  verificationError: (state: EmailStoreState) => state.verificationError,
  passwordResetInProgress: (state: EmailStoreState) => state.passwordResetInProgress,
  passwordResetError: (state: EmailStoreState) => state.passwordResetError,
  passwordResetSuccess: (state: EmailStoreState) => state.passwordResetSuccess,
  emailChangeInProgress: (state: EmailStoreState) => state.emailChangeInProgress,
  emailChangeError: (state: EmailStoreState) => state.emailChangeError,
  emailChangeSuccess: (state: EmailStoreState) => state.emailChangeSuccess,
  pendingEmailChange: (state: EmailStoreState) => state.pendingEmailChange,
  isLoading: (state: EmailStoreState) => state.isLoading,
  error: (state: EmailStoreState) => state.error,
  currentCodeType: (state: EmailStoreState) => state.currentCodeType,

  // Computed selectors
  isEmailVerified: (state: EmailStoreState) => state.verificationStatus?.is_email_verified === true,
  hasVerificationCode: (state: EmailStoreState) => state.verificationCode.length > 0,
  isVerificationCodeValid: (state: EmailStoreState) =>
    state.verificationCode.length >= 4 && state.verificationCode.length <= 8,
  hasAnyError: (state: EmailStoreState) =>
    !!(state.error || state.verificationError || state.passwordResetError || state.emailChangeError),
  hasAnyInProgress: (state: EmailStoreState) =>
    state.verificationInProgress || state.passwordResetInProgress || state.emailChangeInProgress || state.isLoading,

  // Rate limiting selectors
  canRequestVerification: (state: EmailStoreState) => {
    if (!state.lastVerificationRequest) return true
    const timeElapsed = Date.now() - state.lastVerificationRequest
    return timeElapsed >= 60000
  },
  canRequestPasswordReset: (state: EmailStoreState) => {
    if (!state.lastPasswordResetRequest) return true
    const timeElapsed = Date.now() - state.lastPasswordResetRequest
    return timeElapsed >= 300000
  },
  canRequestEmailChange: (state: EmailStoreState) => {
    if (!state.lastEmailChangeRequest) return true
    const timeElapsed = Date.now() - state.lastEmailChangeRequest
    return timeElapsed >= 600000
  },

  // Status selectors
  verificationStatusText: (state: EmailStoreState) => {
    if (!state.verificationStatus) return 'Unknown'
    if (state.verificationStatus.is_email_verified) return 'Verified'
    if (state.verificationStatus.recent_verifications?.some(v => v.status === 'pending')) return 'Pending'
    return 'Not Verified'
  },
  lastVerificationAttempt: (state: EmailStoreState) =>
    state.verificationStatus?.recent_verifications?.[0]?.created_at,
  verificationAttemptsCount: (state: EmailStoreState) =>
    state.verificationStatus?.recent_verifications?.length || 0
}

// ============================================================================
// Default Export
// ============================================================================

export default useEmailStore
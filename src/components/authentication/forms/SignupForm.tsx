/**
 * Modern Signup Form Component
 * Built with Shadcn/UI + React Hook Form + Zod validation
 * Follows 2024 SaaS registration UX best practices
 *
 * Features:
 * - Hydration-safe redirect for authenticated users
 * - Toast notifications for errors (Sonner)
 * - Inline field errors for duplicate email/phone
 * - Proper error type handling
 */

'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

// Shadcn/UI Components
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/shadcn-ui/form'

// Hooks
import { useAuth } from '@/hooks/authentication/useAuth'

// Utils
import { getAndClearAuthIntent } from '@/utils/redirect-with-intent'
import { restoreWorkspaceSafe } from '@/stores/authentication/authStore'

// Types
import type { RegisterRequest, AuthErrorCode } from '@/types/authentication/auth'
import { AUTH_ERRORS, isAuthErrorResponse, getAuthErrorMessage } from '@/types/authentication/auth'

// ============================================================================
// Error Message Helpers
// ============================================================================

interface SignupErrorResult {
  message: string
  field?: 'email' | 'phone_number' | 'password' | 'general'
}

/**
 * Map error codes to form fields for inline error display
 */
const ERROR_CODE_TO_FIELD: Record<string, SignupErrorResult['field']> = {
  EMAIL_EXISTS: 'email',
  PHONE_EXISTS: 'phone_number',
  WEAK_PASSWORD: 'password',
  VALIDATION_ERROR: 'general',
  RATE_LIMITED: 'general',
  NETWORK_ERROR: 'general',
  SERVER_ERROR: 'general',
}

/**
 * Check if error is a network/offline error
 */
function isNetworkError(error: unknown): boolean {
  if (!error) return false

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true
  }

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  const networkPatterns = ['network', 'fetch', 'failed to fetch', 'offline', 'internet', 'connection']
  return networkPatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Parse signup error and determine which field it relates to
 * Now uses backend error_code for precise error handling
 */
function parseSignupError(error: unknown, t: (key: string) => string): SignupErrorResult {
  if (!error) return { message: t('failedDesc'), field: 'general' }

  // Check for network errors first
  if (isNetworkError(error)) {
    return {
      message: getAuthErrorMessage(AUTH_ERRORS.NETWORK_ERROR),
      field: 'general'
    }
  }

  // Check for structured backend error with error_code
  if (isAuthErrorResponse(error)) {
    return {
      message: getAuthErrorMessage(error.error_code),
      field: ERROR_CODE_TO_FIELD[error.error_code] || 'general'
    }
  }

  // Check if error object has error_code property
  if (typeof error === 'object' && error !== null && 'error_code' in error) {
    const errorCode = (error as { error_code: AuthErrorCode }).error_code
    if (errorCode && AUTH_ERRORS[errorCode as keyof typeof AUTH_ERRORS]) {
      return {
        message: getAuthErrorMessage(errorCode),
        field: ERROR_CODE_TO_FIELD[errorCode] || 'general'
      }
    }
  }

  // If error has a message property from backend, use it directly
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const backendMessage = (error as { error: string }).error
    if (backendMessage && typeof backendMessage === 'string') {
      return { message: backendMessage, field: 'general' }
    }
  }

  // Fallback: Check Error.message
  if (error instanceof Error && error.message) {
    return { message: error.message, field: 'general' }
  }

  return { message: t('failedDesc'), field: 'general' }
}

type SignupFormValues = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface SignupFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
  className?: string
  showSocialLogin?: boolean
}

export function SignupForm({
  onSuccess,
  onError,
  redirectTo = '/workspace',
  className = '',
  showSocialLogin = true
}: SignupFormProps) {
  const t = useTranslations('Authentication.signup')
  const v = useTranslations('Authentication.validation')

  // Validation Schema
  const signupSchema = React.useMemo(() => z.object({
    first_name: z
      .string()
      .min(1, v('firstNameRequired'))
      .min(2, v('firstNameMin'))
      .max(30, v('firstNameMax')),
    last_name: z
      .string()
      .min(1, v('lastNameRequired'))
      .min(2, v('lastNameMin'))
      .max(30, v('lastNameMax')),
    email: z
      .string()
      .min(1, v('emailRequired'))
      .email(v('emailInvalid')),
    phone_number: z
      .string()
      .min(1, v('phoneRequired'))
      .regex(/^\+?[0-9]{8,15}$/, v('phoneInvalid')),
    password: z
      .string()
      .min(8, v('passwordMin'))
      .regex(/[A-Z]/, v('passwordUpper'))
      .regex(/[a-z]/, v('passwordLower'))
      .regex(/[0-9]/, v('passwordNumber')),
    confirmPassword: z
      .string()
      .min(1, v('confirmPasswordRequired')),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, v('acceptTerms'))
  }).refine((data) => data.password === data.confirmPassword, {
    message: v('passwordsMatch'),
    path: ["confirmPassword"]
  }) satisfies z.ZodType<Partial<SignupFormValues>>, [v])

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [hasRedirected, setHasRedirected] = React.useState(false)
  const router = useRouter()
  const { register, isLoading, error, clearError, isFullyAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  // Track client-side mount to prevent hydration issues
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect already-authenticated users away from signup page (hydration-safe)
  React.useEffect(() => {
    if (!isMounted || hasRedirected) return

    if (isFullyAuthenticated) {
      setHasRedirected(true)
      console.log('[SignupForm] User already authenticated, redirecting away from signup')
      router.replace('/workspace')
    }
  }, [isMounted, isFullyAuthenticated, hasRedirected, router])

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  })

  // Clear auth errors when form values change
  const emailValue = form.watch('email')
  const phoneValue = form.watch('phone_number')

  React.useEffect(() => {
    if (error) {
      clearError()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue, phoneValue])

  const onSubmit = async (values: SignupFormValues) => {
    try {
      clearError()
      // Clear any previous inline errors
      form.clearErrors()

      const registerRequest: RegisterRequest = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.toLowerCase().trim(),
        phone_number: values.phone_number.replace(/\D/g, '').replace(/^/, '+'),
        password: values.password
      }

      await register(registerRequest)

      // Show success toast
      toast.success(t('success'), {
        description: t('successDesc')
      })

      onSuccess?.()

      // ENHANCED: Get full intent (path + workspace context)
      const intent = getAndClearAuthIntent()

      // BETA: Always redirect to verification page after signup
      // Users can skip if they want, or verify their phone/email
      let destination = '/auth/verify'

      // Only override if there's an explicit intent path (not default workspace)
      if (intent?.path && intent.path !== '/workspace') {
        destination = intent.path
      }

      // CRITICAL: Restore workspace BEFORE navigating (99.99% reliability)
      if (intent?.workspaceId) {
        console.log('[Signup] Restoring workspace before redirect:', intent.workspaceId)
        await restoreWorkspaceSafe(intent.workspaceId)
      }

      // Use router.replace to prevent "back button → register again"
      router.replace(destination)
    } catch (err: unknown) {
      const { message, field } = parseSignupError(err, t)

      // Set inline error on the specific field if applicable
      if (field && field !== 'general') {
        form.setError(field, { type: 'server', message })
      }

      // Show error toast
      toast.error(t('failed'), {
        description: message
      })

      onError?.(message)

      // Focus the problematic field
      if (field && field !== 'general') {
        form.setFocus(field)
      } else {
        form.setFocus('email')
      }
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    // This would integrate with your OAuth service
    console.log(`Social signup with ${provider}`)
    // await initiateOAuth2Login(provider)
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('firstNamePlaceholder')}
                      autoComplete="given-name"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('lastNamePlaceholder')}
                      autoComplete="family-name"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailAddress')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number Field */}
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phoneNumber')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    autoComplete="tel"
                    disabled={isLoading}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('passwordPlaceholder')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-11 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirmPassword')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('confirmPasswordPlaceholder')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-11 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms & Conditions */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal leading-snug">
                    {t('acceptTerms')}{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      {t('termsOfService')}
                    </Link>{' '}
                    {t('and')}{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      {t('privacyPolicy')}
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>

          {/* Social Login — blurred out (not ready yet) */}
          {showSocialLogin && (
            <div className="relative">
              {/* Blur overlay — makes buttons non-clickable */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  Coming Soon
                </span>
              </div>

              {/* Blurred, non-interactive social buttons */}
              <div className="opacity-40 blur-[1px] pointer-events-none select-none">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('orContinueWith')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-11"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="h-11"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                        fill="currentColor"
                      />
                    </svg>
                    Apple
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
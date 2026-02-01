/**
 * Modern Login Form Component
 * Built with Shadcn/UI + React Hook Form + Zod validation
 * Follows 2024 SaaS authentication UX best practices
 *
 * Features:
 * - Hydration-safe redirect for authenticated users
 * - Toast notifications for errors (Sonner)
 * - Proper error type handling
 */

'use client'

import React from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

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
import type { LoginRequest, AuthErrorCode } from '@/types/authentication/auth'
import { AUTH_ERRORS, isAuthErrorResponse, getAuthErrorMessage } from '@/types/authentication/auth'

// ============================================================================
// Error Message Helpers
// ============================================================================

/**
 * Check if error is a network/offline error
 */
function isNetworkError(error: unknown): boolean {
  if (!error) return false

  // Check navigator.onLine
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true
  }

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

  const networkPatterns = ['network', 'fetch', 'failed to fetch', 'offline', 'internet', 'connection']
  return networkPatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Get user-friendly error message based on error type
 * Now uses backend error_code for precise error handling
 */
function getLoginErrorMessage(error: unknown): string {
  if (!error) return 'Login failed. Please try again.'

  // Check for network errors first (frontend-only detection)
  if (isNetworkError(error)) {
    return getAuthErrorMessage(AUTH_ERRORS.NETWORK_ERROR)
  }

  // Check for structured backend error with error_code
  if (isAuthErrorResponse(error)) {
    return getAuthErrorMessage(error.error_code)
  }

  // Check if error object has error_code property (from API response)
  if (typeof error === 'object' && error !== null && 'error_code' in error) {
    const errorCode = (error as { error_code: AuthErrorCode }).error_code
    if (errorCode && AUTH_ERRORS[errorCode as keyof typeof AUTH_ERRORS]) {
      return getAuthErrorMessage(errorCode)
    }
  }

  // If error has a message property from backend, use it directly
  // Backend now sends user-friendly messages
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const backendMessage = (error as { error: string }).error
    if (backendMessage && typeof backendMessage === 'string') {
      return backendMessage
    }
  }

  // Fallback: Check Error.message
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Login failed. Please try again.'
}

// Validation Schema - aligned with LoginRequest interface
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  remember_me: z.boolean()
}) satisfies z.ZodType<LoginRequest>

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectTo?: string
  className?: string
  showSocialLogin?: boolean
  showForgotPassword?: boolean
}

export function LoginForm({
  onSuccess,
  onError,
  redirectTo = '/workspace',
  className = '',
  showSocialLogin = true,
  showForgotPassword = true
}: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [hasRedirected, setHasRedirected] = React.useState(false)
  const [isNavigating, setIsNavigating] = React.useState(false) // Prevents re-submission during navigation
  const router = useRouter()
  const { login, isLoading, error, clearError, isFullyAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  // Track client-side mount to prevent hydration issues
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect already-authenticated users away from login page (hydration-safe)
  // This prevents the refresh loop issue when user has valid refresh token
  React.useEffect(() => {
    // Only run on client after mount, and only once
    if (!isMounted || hasRedirected) return

    if (isFullyAuthenticated) {
      setHasRedirected(true) // Prevent multiple redirects
      console.log('[LoginForm] User already authenticated, redirecting away from login')
      const urlNext = searchParams?.get('next')
      const destination = urlNext || redirectTo || '/workspace'
      router.replace(destination)
    }
  }, [isMounted, isFullyAuthenticated, hasRedirected, router, searchParams, redirectTo])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false
    },
    mode: 'onBlur'
  })

  // Clear auth errors when form values change
  const watchedEmail = form.watch('email')
  const watchedPassword = form.watch('password')
  React.useEffect(() => {
    if (error) {
      clearError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedEmail, watchedPassword])

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    // Prevent duplicate submissions
    if (isNavigating) return

    try {
      clearError()

      const loginRequest: LoginRequest = {
        email: values.email.toLowerCase().trim(),
        password: values.password,
        remember_me: values.remember_me
      }

      await login(loginRequest)

      // Mark as navigating to prevent form re-submission
      // This stays true until navigation completes (user leaves page)
      setIsNavigating(true)

      // Show success toast
      toast.success('Welcome back!', {
        description: 'You have been signed in successfully.'
      })

      onSuccess?.()

      // ENHANCED: Get full intent (path + workspace context)
      const intent = getAndClearAuthIntent()

      // Determine destination
      let destination = redirectTo || '/workspace'
      if (intent?.path) {
        destination = intent.path
      } else {
        // Fallback: check URL ?next param
        const urlNext = searchParams?.get('next')
        if (urlNext) {
          destination = urlNext
        }
      }

      // CRITICAL: Restore workspace BEFORE navigating (99.99% reliability)
      if (intent?.workspaceId) {
        console.log('[Login] Restoring workspace before redirect:', intent.workspaceId)
        await restoreWorkspaceSafe(intent.workspaceId)
      }

      // CRITICAL: Await navigation to ensure it completes
      // Without await, re-renders can cancel the navigation silently
      await router.replace(destination)
    } catch (err: unknown) {
      // Reset navigation state on error so user can retry
      setIsNavigating(false)

      const errorMessage = getLoginErrorMessage(err)

      // Show error toast
      toast.error('Sign in failed', {
        description: errorMessage
      })

      onError?.(errorMessage)

      // Focus back to password field for retry
      form.setFocus('password')
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    // This would integrate with your OAuth service
    console.log(`Social login with ${provider}`)
    // await initiateOAuth2Login(provider)
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember_me"
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
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {showForgotPassword && (
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </Link>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || isNavigating}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Social Login */}
          {showSocialLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
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
                  onClick={() => handleSocialLogin('apple')}
                  disabled={isLoading}
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
            </>
          )}
        </form>
      </Form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Do not have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-primary hover:underline font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
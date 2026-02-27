/**
 * Reset Password Page - Clean Implementation
 * Modern reset password flow with proper Shadcn/UI integration
 * Uses Zustand auth directly with proper validation
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/authentication/useAuth'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('Authentication.resetPassword')
  const v = useTranslations('Authentication.validation')

  const { clearError } = useAuth()
  const token = searchParams.get('token')

  useEffect(() => {
    clearError()

    if (!token) {
      setError(t('invalidToken'))
    }
  }, [clearError, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!token) {
      setError(t('invalidToken'))
      setIsLoading(false)
      return
    }

    // Basic password validation
    if (formData.password.length < 8) {
      setError(v('passwordMin'))
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(v('passwordsMatch'))
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement password reset confirmation through auth service
      // await confirmPasswordReset({ token, new_password: formData.password })

      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || t('failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-2xl font-semibold mb-2">
                  {t('success')}
                </h1>
                <p className="text-muted-foreground mb-8">
                  {t('successDesc')}
                </p>

                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    {t('continueToLogin')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold">
              {t('title')}
            </CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">{t('newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('newPasswordPlaceholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
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
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('confirmNewPassword')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pr-10"
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
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !token}
              >
                {isLoading ? t('submitting') : t('submit')}
              </Button>

              <div className="text-center">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToLogin')}
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
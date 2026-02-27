/**
 * Forgot Password Page - Clean Implementation
 * Modern forgot password flow with proper Shadcn/UI integration
 * Uses Zustand auth directly with proper error handling
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/authentication/useAuth'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('Authentication.forgotPassword')

  const { clearError } = useAuth()

  useEffect(() => {
    clearError()
  }, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !email.includes('@')) {
      setError(t('invalidEmail'))
      setIsLoading(false)
      return
    }

    try {
      // TODO: Implement password reset request through auth service
      // await requestPasswordReset({ email })

      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSent(true)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || t('errorSending'))
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
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
                  {t('checkEmail')}
                </h1>
                <p className="text-muted-foreground mb-2">
                  {t('sentInstructions')}
                </p>
                <p className="font-medium mb-8">
                  {email}
                </p>

                <Button asChild variant="outline">
                  <Link href="/auth/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToLogin')}
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
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('sendingLink') : t('sendLink')}
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
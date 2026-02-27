/**
 * Signup Page - Clean Implementation
 * Uses new SignupForm component with proper Shadcn/UI integration
 * Modern registration UX with proper error handling
 */

'use client'

import React from 'react'
import { SignupForm } from '@/components/authentication/forms/SignupForm'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'

export default function SignupPage() {
  const t = useTranslations('Authentication.signup')
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold">
              {t('createAccountTitle')}
            </CardTitle>
            <CardDescription>
              {t('joinHuzilerz')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <SignupForm
              onSuccess={() => {
                // Navigation handled by SignupForm internally
              }}
              onError={(error) => {
                console.error('Registration error:', error)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
/**
 * Login Page - Clean Implementation
 * Uses new LoginForm component with proper Shadcn/UI integration
 * Modern authentication UX with proper error handling
 */

'use client'

import React from 'react'
import { LoginForm } from '@/components/authentication/forms/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your HUZILERZ account
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <LoginForm
              onSuccess={() => {
                // Navigation handled by LoginForm internally
              }}
              onError={(error) => {
                console.error('Login error:', error)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
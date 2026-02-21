/**
 * Verify Page - Email Account Verification
 * Handles email OTP verification after signup
 * Phone/SMS verification hidden until SMS provider is ready
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Button } from '@/components/shadcn-ui/button'
import { EmailVerificationCard } from '@/components/authentication/verification'
import { useAuth } from '@/hooks/authentication/useAuth'
// import { Clock } from 'lucide-react'  // Uncomment when SMS verification is enabled


export default function VerifyPage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()

    const [emailVerified, setEmailVerified] = React.useState(false)

    // Check if user is authenticated
    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/auth/login')
        }
    }, [isAuthenticated, isLoading, router])

    // Initialize verified states from user data
    React.useEffect(() => {
        if (user) {
            setEmailVerified(user.email_verified || false)
        }
    }, [user])

    // MVP: Only email verification required
    const canContinue = emailVerified

    const handleContinue = () => {
        router.push('/workspace')
    }

    // Loading state
    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4">
                {/* Header Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-semibold">
                            Verify Your Account
                        </CardTitle>
                        <CardDescription>
                            Complete verification to secure your account
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Email Verification - Primary */}
                <EmailVerificationCard
                    email={user.email}
                    onVerified={() => setEmailVerified(true)}
                    className="shadow-lg"
                />

                {/* ---------------------------------------------------------------
                 * Phone Verification — COMMENTED OUT (SMS provider not ready yet)
                 * Uncomment this block + Clock import when SMS is enabled
                 * --------------------------------------------------------------- */}
                {/* {user.phone_number && (
                    <Card className="shadow-lg opacity-60">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Phone Verification</CardTitle>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                    <Clock className="h-3 w-3" />
                                    Coming Soon
                                </div>
                            </div>
                            <CardDescription>
                                SMS verification will be available soon
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )} */}

                {/* Continue Button - enabled when email verified */}
                <Button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="w-full h-12"
                    size="lg"
                >
                    Continue to Dashboard
                </Button>

                {/* Skip Button - Beta testing */}
                {!canContinue && (
                    <Button
                        variant="ghost"
                        onClick={handleContinue}
                        className="w-full h-10 text-muted-foreground hover:text-foreground"
                    >
                        Skip for now (Beta)
                    </Button>
                )}

                <p className="text-center text-xs text-muted-foreground">
                    You can verify later in Settings
                </p>
            </div>
        </div>
    )
}


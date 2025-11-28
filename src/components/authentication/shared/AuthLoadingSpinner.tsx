/**
 * Authentication Loading Spinner
 * Consistent loading state for auth operations
 */

import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function AuthLoadingSpinner({
  size = 'md',
  text = 'Loading...',
  className
}: AuthLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn(
      'flex items-center justify-center space-x-2',
      className
    )}>
      <Loader2 className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size]
      )} />
      {text && (
        <span className="text-sm text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  )
}

/**
 * Full page auth loading spinner
 */
export function AuthPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AuthLoadingSpinner size="lg" text="Authenticating..." />
      </div>
    </div>
  )
}
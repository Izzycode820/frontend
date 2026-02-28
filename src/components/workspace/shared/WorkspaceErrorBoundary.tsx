/**
 * Workspace Error Boundary
 * Catches and handles workspace-related errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, FolderOpen } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useTranslations } from 'next-intl'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Translated fallback UI used by the class component.
 * Wraps the functional useTranslations hook so the class can render it.
 */
function ErrorFallback({
  errorMessage,
  onRetry,
}: {
  errorMessage: string | undefined
  onRetry: () => void
}) {
  const t = useTranslations('Workspaces.errorBoundary')

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {errorMessage || t('description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onRetry}
            variant="default"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('tryAgain')}</span>
          </Button>

          <Button
            onClick={() => window.location.href = '/workspace'}
            variant="outline"
            size="sm"
          >
            {t('backToWorkspaces')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export class WorkspaceErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Workspace Error Boundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          errorMessage={this.state.error?.message}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Hook version for functional components
 */
export function useWorkspaceErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error('Workspace error:', error)
    setError(error)
  }, [])

  return {
    error,
    resetError,
    handleError,
    hasError: !!error
  }
}
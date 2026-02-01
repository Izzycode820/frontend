/**
 * Token Refresh Coordinator - Centralized Token Management
 *
 * Prevents race conditions between:
 * - AuthInitializer.initializeSession()
 * - TokenManager.checkAndRefreshToken()
 * - BaseClient.attemptTokenRefresh()
 *
 * Single source of truth for refresh state across the entire application.
 */

import authService from './auth'
import type { RefreshTokenResponse } from '../../types/authentication/auth'

// ============================================================================
// Types
// ============================================================================

type RefreshState = 'idle' | 'initializing' | 'refreshing'

interface RefreshResult {
  success: boolean
  response?: RefreshTokenResponse
  error?: Error
}

type StateChangeCallback = (state: RefreshState) => void

// ============================================================================
// Token Refresh Coordinator (Singleton)
// ============================================================================

class TokenRefreshCoordinatorClass {
  private static instance: TokenRefreshCoordinatorClass

  // Current state
  private state: RefreshState = 'idle'

  // Active refresh promise (for de-duplication)
  private refreshPromise: Promise<RefreshResult> | null = null

  // Initialization tracking
  private initializationComplete: boolean = false

  // State change listeners
  private listeners: Set<StateChangeCallback> = new Set()

  // Debug logging
  private debug: boolean = typeof window !== 'undefined' &&
    localStorage.getItem('DEBUG_TOKEN_REFRESH') === 'true'

  private constructor() {}

  static getInstance(): TokenRefreshCoordinatorClass {
    if (!TokenRefreshCoordinatorClass.instance) {
      TokenRefreshCoordinatorClass.instance = new TokenRefreshCoordinatorClass()
    }
    return TokenRefreshCoordinatorClass.instance
  }

  // ============================================================================
  // State Management
  // ============================================================================

  private setState(newState: RefreshState): void {
    if (this.state !== newState) {
      this.log(`State change: ${this.state} → ${newState}`)
      this.state = newState
      this.notifyListeners()
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.state)
      } catch (error) {
        console.error('[TokenRefreshCoordinator] Listener error:', error)
      }
    })
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: StateChangeCallback): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Get current state
   */
  getState(): RefreshState {
    return this.state
  }

  /**
   * Check if initialization is complete
   */
  isInitializationComplete(): boolean {
    return this.initializationComplete
  }

  /**
   * Check if a refresh operation is in progress
   */
  isRefreshing(): boolean {
    return this.state === 'refreshing' || this.state === 'initializing'
  }

  /**
   * Check if it's safe for TokenManager to attempt refresh
   * Returns false during initialization or if already refreshing
   */
  canTokenManagerRefresh(): boolean {
    // Don't allow TokenManager to refresh during initialization
    if (this.state === 'initializing') {
      this.log('TokenManager refresh blocked: initialization in progress')
      return false
    }

    // Don't allow if already refreshing (de-duplication)
    if (this.state === 'refreshing') {
      this.log('TokenManager refresh blocked: refresh already in progress')
      return false
    }

    return true
  }

  // ============================================================================
  // Refresh Operations
  // ============================================================================

  /**
   * Initialize session (called by AuthInitializer)
   * This is the primary entry point during app startup
   */
  async initializeSession(): Promise<RefreshResult> {
    // Already initialized - return success
    if (this.initializationComplete) {
      this.log('Already initialized, skipping')
      return { success: true }
    }

    // If currently initializing, wait for it
    if (this.state === 'initializing' && this.refreshPromise) {
      this.log('Initialization in progress, waiting...')
      return this.refreshPromise
    }

    // If refreshing, wait for that instead
    if (this.state === 'refreshing' && this.refreshPromise) {
      this.log('Refresh in progress during init, waiting...')
      const result = await this.refreshPromise
      this.initializationComplete = true
      return result
    }

    // Start initialization
    this.setState('initializing')
    this.refreshPromise = this.executeRefresh()

    try {
      const result = await this.refreshPromise
      this.initializationComplete = true
      return result
    } finally {
      this.refreshPromise = null
      this.setState('idle')
    }
  }

  /**
   * Refresh token (called by TokenManager or other components)
   * Will be blocked during initialization
   */
  async refreshToken(): Promise<RefreshResult> {
    // Block during initialization
    if (this.state === 'initializing') {
      this.log('Refresh blocked during initialization')
      if (this.refreshPromise) {
        return this.refreshPromise
      }
      return { success: false, error: new Error('Initialization in progress') }
    }

    // If already refreshing, return existing promise (de-duplication)
    if (this.state === 'refreshing' && this.refreshPromise) {
      this.log('Refresh already in progress, reusing promise')
      return this.refreshPromise
    }

    // Start refresh
    this.setState('refreshing')
    this.refreshPromise = this.executeRefresh()

    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
      this.setState('idle')
    }
  }

  /**
   * Execute the actual refresh call
   * Single implementation used by both init and refresh
   */
  private async executeRefresh(): Promise<RefreshResult> {
    this.log('Executing refresh...')

    try {
      const response = await authService.refreshToken()

      if (response.tokens?.access_token) {
        this.log('Refresh successful')
        return { success: true, response }
      } else {
        this.log('Refresh response missing access_token')
        return {
          success: false,
          error: new Error('Refresh response missing access_token'),
          response
        }
      }
    } catch (error) {
      this.log('Refresh failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * Reset coordinator state (for logout or testing)
   */
  reset(): void {
    this.log('Resetting coordinator')
    this.state = 'idle'
    this.refreshPromise = null
    this.initializationComplete = false
  }

  /**
   * Mark initialization as complete (used when session is already valid)
   */
  markInitialized(): void {
    this.initializationComplete = true
    if (this.state === 'initializing') {
      this.setState('idle')
    }
  }

  // ============================================================================
  // Logging
  // ============================================================================

  private log(...args: unknown[]): void {
    if (this.debug) {
      console.log('[TokenRefreshCoordinator]', ...args)
    }
  }

  /**
   * Enable/disable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled
    if (typeof window !== 'undefined') {
      if (enabled) {
        localStorage.setItem('DEBUG_TOKEN_REFRESH', 'true')
      } else {
        localStorage.removeItem('DEBUG_TOKEN_REFRESH')
      }
    }
  }
}

// ============================================================================
// Export Singleton
// ============================================================================

export const TokenRefreshCoordinator = TokenRefreshCoordinatorClass.getInstance()
export default TokenRefreshCoordinator

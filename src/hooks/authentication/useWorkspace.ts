/**
 * Workspace Hook - 2024 Best Practices with Zustand
 * Custom hook layer for workspace store - handles switching and permissions
 * Following patterns: single responsibility, selective subscriptions, error boundaries
 */

import { useCallback } from 'react'
import { useWorkspaceStore, workspaceSelectors } from '../../stores/authentication/workspaceStore'
import { useAuthStore } from '../../stores/authentication/authStore'
import workspaceService from '../../services/authentication/workspace'
import { extractWorkspaceFromJWT } from '../../utils/jwt'
import type {
  WorkspaceSwitchResponse,
  LeaveWorkspaceResponse
} from '../../types/authentication/workspace'

// ============================================================================
// Hook Return Interface - Clean Contract
// ============================================================================

export interface UseWorkspaceReturn {
  // State selectors (performance optimized)
  currentWorkspace: ReturnType<typeof workspaceSelectors.currentWorkspace>
  availableWorkspaces: ReturnType<typeof workspaceSelectors.availableWorkspaces>
  isLoading: boolean
  isSwitching: boolean
  error: string | null

  // Computed state
  currentWorkspaceName: string | null
  currentWorkspaceId: string | null
  userRole: string | null
  userPermissions: string[]
  hasMultipleWorkspaces: boolean
  isCurrentWorkspaceOwner: boolean
  isCurrentWorkspaceAdmin: boolean

  // Actions (stable references)
  switchWorkspace: (workspaceId: string) => Promise<WorkspaceSwitchResponse>
  leaveWorkspace: () => Promise<LeaveWorkspaceResponse>
  clearError: () => void
  hasPermission: (permission: string) => boolean
  canSwitchTo: (workspaceId: string) => boolean
}

// ============================================================================
// Main Workspace Hook
// ============================================================================

export function useWorkspace(): UseWorkspaceReturn {
  // Selective store subscriptions (performance optimized)
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace)
  const availableWorkspaces = useWorkspaceStore(workspaceSelectors.availableWorkspaces)
  const isLoading = useWorkspaceStore(workspaceSelectors.isLoading)
  const isSwitching = useWorkspaceStore(workspaceSelectors.isSwitching)
  const error = useWorkspaceStore(workspaceSelectors.error)
  const currentWorkspaceName = useWorkspaceStore(workspaceSelectors.currentWorkspaceName)
  const currentWorkspaceId = useWorkspaceStore(workspaceSelectors.currentWorkspaceId)
  const userRole = useWorkspaceStore(workspaceSelectors.userRole)
  const userPermissions = useWorkspaceStore(workspaceSelectors.userPermissions)
  const hasMultipleWorkspaces = useWorkspaceStore(workspaceSelectors.hasMultipleWorkspaces)
  const isCurrentWorkspaceOwner = useWorkspaceStore(workspaceSelectors.isCurrentWorkspaceOwner)
  const isCurrentWorkspaceAdmin = useWorkspaceStore(workspaceSelectors.isCurrentWorkspaceAdmin)

  // Store actions (direct references - stable by default in Zustand)
  const setSwitchSuccess = useWorkspaceStore(state => state.setSwitchSuccess)
  const startWorkspaceSwitch = useWorkspaceStore(state => state.startWorkspaceSwitch)
  const cancelWorkspaceSwitch = useWorkspaceStore(state => state.cancelWorkspaceSwitch)
  const setError = useWorkspaceStore(state => state.setError)
  const clearError = useWorkspaceStore(state => state.clearError)

  // ============================================================================
  // Stable Action Implementations
  // ============================================================================

  // Helper functions using store methods
  const hasPermission = useCallback((permission: string): boolean => {
    return useWorkspaceStore.getState().hasPermission(permission)
  }, [])

  const canSwitchTo = useCallback((workspaceId: string): boolean => {
    return useWorkspaceStore.getState().canSwitchTo(workspaceId)
  }, [])

  const switchWorkspace = useCallback(async (workspaceId: string): Promise<WorkspaceSwitchResponse> => {
    try {
      // Validate workspace access before switching
      if (!canSwitchTo(workspaceId)) {
        throw new Error('Cannot switch to this workspace - workspace not found or access denied')
      }

      // Start switch process with workspace ID (sets UI state)
      startWorkspaceSwitch(workspaceId)

      // Actual workspace switch with the ID
      const response = await workspaceService.switchWorkspace(workspaceId)

      if (response.success && response.workspace && response.tokens?.access_token) {
        // Validate JWT claims before trusting the response
        const workspaceClaims = extractWorkspaceFromJWT(response.tokens.access_token)

        if (!workspaceClaims) {
          throw new Error('Workspace token validation failed - missing workspace claims')
        }

        if (workspaceClaims.id !== workspaceId) {
          throw new Error('Workspace token validation failed - workspace ID mismatch')
        }

        if (!workspaceClaims.role) {
          throw new Error('Workspace token validation failed - missing role claim')
        }

        // Validation passed - update store
        setSwitchSuccess(response)
        return response
      }

      throw new Error(response.error || 'Workspace switch failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Workspace switch failed'
      setError(errorMessage)
      cancelWorkspaceSwitch()
      throw error
    }
  }, [canSwitchTo, startWorkspaceSwitch, setSwitchSuccess, setError, cancelWorkspaceSwitch])

  const leaveWorkspace = useCallback(async (): Promise<LeaveWorkspaceResponse> => {
    try {
      // Check if user is actually in a workspace
      if (!currentWorkspace) {
        throw new Error('Not currently in a workspace')
      }

      // Call backend to leave workspace (revokes old token, issues new one)
      const response = await workspaceService.leaveWorkspace()

      if (response.success && response.tokens?.access_token) {
        // Update authStore with new tokens (clears workspace context)
        useAuthStore.getState().setLeaveSuccess(response)
        return response
      }

      throw new Error(response.error || 'Leave workspace failed')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Leave workspace failed'
      setError(errorMessage)
      throw error
    }
  }, [currentWorkspace, setError])

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State (reactive)
    currentWorkspace,
    availableWorkspaces,
    isLoading,
    isSwitching,
    error,

    // Computed state
    currentWorkspaceName,
    currentWorkspaceId,
    userRole,
    userPermissions,
    hasMultipleWorkspaces,
    isCurrentWorkspaceOwner,
    isCurrentWorkspaceAdmin,

    // Actions (stable)
    switchWorkspace,
    leaveWorkspace,
    clearError,
    hasPermission,
    canSwitchTo
  }
}

// ============================================================================
// Granular Hooks (Performance Optimization)
// ============================================================================

/**
 * Hook for current workspace info only - minimal re-renders
 */
export function useCurrentWorkspace() {
  return {
    currentWorkspace: useWorkspaceStore(workspaceSelectors.currentWorkspace),
    currentWorkspaceName: useWorkspaceStore(workspaceSelectors.currentWorkspaceName),
    currentWorkspaceId: useWorkspaceStore(workspaceSelectors.currentWorkspaceId),
    userRole: useWorkspaceStore(workspaceSelectors.userRole),
    userPermissions: useWorkspaceStore(workspaceSelectors.userPermissions)
  }
}

/**
 * Hook for workspace permissions only - minimal re-renders
 */
export function useWorkspacePermissions() {
  const isWorkspaceOwner = useWorkspaceStore(workspaceSelectors.isCurrentWorkspaceOwner)
  const isWorkspaceAdmin = useWorkspaceStore(workspaceSelectors.isCurrentWorkspaceAdmin)

  // Use store method for permission checking
  const hasPermission = useCallback((permission: string): boolean => {
    return useWorkspaceStore.getState().hasPermission(permission)
  }, [])

  return {
    hasPermission,
    isOwner: isWorkspaceOwner,
    isAdmin: isWorkspaceAdmin,
    userPermissions: useWorkspaceStore(workspaceSelectors.userPermissions),
    userRole: useWorkspaceStore(workspaceSelectors.userRole)
  }
}

/**
 * Hook for workspace switching only - minimal re-renders
 */
export function useWorkspaceSwitcher() {
  return {
    availableWorkspaces: useWorkspaceStore(workspaceSelectors.availableWorkspaces),
    isSwitching: useWorkspaceStore(workspaceSelectors.isSwitching),
    hasMultipleWorkspaces: useWorkspaceStore(workspaceSelectors.hasMultipleWorkspaces)
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default useWorkspace
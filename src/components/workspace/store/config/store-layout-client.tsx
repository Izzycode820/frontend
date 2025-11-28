"use client"

/**
 * Store Workspace Client Layout
 * Uses YOUR Zustand stores + Config files (Industry Standard Pattern)
 *
 * DATA FLOW:
 * 1. Zustand stores provide runtime data (user, workspace, permissions)
 * 2. Config files provide static structure (navigation blueprint for Store type)
 * 3. This component combines both → renders universal layout
 *
 * WORKSPACE RESTORATION ON REFRESH:
 * - Extracts workspace_id from URL params
 * - Checks if workspace context exists in authStore (from JWT)
 * - Syncs workspace data to workspaceStore if missing
 * - Handles race condition between auth initialization and layout render
 */

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { WorkspaceLayout } from "@/components/workspace/layouts/workspace-layout"
import { WorkspaceSidebar } from "@/components/workspace/layouts/workspace-sidebar"
import { WorkspaceHeader } from "@/components/workspace/layouts/workspace-header"
import { getStoreSidebarConfig } from "@/components/workspace/store/config/sidebar"
import { useAuthStore, authSelectors } from "@/stores/authentication/authStore"
import { useWorkspaceStore, workspaceSelectors } from "@/stores/authentication/workspaceStore"

interface StoreLayoutClientProps {
  children: React.ReactNode
}

export function StoreLayoutClient({ children }: StoreLayoutClientProps) {
  const params = useParams()
  const workspaceId = params?.workspace_id as string

  // Auth state
  const user = useAuthStore(authSelectors.user)
  const isInitialized = useAuthStore(authSelectors.isInitialized)
  const authWorkspace = useAuthStore(authSelectors.workspace) // Workspace from JWT

  // Workspace state
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace)
  const setCurrentWorkspace = useWorkspaceStore(state => state.setCurrentWorkspace)

  // Local loading state
  const [isRestoring, setIsRestoring] = useState(true)

  // Restore workspace context on mount/refresh
  useEffect(() => {
    // Wait for auth initialization to complete
    if (!isInitialized) {
      return
    }

    // If workspace already loaded and matches URL, we're done
    if (currentWorkspace?.id === workspaceId) {
      setIsRestoring(false)
      return
    }

    // Try to restore workspace from authStore (JWT claims)
    if (authWorkspace?.id === workspaceId) {
      // Sync workspace from authStore to workspaceStore
      setCurrentWorkspace(authWorkspace)
      setIsRestoring(false)
      return
    }

    // If we reach here, workspace context is missing
    // This means the JWT doesn't have workspace claims for this workspace
    // User needs to re-enter workspace (navigate back to workspace listing)
    console.warn('[StoreLayoutClient] Workspace context missing for:', workspaceId)
    console.warn('[StoreLayoutClient] Please navigate back to workspace listing and re-enter')
    setIsRestoring(false)
  }, [isInitialized, currentWorkspace, authWorkspace, workspaceId, setCurrentWorkspace])

  // Show loading while auth initializes or workspace restores
  if (!isInitialized || isRestoring) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading workspace...</p>
      </div>
    )
  }

  // Show error if workspace context couldn't be restored
  if (!currentWorkspace || !user) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Workspace context missing</p>
        <p className="text-sm text-muted-foreground">
          Please navigate back to workspace listing and re-enter
        </p>
      </div>
    )
  }

  // Workspace context ready - render layout
  if (currentWorkspace.id !== workspaceId) {
    console.error('[StoreLayoutClient] Workspace ID mismatch:', {
      expected: workspaceId,
      actual: currentWorkspace.id
    })
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-destructive">Workspace ID mismatch</p>
        <p className="text-sm text-muted-foreground">
          Expected: {workspaceId}, Got: {currentWorkspace.id}
        </p>
      </div>
    )
  }

  // Get STATIC STRUCTURE from config (Store-specific navigation blueprint)
  const sidebarConfig = getStoreSidebarConfig(currentWorkspace.id, {
    name: user.username,
    email: user.email,
    avatar: user.avatar || "/avatars/default.jpg"
  })

  return (
    <WorkspaceLayout
      sidebar={<WorkspaceSidebar config={sidebarConfig} />}
      header={<WorkspaceHeader title={`${currentWorkspace.name} - Store`} />}
    >
      {children}
    </WorkspaceLayout>
  )
}

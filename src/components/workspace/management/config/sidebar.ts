/**
 * Workspace Management Sidebar Configuration
 * For the workspace home/listing page
 */

import {
  IconHome,
} from "@tabler/icons-react"
import type {
  NavMainItem,
  NavSecondaryItem,
  WorkspaceConfig,
  UserConfig,
  WorkspaceSidebarConfig,
} from "@/types/workspace/dashboard-ui/workspace"

/**
 * Get workspace management sidebar navigation
 * @param user - Current user data
 */
export function getManagementSidebarConfig(user: UserConfig): WorkspaceSidebarConfig {
  // Main navigation
  const navMain: NavMainItem[] = [
    {
      title: "All Workspaces",
      url: "/workspace",
      icon: IconHome,
    },
  ]

  // Secondary navigation (bottom)
  const navSecondary: NavSecondaryItem[] = []

  // Workspace configuration
  const workspaceConfig: WorkspaceConfig = {
    name: "Huzilerz",
    icon: IconHome,
    url: "/workspace",
  }

  return {
    user,
    navMain,
    navSecondary,
    workspaceConfig,
    footerActions: [], // No footer actions for management sidebar
  }
}

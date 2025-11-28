/**
 * Workspace Authentication Context Types
 * ONLY workspace-related types needed for authentication context
 * Aligned with backend WORKSPACEPAYLOAD.md API documentation
 */

// ============================================================================
// Workspace Context for Auth (from API Response + JWT)
// ============================================================================

export interface WorkspaceAuthContext {
  // From API response
  readonly id: string;
  readonly name: string;
  readonly type: 'store' | 'blog' | 'services' | 'portfolio';
  readonly status: 'active' | 'suspended';

  // From JWT claims (workspace_role, workspace_permissions)
  readonly role?: string;
  readonly permissions?: string[];
  readonly is_default?: boolean;
}

// ============================================================================
// Workspace Switching for Auth
// ============================================================================

export interface WorkspaceSwitchRequest {
  readonly workspace_id: string;
}

export interface WorkspaceSwitchResponse {
  readonly success: boolean;
  readonly tokens?: {
    readonly access_token: string;
    readonly token_type: string;
    readonly expires_in: number;
  };
  readonly workspace?: WorkspaceAuthContext;
  readonly message?: string;
  readonly error?: string;
}

export interface LeaveWorkspaceResponse {
  readonly success: boolean;
  readonly tokens?: {
    readonly access_token: string;
    readonly token_type: string;
    readonly expires_in: number;
  };
  readonly message?: string;
  readonly error?: string;
}

// ============================================================================
// Available Workspaces for Auth Context
// ============================================================================

export interface AvailableWorkspace {
  readonly id: string;
  readonly name: string;
  readonly type: 'store' | 'blog' | 'services' | 'portfolio';
  readonly is_default: boolean;
  readonly user_role: string;
  readonly status: 'active' | 'suspended';
  readonly permissions: string[];
  readonly member_count: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkspaceListResponse {
  readonly success: boolean;
  readonly workspaces?: readonly AvailableWorkspace[];
  readonly current_workspace_id?: string;
  readonly error?: string;
}

// ============================================================================
// Hook Return Types for Auth Context
// ============================================================================

export interface UseWorkspaceSwitchReturn {
  availableWorkspaces: AvailableWorkspace[];
  currentWorkspace: WorkspaceAuthContext | null;
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => Promise<WorkspaceSwitchResponse>;
  refreshWorkspaces: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// Workspace Auth State
// ============================================================================

export interface WorkspaceAuthState {
  current: WorkspaceAuthContext | null;
  available: AvailableWorkspace[];
  isSwitching: boolean;
  error: string | null;
}

// ============================================================================
// Constants for Auth Context
// ============================================================================

export const WORKSPACE_TYPES = {
  STORE: 'store',
  BLOG: 'blog',
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
} as const;

export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export const WORKSPACE_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export type WorkspaceType = typeof WORKSPACE_TYPES[keyof typeof WORKSPACE_TYPES];
export type WorkspaceRole = typeof WORKSPACE_ROLES[keyof typeof WORKSPACE_ROLES];
export type WorkspaceStatus = typeof WORKSPACE_STATUS[keyof typeof WORKSPACE_STATUS];
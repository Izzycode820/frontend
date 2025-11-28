"use client"

import React from 'react';
import {
  IconBuildingStore,
  IconFileText,
  IconBriefcase,
  IconLayout,
  IconUsers,
  IconTrendingUp,
  IconSettings
} from '@tabler/icons-react';

// Shadcn/UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';

// Types
import type { WorkspaceListItem } from '@/types/workspace/core';

interface WorkspaceCardProps {
  workspace: WorkspaceListItem;
  onClick: () => void;
  className?: string;
}

// Workspace type configurations
const workspaceTypeConfig = {
  store: {
    icon: IconBuildingStore,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    label: 'Store',
  },
  blog: {
    icon: IconFileText,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    label: 'Blog',
  },
  services: {
    icon: IconBriefcase,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    label: 'Services',
  },
  portfolio: {
    icon: IconLayout,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    label: 'Portfolio',
  },
} as const;

// Status configurations
const statusConfig = {
  active: {
    variant: 'default' as const,
    label: 'Active',
  },
  inactive: {
    variant: 'secondary' as const,
    label: 'Inactive',
  },
  suspended: {
    variant: 'destructive' as const,
    label: 'Suspended',
  },
  deleted: {
    variant: 'destructive' as const,
    label: 'Deleted',
  },
} as const;

export function WorkspaceCard({ workspace, onClick, className }: WorkspaceCardProps) {
  const typeConfig = workspaceTypeConfig[workspace.type] || workspaceTypeConfig.store;
  const status = statusConfig[workspace.status] || statusConfig.active;
  const IconComponent = typeConfig.icon;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className={`
        @container/card
        group cursor-pointer
        bg-gradient-to-t from-primary/5 to-card
        shadow-xs
        transition-all duration-200
        hover:from-primary/10 hover:to-card
        hover:shadow-md
        ${className}
      `}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${typeConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {workspace.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {typeConfig.label}
                </Badge>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to workspace settings
              console.log('Settings clicked for workspace:', workspace.id);
            }}
          >
            <IconSettings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Workspace Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <IconUsers className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{workspace.member_count || 0}</span>
            <span className="text-muted-foreground">members</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{workspace.permissions || 'Owner'}</span>
          </div>
        </div>

        {/* Description placeholder - WorkspaceListItem doesn't include description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {workspace.type.charAt(0).toUpperCase() + workspace.type.slice(1)} workspace
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {formatDate(workspace.createdAt)}</span>
          {workspace.updatedAt !== workspace.createdAt && (
            <span>Updated {formatDate(workspace.updatedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkspaceCard;
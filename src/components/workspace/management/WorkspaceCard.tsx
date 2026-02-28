"use client"

import React from 'react';
import {
  IconBuildingStore,
  IconFileText,
  IconBriefcase,
  IconLayout,
  IconUsers,
  IconDots,
  IconRefresh,
  IconClock,
  IconTrash,
  IconLock,
  IconUserCheck,
  IconLoader2,
  IconSettings,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

// Shadcn/UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn-ui/tooltip';

// Hooks
import { useWorkspaceManagement } from '@/hooks/workspace/core/useWorkspaceManagement';

// Types
import type { WorkspaceListItem } from '@/types/workspace/core';

interface WorkspaceCardProps {
  workspace: WorkspaceListItem;
  onClick: () => void;
  className?: string;
}

// Workspace type icon map (labels come from i18n)
const workspaceTypeConfig = {
  store: {
    icon: IconBuildingStore,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  blog: {
    icon: IconFileText,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  services: {
    icon: IconBriefcase,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  portfolio: {
    icon: IconLayout,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
} as const;

// Status badge style map (labels come from i18n)
const statusStyle = {
  active: {
    variant: 'default' as const,
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    dotColor: 'bg-emerald-500',
    animate: false,
  },
  provisioning: {
    variant: 'outline' as const,
    className: 'border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
    dotColor: 'bg-blue-400',
    animate: true,
  },
  inactive: {
    variant: 'secondary' as const,
    className: '',
    dotColor: 'bg-muted-foreground',
    animate: false,
  },
  suspended: {
    variant: 'destructive' as const,
    className: '',
    dotColor: 'bg-destructive',
    animate: false,
  },
  suspended_by_plan: {
    variant: 'outline' as const,
    className: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/50',
    dotColor: 'bg-amber-500',
    animate: false,
  },
  deleted: {
    variant: 'destructive' as const,
    className: '',
    dotColor: 'bg-destructive',
    animate: false,
  },
} as const;

export function WorkspaceCard({ workspace, onClick, className }: WorkspaceCardProps) {
  const t = useTranslations('Workspaces');
  const typeConf = workspaceTypeConfig[workspace.type as keyof typeof workspaceTypeConfig] || workspaceTypeConfig.store;
  const style = statusStyle[workspace.status as keyof typeof statusStyle] || statusStyle.active;
  const IconComponent = typeConf.icon;

  const { deleteWorkspace, restoreWorkspace } = useWorkspaceManagement();
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  // State flags
  const isOwner = workspace.role === 'owner';
  const isDeleted = workspace.status === 'suspended';
  const isSuspendedByPlan = workspace.status === 'suspended_by_plan';
  const isProvisioning = workspace.status === 'provisioning';
  const isRestricted = workspace.restricted_mode;
  const canRestore = workspace.deletionInfo?.canRestore || false;
  const isClickable = !isDeleted && !isSuspendedByPlan && !isProvisioning;

  // Real-time deletion countdown
  const [timeRemaining, setTimeRemaining] = React.useState<{ days: number, hours: number, minutes: number } | null>(null);

  React.useEffect(() => {
    if (!isDeleted || !workspace.deletionInfo?.scheduledFor) return;
    const calculate = () => {
      const diff = new Date(workspace.deletionInfo!.scheduledFor).getTime() - Date.now();
      if (diff <= 0) { setTimeRemaining({ days: 0, hours: 0, minutes: 0 }); return; }
      setTimeRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    calculate();
    const id = setInterval(calculate, 60000);
    return () => clearInterval(id);
  }, [isDeleted, workspace.deletionInfo?.scheduledFor]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActionLoading) return;
    if (!confirm(t('card.actions.deleteConfirm', { name: workspace.name }))) return;
    setIsActionLoading(true);
    try { await deleteWorkspace(workspace.id); }
    catch { /* noop */ }
    finally { setIsActionLoading(false); }
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActionLoading) return;
    setIsActionLoading(true);
    try { await restoreWorkspace(workspace.id); }
    catch { /* noop */ }
    finally { setIsActionLoading(false); }
  };

  const DropdownActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={isActionLoading}
          onClick={(e) => e.stopPropagation()}
          aria-label={t('card.actions.label')}
        >
          {isActionLoading
            ? <IconLoader2 className="h-4 w-4 animate-spin" />
            : <IconDots className="h-4 w-4" />
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {isDeleted ? (
          canRestore && (
            <DropdownMenuItem onClick={handleRestore} disabled={isActionLoading}>
              <IconRefresh className="mr-2 h-4 w-4" />
              {t('card.actions.restore')}
            </DropdownMenuItem>
          )
        ) : isOwner ? (
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isActionLoading || isProvisioning}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            {t('card.actions.delete')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={`
          @container/card group relative
          bg-gradient-to-t from-primary/5 to-card
          shadow-xs transition-all duration-200
          ${isClickable ? 'cursor-pointer hover:from-primary/10 hover:shadow-md' : 'cursor-default'}
          ${isDeleted || isSuspendedByPlan ? 'opacity-60' : ''}
          ${isRestricted && !isProvisioning ? 'border-amber-500/40' : ''}
          ${isProvisioning ? 'border-blue-400/40' : ''}
          ${className || ''}
        `}
        onClick={isClickable ? onClick : undefined}
      >
        {/* ────────── MOBILE ────────── */}
        <div className="md:hidden">
          <CardContent className="flex items-center gap-3 p-3">
            <div className={`p-2 rounded-lg shrink-0 ${typeConf.bgColor}`}>
              <IconComponent className={`h-4 w-4 ${typeConf.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-sm truncate">{workspace.name}</span>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dotColor} ${style.animate ? 'animate-pulse' : ''}`} />
              </div>
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  {t(`card.type.${workspace.type}`)}
                </Badge>
                <Badge variant={style.variant} className={`text-[10px] px-1.5 py-0 h-4 ${style.className}`}>
                  {isProvisioning && <IconSettings className="h-2.5 w-2.5 mr-0.5 animate-spin" />}
                  {t(`card.status.${workspace.status}`)}
                </Badge>
              </div>
            </div>

            {isDeleted && timeRemaining && (
              <div className="flex items-center gap-1 text-destructive shrink-0">
                <IconClock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">{timeRemaining.days}d</span>
              </div>
            )}

            {isRestricted && !isDeleted && !isSuspendedByPlan && !isProvisioning && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconLock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                </TooltipTrigger>
                <TooltipContent>{t('card.tooltip.writeRestricted')}</TooltipContent>
              </Tooltip>
            )}

            {DropdownActions}
          </CardContent>
        </div>

        {/* ────────── DESKTOP ────────── */}
        <div className="hidden md:block">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2 min-w-0">
              {/* Left side */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${typeConf.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${typeConf.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CardTitle className="text-base font-semibold truncate leading-tight">
                      {workspace.name}
                    </CardTitle>
                    <span className={`h-2 w-2 rounded-full shrink-0 ${style.dotColor} ${style.animate ? 'animate-pulse' : ''}`} />
                  </div>
                  <CardDescription className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs px-1.5 h-5">
                      {t(`card.type.${workspace.type}`)}
                    </Badge>
                    <Badge variant={isOwner ? 'default' : 'secondary'} className="text-xs px-1.5 h-5">
                      {t(`card.role.${workspace.role}`)}
                    </Badge>
                    <Badge variant={style.variant} className={`text-xs px-1.5 h-5 ${style.className}`}>
                      {isProvisioning && <IconSettings className="h-3 w-3 mr-0.5 animate-spin" />}
                      {t(`card.status.${workspace.status}`)}
                    </Badge>
                  </CardDescription>
                </div>
              </div>

              {/* 3-dot menu — shrink-0 prevents overflow */}
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {DropdownActions}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Provisioning banner */}
            {isProvisioning && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <IconSettings className="h-4 w-4 animate-spin shrink-0" />
                  <span className="font-medium">{t('card.banners.provisioning.title')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {workspace.provisioningStatus?.message || t('card.banners.provisioning.description')}
                </p>
              </div>
            )}

            {/* Restricted banner */}
            {isRestricted && !isDeleted && !isSuspendedByPlan && !isProvisioning && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <IconLock className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{t('card.banners.restricted.title')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOwner ? t('card.banners.restricted.ownerHint') : t('card.banners.restricted.staffHint')}
                </p>
              </div>
            )}

            {/* Plan limit banner */}
            {isSuspendedByPlan && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <IconLock className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{t('card.banners.planLimit.title')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOwner ? t('card.banners.planLimit.ownerHint') : t('card.banners.planLimit.staffHint')}
                </p>
              </div>
            )}

            {/* Deletion countdown banner */}
            {isDeleted && workspace.deletionInfo && timeRemaining && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <IconClock className="h-4 w-4 shrink-0" />
                  <span className="font-medium">
                    {t('card.banners.deletion.countdown', {
                      days: timeRemaining.days,
                      hours: timeRemaining.hours,
                      minutes: timeRemaining.minutes,
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('card.banners.deletion.scheduledDate', { date: formatDate(workspace.deletionInfo.scheduledFor) })}
                </p>
              </div>
            )}

            {/* Stats */}
            {!isDeleted && !isSuspendedByPlan && !isProvisioning && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1.5 text-sm min-w-0">
                  <IconUsers className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {t('card.members', { count: workspace.member_count || 0 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm min-w-0">
                  <IconUserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium capitalize truncate">{t(`card.role.${workspace.role}`)}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
              <span>{t('card.created')} {formatDate(workspace.createdAt)}</span>
              {workspace.updatedAt !== workspace.createdAt && (
                <span>{t('card.updated')} {formatDate(workspace.updatedAt)}</span>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </TooltipProvider>
  );
}

export default WorkspaceCard;
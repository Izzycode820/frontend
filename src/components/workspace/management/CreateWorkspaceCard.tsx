"use client"

import React, { useState, useRef } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/hooks/authentication/useAuth';
import { useWorkspaceManagement } from '@/hooks/workspace/core/useWorkspaceManagement';
import { useWorkspaceStore } from '@/stores/workspace/core/workspaceManagementStore';
import { useTranslations } from 'next-intl';

// Shadcn/UI Components
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';

import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import type { WorkspaceCreateResponse } from '@/types/workspace/core';

const PROVISIONING_TIMEOUT_MS = 25_000;

export function CreateWorkspaceCard() {
  const t = useTranslations('Workspaces');
  const { isAuthenticated, maxWorkspaces } = useAuth();
  const { workspaceCount } = useWorkspaceManagement();
  const updateWorkspaceStatus = useWorkspaceStore(s => s.updateWorkspaceStatus);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  React.useEffect(() => {
    const timers = timersRef.current;
    return () => { timers.forEach(clearTimeout); };
  }, []);

  const isAtLimit = isAuthenticated && workspaceCount >= maxWorkspaces;

  const handleCreateWorkspace = () => {
    if (!isAuthenticated) return;
    setIsDialogOpen(true);
  };

  const handleWorkspaceCreated = (response: WorkspaceCreateResponse | unknown) => {
    const workspaceId = (response as WorkspaceCreateResponse)?.workspace?.id;
    if (!workspaceId) return;
    const timer = setTimeout(() => {
      updateWorkspaceStatus(workspaceId, 'active');
      timersRef.current.delete(timer);
    }, PROVISIONING_TIMEOUT_MS);
    timersRef.current.add(timer);
  };

  return (
    <>
      <Card
        className={`
          @container/card
          group cursor-pointer
          bg-gradient-to-t from-primary/5 to-card
          shadow-xs transition-all duration-200
          hover:from-primary/10 hover:to-card hover:shadow-md
          relative
          ${isAtLimit ? 'opacity-60 blur-[0.5px] pointer-events-auto' : ''}
        `}
        onClick={handleCreateWorkspace}
      >
        {isAtLimit && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
              {t('createCard.limitBadge', { count: workspaceCount, max: maxWorkspaces })}
            </Badge>
          </div>
        )}

        {/* Desktop */}
        <CardContent className="hidden md:flex flex-col items-center justify-center p-8 h-full min-h-[200px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <IconPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">{t('createCard.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('createCard.subtitle')}</p>
            </div>
          </div>
        </CardContent>

        {/* Mobile */}
        <CardContent className="flex md:hidden items-center gap-4 p-4">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
            <IconPlus className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm">{t('createCard.title')}</h3>
            <p className="text-xs text-muted-foreground truncate">{t('createCard.subtitle')}</p>
          </div>
        </CardContent>
      </Card>

      <CreateWorkspaceDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onWorkspaceCreate={handleWorkspaceCreated}
      />
    </>
  );
}

export default CreateWorkspaceCard;
'use client';

/**
 * Menu Selector List (Smart UI Component)
 * 
 * Responsibilities:
 * - Fetches navigation menus from merchant GraphQL
 * - Shows list of menus with titles and handles
 * - Handles menu selection
 */

import React, { useEffect, useMemo } from 'react';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { adminStoreClient } from '@/services/graphql/clients';
import { GetNavigationsDocument } from '@/services/graphql/admin-store/queries/navigation/__generated__/GetNavigations.generated';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { Label } from '@/components/shadcn-ui/label';
import { AlertCircle, Menu as MenuIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';

interface MenuSelectorListProps {
  selectedHandle?: string;
  onSelect: (handle: string) => void;
  isOpen: boolean;
}

function MenuSelectorListInner({
  selectedHandle,
  onSelect,
  isOpen,
}: MenuSelectorListProps) {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  
  const { data, loading, error, refetch } = useQuery(GetNavigationsDocument, {
    variables: {
      workspaceId: currentWorkspace?.id || ''
    },
    skip: !isOpen || !currentWorkspace?.id,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (isOpen && currentWorkspace?.id) {
      refetch();
    }
  }, [isOpen, refetch, currentWorkspace?.id]);

  const menus = useMemo(() => {
    return (data?.navigations || []).map((nav: any) => ({
      id: nav.id,
      title: nav.title,
      handle: nav.handle,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load menus: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <MenuIcon className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">No menus yet</h3>
        <p className="text-xs text-muted-foreground text-center">
          Create navigation menus in your store dashboard first
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] px-4">
      <RadioGroup value={selectedHandle} onValueChange={onSelect}>
        <div className="space-y-2 py-2">
          {menus.map((menu: any) => (
            <div
              key={menu.id}
              className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onSelect(menu.handle)}
            >
              <RadioGroupItem value={menu.handle} id={menu.id} />
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <MenuIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <Label htmlFor={menu.id} className="flex-1 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{menu.title}</span>
                  <span className="text-xs text-muted-foreground">{menu.handle}</span>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </ScrollArea>
  );
}

export function MenuSelectorList(props: MenuSelectorListProps) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <MenuSelectorListInner {...props} />
    </ApolloProvider>
  );
}

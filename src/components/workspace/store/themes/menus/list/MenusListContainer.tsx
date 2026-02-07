'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Plus } from 'lucide-react';

import { MenusTable } from '@/components/workspace/store/themes/menus/list/MenusTable';
import { MobileMenusList } from '@/components/workspace/store/themes/menus/list/MobileMenusList';
import { useIsMobile } from '@/hooks/shadcn/use-mobile';
// Placeholder imports for generated documents - replace when codegen runs
import { GetNavigationsDocument } from '@/services/graphql/admin-store/queries/navigation/__generated__/GetNavigations.generated';
import { DeleteNavigationDocument } from '@/services/graphql/admin-store/mutations/navigation/__generated__/DeleteNavigation.generated'; 

export default function MenusListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isMobile = useIsMobile();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [deleteNavigation] = useMutation(DeleteNavigationDocument);
  
  const { data, loading, error, refetch } = useQuery(GetNavigationsDocument, {
    variables: {
      workspaceId: currentWorkspace?.id || ''
    },
    skip: !currentWorkspace?.id,
    fetchPolicy: 'cache-and-network'
  });

  const handleAddMenu = () => {
     router.push(`/workspace/${currentWorkspace?.id}/store/themes/navigation/new`);
  };

  const handleEditMenu = (menuId: string) => {
     router.push(`/workspace/${currentWorkspace?.id}/store/themes/navigation/${menuId}`);
  };

  const handleDeleteMenu = async (menuId: string) => {
      if(!confirm('Are you sure you want to delete this menu?')) return;
      
      try {
        await deleteNavigation({ variables: { id: menuId } });
        toast.success('Menu deleted successfully');
        refetch();
      } catch (err: any) {
        toast.error('Failed to delete menu: ' + err.message);
      }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading menus...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Error: {error.message}</div>;

  const menus = (data?.navigations || []).map((nav: any) => ({
      id: nav.id,
      title: nav.title,
      handle: nav.handle,
      itemsCount: nav.items?.length || 0
  }));

  return (
    <div className="space-y-4 px-4 lg:px-6 py-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Menus</h1>
            <p className="text-sm text-muted-foreground">
              Manage your store's navigation menus.
            </p>
          </div>
          <Button onClick={handleAddMenu}>
            <Plus className="mr-2 h-4 w-4" /> Add menu
          </Button>
       </div>

       {menus.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
               <p className="text-muted-foreground">No menus found.</p>
               <Button variant="link" onClick={handleAddMenu}>Create your first menu</Button>
            </CardContent>
          </Card>
       ) : isMobile ? (
          <MobileMenusList
             menus={menus}
             onEdit={handleEditMenu}
             onDelete={handleDeleteMenu}
           />
       ) : (
          <MenusTable
             menus={menus}
             onEdit={handleEditMenu}
             onDelete={handleDeleteMenu}
          />
       )}
    </div>
  );
}

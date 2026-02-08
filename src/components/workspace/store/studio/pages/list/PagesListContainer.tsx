'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Plus, Search } from 'lucide-react';

import { PagesTable, Page } from '@/components/workspace/store/themes/pages/list/PagesTable';
import { MobilePagesList } from '@/components/workspace/store/themes/pages/list/MobilePagesList';
import { useIsMobile } from '@/hooks/shadcn/use-mobile'; 

// Generated Documents
import { GetPagesDocument }  from '@/services/graphql/admin-store/queries/pages/__generated__/GetPages.generated';
import { DeletePageDocument } from '@/services/graphql/admin-store/mutations/pages/__generated__/DeletePage.generated';
import { DomainsDocument } from '@/services/graphql/domains/queries/custom-domains/__generated__/domains.generated';
import { hostinClient } from '@/services/graphql/clients';

export default function PagesListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');

  const [deletePage] = useMutation(DeletePageDocument);
  
  // 1. Fetch Pages with cache-first strategy
  const { data: pagesData, loading: pagesLoading, error: pagesError, refetch } = useQuery(GetPagesDocument, {
    variables: {
      workspaceId: currentWorkspace?.id || ''
    },
    skip: !currentWorkspace?.id,
    fetchPolicy: 'cache-and-network', // Show cached data immediately, then update with fresh data
    nextFetchPolicy: 'cache-first', // Subsequent requests use cache first
  });

  // 2. Fetch Domains (for resolving View URL)
  const { data: domainsData } = useQuery(DomainsDocument, {
    variables: { workspaceId: currentWorkspace?.id || '' },
    skip: !currentWorkspace?.id,
    client: hostinClient, // Must use hosting client for domains query
  });

  // Helper to resolve primary domain
  const getPrimaryDomain = () => {
      const domains = domainsData?.domains || [];
      const defaultDomain = domains.find(d => d?.type === 'default');
      const customPrimary = domains.find(d => d?.type === 'custom' && d?.status === 'connected'); 
      
      return customPrimary?.domain || defaultDomain?.domain || '';
  };


  const handleAddPage = () => {
     router.push(`/workspace/${currentWorkspace?.id}/store/themes/pages/new`);
  };

  const handleEditPage = (pageId: string) => {
     router.push(`/workspace/${currentWorkspace?.id}/store/themes/pages/${pageId}`);
  };

  const handleViewPage = (pageId: string) => {
     // Fix: Access as array directly
     const page = (pagesData?.pages || []).find((p: any) => p?.id === pageId);
     const domain = getPrimaryDomain();

     if (page && domain) {
         // Protocol handling: Localhost vs Production
         const protocol = domain.includes('localhost') ? 'http' : 'https';
         window.open(`${protocol}://${domain}/pages/${page.handle}`, '_blank');
     } else {
         toast.error('Could not resolve storefront URL');
     }
  };

  const handleDeletePage = async (pageId: string) => {
      if(!confirm('Are you sure you want to delete this page?')) return;
      
      try {
        await deletePage({ variables: { id: pageId } });
        toast.success('Page deleted successfully');
        refetch();
      } catch (err: any) {
        toast.error('Failed to delete page: ' + err.message);
      }
  };

  if (pagesLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading pages...</div>;
  }

  if (pagesError) {
       return <div className="p-8 text-center text-destructive">Error loading pages: {pagesError.message}</div>;
  }

  // Transform data
  // Fix: Access as array directly
  const allPages = (pagesData?.pages || []).filter((p: any) => !!p);
  
  const filteredPages = allPages.filter((page: any) => 
      page.title.toLowerCase().includes(search.toLowerCase())
  ).map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      isPublished: p.isPublished, // GraphQL returns camelCase
      updatedAt: p.updatedAt,      // GraphQL returns camelCase
      url: p.url
  }));


  return (
    <div className="space-y-4 px-4 lg:px-6 py-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pages</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage static content for your store.
            </p>
          </div>
          <Button onClick={handleAddPage}>
            <Plus className="mr-2 h-4 w-4" /> Add page
          </Button>
       </div>

       <div className="flex items-center gap-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pages..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
       </div>

       {filteredPages.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
               <p className="text-muted-foreground">No pages found.</p>
            </CardContent>
          </Card>
       ) : isMobile ? (
          <MobilePagesList
             pages={filteredPages}
             onEdit={handleEditPage}
             onView={handleViewPage}
             onDelete={handleDeletePage}
          />
       ) : (
          <PagesTable
             pages={filteredPages}
             onEdit={handleEditPage}
             onView={handleViewPage}
             onDelete={handleDeletePage}
          />
       )}
    </div>
  );
}

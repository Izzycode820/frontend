'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { GetWhatsAppTemplateLibraryDocument } from '@/services/graphql/admin-store/queries/whatsapp/__generated__/GetWhatsAppTemplateLibrary.generated';
import { GetMerchantTemplatesDocument } from '@/services/graphql/admin-store/queries/whatsapp/__generated__/GetMerchantTemplates.generated';
import { GetWhatsAppAccountsDocument } from '@/services/graphql/admin-store/queries/whatsapp/__generated__/GetWhatsAppAccounts.generated';
import { ImportTemplateDocument } from '@/services/graphql/admin-store/mutations/whatsapp/__generated__/ImportTemplate.generated';
import { SyncTemplatesDocument } from '@/services/graphql/admin-store/mutations/whatsapp/__generated__/SyncTemplates.generated';
import { WhatsAppTemplatesLibrary } from './WhatsAppTemplatesLibrary';
import { WhatsAppTemplatesList } from './WhatsAppTemplatesList';
import { WhatsAppTemplatePreviewModal } from './WhatsAppTemplatePreviewModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Search, RefreshCw, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

type TemplateTab = 'explore' | 'draft' | 'pending' | 'approved' | 'rejected';
export function WhatsAppTemplatesContainer() {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const [activeTab, setActiveTab] = useState<TemplateTab>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Queries
  const { data: accountsData } = useQuery(GetWhatsAppAccountsDocument, {
    skip: !currentWorkspace,
    fetchPolicy: 'cache-and-network',
  });

  const whatsappAccounts = accountsData?.marketingWhatsappAccounts?.filter((a): a is NonNullable<typeof a> => !!a) || [];
  const whatsappAccount = whatsappAccounts.find(a => a.isActive) || whatsappAccounts[0];
  const whatsappAccountId = whatsappAccount?.id;

  const { data: libraryData, loading: libraryLoading } = useQuery(GetWhatsAppTemplateLibraryDocument, {
    skip: activeTab !== 'explore' || !currentWorkspace,
    fetchPolicy: 'cache-and-network',
  });

  const { data: merchantData, loading: merchantLoading, refetch: refetchMerchant } = useQuery(GetMerchantTemplatesDocument, {
    variables: { accountId: whatsappAccountId },
    skip: activeTab === 'explore' || !currentWorkspace || !whatsappAccountId,
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [importTemplate, { loading: isMutationLoading }] = useMutation(ImportTemplateDocument, {
    onCompleted: (data) => {
      setImportingId(null);
      if (data.importWhatsappTemplate?.success) {
        toast.success('Template imported successfully');
        refetchMerchant();
      } else {
        toast.error(data.importWhatsappTemplate?.error || 'Failed to import template');
      }
    },
    onError: () => {
      setImportingId(null);
      toast.error('An unexpected error occurred during import');
    }
  });

  const [syncTemplates, { loading: isSyncing }] = useMutation(SyncTemplatesDocument, {
    onCompleted: (data) => {
      if (data.syncWhatsappTemplates?.success) {
        toast.success('Templates synced with Meta');
        refetchMerchant();
      } else {
        toast.error(data.syncWhatsappTemplates?.error || 'Failed to sync templates');
      }
    },
  });

  const handleImport = async (libraryId: string) => {
    if (!whatsappAccountId) {
      toast.error('No active WhatsApp account found to import template into');
      return;
    }
    setImportingId(libraryId);
    await importTemplate({
      variables: { libraryId, accountId: whatsappAccountId },
    });
  };

  const handleSync = async () => {
    if (!whatsappAccountId) {
      toast.error('No active WhatsApp account found to sync');
      return;
    }
    await syncTemplates({
      variables: { accountId: whatsappAccountId },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Section - Simple & Centered */}
      <section className="bg-muted/30 border rounded-xl p-6 flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Quick Guide</h3>
          <p className="text-sm text-muted-foreground">
            Use templates to initiate conversations with your customers on WhatsApp. 
            Import from our library or sync your existing Meta-approved templates.
          </p>
          <div className="flex gap-4 pt-2">
            <Button variant="link" className="p-0 h-auto text-sm">How to create templates</Button>
            <Button variant="link" className="p-0 h-auto text-sm">Formatting guidelines</Button>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleSync} 
          disabled={isSyncing}
          className="w-full sm:w-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Status
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateTab)} className="w-full">
        <div className="flex justify-center border-b mb-6">
          <TabsList className="bg-transparent h-12 p-0 gap-8">
            <TabsTrigger value="explore" className="relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 transition-all">Explore</TabsTrigger>
            <TabsTrigger value="draft" className="relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 transition-all">Draft</TabsTrigger>
            <TabsTrigger value="pending" className="relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 transition-all">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 transition-all">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="relative h-12 rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 transition-all">Rejected</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="explore" className="mt-0 outline-none">
          <WhatsAppTemplatesLibrary 
            templates={libraryData?.marketingWhatsappTemplateLibrary || []} 
            loading={libraryLoading}
            onPreview={setPreviewTemplate}
            onImport={handleImport}
            importingId={importingId}
            searchQuery={searchQuery}
          />
        </TabsContent>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          {activeTab !== 'explore' && (
            <WhatsAppTemplatesList 
              templates={merchantData?.marketingTemplates || []} 
              loading={merchantLoading}
              status={activeTab.toUpperCase()}
              onPreview={setPreviewTemplate}
              searchQuery={searchQuery}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <WhatsAppTemplatePreviewModal 
        template={previewTemplate} 
        isOpen={!!previewTemplate} 
        onClose={() => setPreviewTemplate(null)} 
      />
    </div>
  );
}

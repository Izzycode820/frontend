'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DomainsDocument } from '@/services/graphql/domains/queries/custom-domains/__generated__/domains.generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Globe, Plus, Settings, Info, ArrowLeft } from 'lucide-react';
import { ChangeSubdomainModal } from '../change-subdomain/ChangeSubdomainModal';

export function DomainsListContainer() {
  const params = useParams();
  const t = useTranslations('Domains');
  const router = useRouter();
  const workspaceId = params.workspace_id as string;
  const [showSubdomainModal, setShowSubdomainModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(DomainsDocument, {
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const handleConnectDomain = () => {
    router.push(`/workspace/${workspaceId}/store/settings/domains/connect`);
  };

  const handleBuyDomain = () => {
    router.push(`/workspace/${workspaceId}/store/settings/domains/buy`);
  };

  const handleDomainDetails = (domainId: string) => {
    router.push(`/workspace/${workspaceId}/store/settings/domains/verification/${domainId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t('connected')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('pending')}</Badge>;
      case 'invalid_dns':
        return <Badge variant="destructive">{t('invalidDns')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const domains = data?.domains?.filter(Boolean) || [];
  const defaultDomain = domains.find(d => d?.type === 'default' && d?.domain?.includes('.huzilerz.com'));
  const customDomains = domains.filter(d => d?.type === 'custom');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('verificationFailed')}: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/workspace/${workspaceId}/store/settings`)}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your custom domains and online store address.
        </p>
      </div>

      {/* Info Banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t.rich('infoBanner', {
            link: (chunks) => (
              <a href="#" className="underline">
                {chunks}
              </a>
            ),
          })}
        </AlertDescription>
      </Alert>

      {/* Change Default Subdomain Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{t('changeSubdomainTitle')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t('changeSubdomainDesc')}
            </p>
          </div>
          <div className="hidden sm:block">
            <Globe className="h-16 w-16 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowSubdomainModal(true)}>
            {t('changeSubdomainBtn')}
          </Button>
        </CardContent>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t('onlineStore')}</p>
            </div>
            <div className="text-right">
              <CardTitle>{t('status')}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Domain */}
          {defaultDomain && (
            <div className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{defaultDomain.domain}</p>
                  <Badge variant="outline" className="mt-1">{t('primary')}</Badge>
                </div>
              </div>
              <div>
                {getStatusBadge(defaultDomain.status)}
              </div>
            </div>
          )}

          {/* Custom Domains */}
          {customDomains.map((domain) => (
            <div
              key={domain?.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <button
                    onClick={() => domain?.id && handleDomainDetails(domain.id)}
                    className="font-medium hover:underline text-left"
                  >
                    {domain?.domain}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(domain?.status || '')}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => domain?.id && handleDomainDetails(domain.id)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {customDomains.length === 0 && !defaultDomain && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('noDomains')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleConnectDomain} variant="outline" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('connectExisting')}
        </Button>
        <Button onClick={handleBuyDomain} variant="outline" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('buyNew')}
        </Button>
      </div>

      {/* Change Subdomain Modal */}
      <ChangeSubdomainModal
        open={showSubdomainModal}
        onOpenChange={setShowSubdomainModal}
        workspaceId={workspaceId}
        currentSubdomain={defaultDomain?.domain}
        changesRemaining={defaultDomain?.subdomainChangesRemaining ?? 0}
        changesLimit={defaultDomain?.subdomainChangesLimit ?? 2}
        onSuccess={() => {
          refetch();
          setShowSubdomainModal(false);
        }}
      />
    </div>
  );
}

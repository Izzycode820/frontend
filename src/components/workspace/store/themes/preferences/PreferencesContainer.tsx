'use client';

import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { StorefrontSettingsDocument } from '@/services/graphql/hosting/queries/storefront/__generated__/storefrontSettings.generated';
import { StoreAccessCard } from './StoreAccessCard';
import { SeoSettingsCard } from './SeoSettingsCard';
import { GoogleVerificationCard } from './GoogleVerificationCard';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert } from '@/components/shadcn-ui/alert';

export function PreferencesContainer() {
  const t = useTranslations('Themes');
  const params = useParams();
  const workspaceId = params?.workspace_id as string;

  const { data, loading, error } = useQuery(StorefrontSettingsDocument, {
    variables: { workspaceId },
    skip: !workspaceId,
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <div className="font-semibold">{t('preferences.errorLoading')}</div>
        <div className="text-sm">{error.message}</div>
      </Alert>
    );
  }

  const settings = data?.storefrontSettings;

  if (!settings) {
    return (
      <Alert>
        <div className="text-sm">{t('preferences.noSettings')}</div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <StoreAccessCard
        initialPassword={settings.password}
        assignedDomain={settings.assignedDomain}
        initialEnabled={settings.passwordEnabled}
        initialDescription={settings.passwordDescription}
      />
      <SeoSettingsCard
        initialSeoTitle={settings.seoTitle}
        initialSeoDescription={settings.seoDescription}
        initialSeoKeywords={settings.seoKeywords}
        initialSeoImageUrl={settings.seoImageUrl}
        initialFaviconUrl={settings.faviconUrl}
        assignedDomain={settings.assignedDomain}
      />
      <GoogleVerificationCard
        initialVerificationCode={settings.googleVerificationCode}
        assignedDomain={settings.assignedDomain}
      />
    </div>
  );
}

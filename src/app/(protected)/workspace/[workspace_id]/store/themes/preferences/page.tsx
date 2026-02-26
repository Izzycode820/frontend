'use client';

import { ApolloProvider } from '@apollo/client/react';
import { hostinClient } from '@/services/graphql/clients';
import { PreferencesContainer } from '@/components/workspace/store/themes/preferences/PreferencesContainer';
import { useTranslations } from 'next-intl';

export default function PreferencesPage() {
  const t = useTranslations('Themes');
  return (
    <ApolloProvider client={hostinClient}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('preferences.title')}</h1>
      </div>
      <PreferencesContainer />
    </ApolloProvider>
  );
}

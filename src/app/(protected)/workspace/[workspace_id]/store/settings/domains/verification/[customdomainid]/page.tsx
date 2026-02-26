'use client';

import { ApolloProvider } from '@apollo/client/react';
import { hostinClient } from '@/services/graphql/clients';
import { DNSVerificationContainer } from '@/components/workspace/store/settings/domain/verification/DNSVerificationContainer';

export default function DomainVerificationPage() {
  return (
    <ApolloProvider client={hostinClient}>
      <DNSVerificationContainer />
    </ApolloProvider>
  );
}

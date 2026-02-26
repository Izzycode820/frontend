'use client';
 
import { ApolloProvider } from '@apollo/client/react';
import { hostinClient } from '@/services/graphql/clients';
import { DomainsListContainer } from '@/components/workspace/store/settings/domain/list/DomainsListContainer';
 
export default function DomainsPage() {
  return (
    <ApolloProvider client={hostinClient}>
      <DomainsListContainer />
    </ApolloProvider>
  );
}

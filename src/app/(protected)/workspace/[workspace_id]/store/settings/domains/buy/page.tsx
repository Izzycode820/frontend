'use client';

import { ApolloProvider } from '@apollo/client/react';
import { hostinClient } from '@/services/graphql/clients';
import { BuyDomainSearch } from '@/components/workspace/store/settings/domain/buy/BuyDomainSearch';

export default function BuyDomainPage() {
  return (
    <ApolloProvider client={hostinClient}>
      <BuyDomainSearch />
    </ApolloProvider>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { ApolloProvider } from '@apollo/client/react';
import { hostinClient } from '@/services/graphql/clients';
import { PurchaseConfirmation } from '@/components/workspace/store/settings/domain/buy/PurchaseConfirmation';

export default function PurchaseConfirmationPage() {
  const params = useParams();
  const domain = decodeURIComponent(params.domain as string);

  return (
    <ApolloProvider client={hostinClient}>
      <PurchaseConfirmation domain={domain} />
    </ApolloProvider>
  );
}

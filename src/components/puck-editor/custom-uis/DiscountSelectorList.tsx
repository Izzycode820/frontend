'use client';

/**
 * Discount Selector List (Smart UI Component)
 *
 * Responsibilities:
 * - Fetches discounts from merchant GraphQL
 * - Shows list with loading skeletons
 * - Handles discount selection
 * - Emits selected discount code
 */

import React, { useEffect } from 'react';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { adminStoreClient } from '@/services/graphql/clients';
import { GetDiscountsListDocument } from '@/services/graphql/admin-store/queries/discounts/__generated__/GetDiscountsList.generated';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { Label } from '@/components/shadcn-ui/label';
import { AlertCircle, Ticket } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';

interface DiscountSelectorListProps {
  selectedCode?: string;
  onSelect: (code: string) => void;
  isOpen: boolean;
}

function DiscountSelectorListInner({
  selectedCode,
  onSelect,
  isOpen,
}: DiscountSelectorListProps) {
  const { data, loading, error, refetch } = useQuery(GetDiscountsListDocument, {
    variables: {
      first: 100,
      status: 'ACTIVE' as any, // Only show active discounts
    },
    skip: !isOpen,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const discounts =
    data?.discounts?.edges
      ?.map((edge) => edge?.node)
      .filter(Boolean) || [];

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load discounts: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Ticket className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">No active discounts</h3>
        <p className="text-xs text-muted-foreground text-center">
          Create and activate discounts in your dashboard first
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] px-4">
      <RadioGroup value={selectedCode} onValueChange={onSelect}>
        <div className="space-y-2 py-2">
          {discounts.map((discount: any) => (
            <div
              key={discount.id}
              className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onSelect(discount.code)}
            >
              <RadioGroupItem value={discount.code} id={discount.id} />

              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5 text-primary" />
              </div>

              <Label
                htmlFor={discount.id}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider">{discount.code}</span>
                  <span className="text-xs font-medium text-primary">
                    {discount.discountValueType === 'percentage' ? `${discount.value}% OFF` : `${discount.value} XAF OFF`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {discount.name}
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </ScrollArea>
  );
}

export function DiscountSelectorList(props: DiscountSelectorListProps) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <DiscountSelectorListInner {...props} />
    </ApolloProvider>
  );
}

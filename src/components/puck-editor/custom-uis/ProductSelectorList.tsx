'use client';

import React, { useState, useEffect } from 'react';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { adminStoreClient } from '@/services/graphql/clients';
import { GetProductsPickerDocument } from '@/services/graphql/admin-store/queries/products/__generated__/GetProductsPicker.generated';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { Label } from '@/components/shadcn-ui/label';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { AlertCircle, Package, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';

interface ProductSelectorListProps {
  selectedSlug?: string;
  onSelect: (slug: string) => void;
  isOpen: boolean;
}

function ProductSelectorListInner({
  selectedSlug,
  onSelect,
  isOpen,
}: ProductSelectorListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    GetProductsPickerDocument,
    {
      variables: {
        first: 20,
        search: debouncedSearch,
      },
      skip: !isOpen,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    }
  );

  const products =
    data?.products?.edges?.map((edge) => edge?.node).filter(Boolean) || [];
  const hasNextPage = data?.products?.pageInfo?.hasNextPage;
  const endCursor = data?.products?.pageInfo?.endCursor;

  const handleLoadMore = () => {
    if (hasNextPage && endCursor) {
      fetchMore({
        variables: {
          after: endCursor,
        },
      });
    }
  };

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load products: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 h-[500px]">
        {loading && products.length === 0 ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">No products found</h3>
            <p className="text-xs text-muted-foreground">
              Try a different search term or check your storefront
            </p>
          </div>
        ) : (
          <RadioGroup value={selectedSlug} onValueChange={onSelect}>
            <div className="space-y-2 py-2">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onSelect(product.slug)}
                >
                  <RadioGroupItem value={product.slug} id={product.id} />
                  
                  {product.mediaGallery?.[0]?.thumbnailUrl ? (
                    <img
                      src={product.mediaGallery[0].thumbnailUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover border bg-muted"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  <Label
                    htmlFor={product.id}
                    className="flex-1 cursor-pointer min-w-0"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium truncate leading-tight">
                        {product.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                        {product.slug}
                      </span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {hasNextPage && (
          <div className="py-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs font-medium"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading more...' : 'Load more products'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export function ProductSelectorList(props: ProductSelectorListProps) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <ProductSelectorListInner {...props} />
    </ApolloProvider>
  );
}

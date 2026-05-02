'use client';

/**
 * Category Selector List (Smart UI Component)
 *
 * Responsibilities:
 * - Fetches categories from merchant GraphQL (fresh data on every open)
 * - Shows list with loading skeletons
 * - Handles category selection
 * - Emits selected category slug
 *
 * Design:
 * - List view (not grid)
 * - Shows category name + small thumbnail
 * - Radio button selection
 * - Fresh data on every open (no stale data)
 *
 * IMPORTANT: This component must query the adminStoreClient endpoint
 * But the editor page uses themeClient provider.
 * Solution: Wrap in nested ApolloProvider with adminStoreClient.
 */

import React, { useState, useEffect } from 'react';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { adminStoreClient } from '@/services/graphql/clients';
import { CategoriesDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/categories.generated';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { Label } from '@/components/shadcn-ui/label';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { AlertCircle, Package, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';

interface CategorySelectorListProps {
  selectedSlug?: string;
  onSelect: (slug: string) => void;
  isOpen: boolean; // Controls when to fetch
}

// Internal component that uses the query (inside correct provider)
function CategorySelectorListInner({
  selectedSlug,
  onSelect,
  isOpen,
}: CategorySelectorListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories with fresh data on every open
  const { data, loading, error, fetchMore, refetch } = useQuery(CategoriesDocument, {
    variables: {
      first: 20,
      search: debouncedSearch,
    },
    skip: !isOpen,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  // Transform GraphQL data
  const categories =
    data?.categories?.edges
      ?.map((edge) => ({
        id: edge?.node?.id || '',
        name: edge?.node?.name || '',
        slug: edge?.node?.slug || '',
        description: edge?.node?.description || '',
        isVisible: edge?.node?.isVisible || false,
        productCount: edge?.node?.productCount || 0,
        url: edge?.node?.featuredMedia?.url,
      }))
      .filter(Boolean) || [];

  const hasNextPage = data?.categories?.pageInfo?.hasNextPage;
  const endCursor = data?.categories?.pageInfo?.endCursor;

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
            Failed to load categories: {error.message}
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
            placeholder="Search collections..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 h-[500px]">
        {loading && categories.length === 0 ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">No collections found</h3>
            <p className="text-xs text-muted-foreground">
              Try a different search term or create collections in your store dashboard
            </p>
          </div>
        ) : (
          <RadioGroup value={selectedSlug} onValueChange={onSelect}>
            <div className="space-y-2 py-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onSelect(category.slug)}
                >
                  <RadioGroupItem value={category.slug} id={category.id} />

                  {/* Category Thumbnail */}
                  {category.url ? (
                    <img
                      src={category.url}
                      alt={category.name}
                      className="h-12 w-12 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Category Info */}
                  <Label
                    htmlFor={category.id}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.productCount} products
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                        {category.slug}
                      </span>
                      {!category.isVisible && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded leading-none">
                          Hidden
                        </span>
                      )}
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
              {loading ? 'Loading more...' : 'Load more collections'}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Exported component that wraps with correct Apollo provider
export function CategorySelectorList(props: CategorySelectorListProps) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <CategorySelectorListInner {...props} />
    </ApolloProvider>
  );
}

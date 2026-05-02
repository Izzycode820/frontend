'use client';

/**
 * Blog Selector List (Smart UI Component)
 *
 * Responsibilities:
 * - Fetches blogs from merchant GraphQL (fresh data on every open)
 * - Shows list with loading skeletons
 * - Handles blog selection
 * - Emits selected blog handle
 *
 * IMPORTANT: This component must query the adminStoreClient endpoint
 * But the editor page uses themeClient provider.
 * Solution: Wrap in nested ApolloProvider with adminStoreClient.
 */

import React, { useEffect } from 'react';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { adminStoreClient } from '@/services/graphql/clients';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { Label } from '@/components/shadcn-ui/label';
import { AlertCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';

interface BlogSelectorListProps {
  selectedHandle?: string;
  onSelect: (handle: string) => void;
  isOpen: boolean; // Controls when to fetch
}

// Internal component that uses the query (inside correct provider)
function BlogSelectorListInner({
  selectedHandle,
  onSelect,
  isOpen,
}: BlogSelectorListProps) {
  // Fetch blogs with fresh data on every open
  // This query now correctly uses adminStoreClient from provider
  const { data, loading, error, refetch } = useQuery(GetBlogsDocument, {
    skip: !isOpen, // Only query when sheet is open
    fetchPolicy: 'cache-and-network', // Show cache first, then update from network
    notifyOnNetworkStatusChange: true,
  });

  // Refetch when sheet opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Transform GraphQL data
  const blogs =
    data?.blogs?.edges
      ?.map((edge) => ({
        id: edge?.node?.id || '',
        title: edge?.node?.title || '',
        handle: edge?.node?.handle || '',
        articleCount: edge?.node?.articleCount || 0,
      }))
      .filter(Boolean) || [];

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load blogs: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">No blogs yet</h3>
        <p className="text-xs text-muted-foreground text-center">
          Create blogs in your store dashboard first
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] px-4">
      <RadioGroup value={selectedHandle} onValueChange={onSelect}>
        <div className="space-y-2 py-2">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onSelect(blog.handle)}
            >
              <RadioGroupItem value={blog.handle} id={blog.id} />

              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Blog Info */}
              <Label
                htmlFor={blog.id}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{blog.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {blog.articleCount} articles
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {blog.handle}
                  </span>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </ScrollArea>
  );
}

// Exported component that wraps with correct Apollo provider
export function BlogSelectorList(props: BlogSelectorListProps) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <BlogSelectorListInner {...props} />
    </ApolloProvider>
  );
}

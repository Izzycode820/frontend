'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Label } from '@/components/shadcn-ui/label';
import { Input } from '@/components/shadcn-ui/input';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { ExternalLink, ChevronDown, ChevronUp, Pencil } from 'lucide-react';

import { DomainsDocument } from '@/services/graphql/domains/queries/custom-domains/__generated__/domains.generated';
import { adminStoreClient } from '@/services/graphql/clients';

interface ArticleSEOSectionProps {
  metaTitle: string;
  metaDescription: string;
  handle: string;
  blogHandle: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
}

export function ArticleSEOSection({
  metaTitle,
  metaDescription,
  handle,
  blogHandle,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: ArticleSEOSectionProps) {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: domainsData } = useQuery(DomainsDocument, {
    variables: { workspaceId: currentWorkspace?.id || '' },
    skip: !currentWorkspace?.id,
    client: adminStoreClient,
    fetchPolicy: 'cache-first',
  });

  const getPrimaryDomain = () => {
    const domains = domainsData?.domains || [];
    const customPrimary = domains.find(d => d?.type === 'custom' && d?.status === 'connected');
    const defaultDomain = domains.find(d => d?.type === 'default');
    return customPrimary?.domain || defaultDomain?.domain || 'yourdomain.com';
  };

  const previewUrl = blogHandle && handle
    ? `https://${getPrimaryDomain()}/blogs/${blogHandle}/${handle}`
    : `https://${getPrimaryDomain()}/blogs/blog-name/article-handle`;

  const displayTitle = metaTitle || 'Article title';
  const displayDescription = metaDescription || 'Add a description to see how this might appear in search results';

  return (
    <Card>
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => !isExpanded && setIsExpanded(true)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">Search engine listing</CardTitle>
            {!isExpanded && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span className="font-mono truncate">{previewUrl}</span>
                </div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-400 line-clamp-1">
                  {displayTitle}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {displayDescription}
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="ml-2"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="text-sm text-muted-foreground">
            Add a title and description to see how this blog post might appear in a search engine listing
          </div>

          {/* URL Preview */}
          <div className="rounded-md bg-muted p-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <ExternalLink className="h-3 w-3" />
              <span className="font-mono truncate">{previewUrl}</span>
            </div>
            <div className="text-sm font-medium text-purple-700 dark:text-purple-400">
              {displayTitle}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {displayDescription}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Page title</Label>
            <Input
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder="e.g., Top 10 Tips for..."
              maxLength={70}
            />
            <div className="text-xs text-muted-foreground text-right">
              {metaTitle.length} / 70 characters
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder="A brief description of the article for search engines"
              maxLength={160}
              rows={3}
            />
            <div className="text-xs text-muted-foreground text-right">
              {metaDescription.length} / 160 characters
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

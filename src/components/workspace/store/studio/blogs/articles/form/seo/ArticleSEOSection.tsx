/**
 * ArticleSEOSection Component
 *
 * Features:
 * - Live preview showing search engine listing
 * - Auto-populates from article title and content
 * - Updates in real-time as user types
 * - Character count validation
 * - Shows actual merchant domain URL
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { Edit2 } from 'lucide-react';
import { DomainsDocument } from '@/services/graphql/domains/queries/custom-domains/__generated__/domains.generated';
import { SEO_LIMITS } from './types';
import {
  generateMetaTitle,
  generateMetaDescription,
  getCharacterCount,
  getUrlBreadcrumbs,
  truncateText,
} from './utils';

interface ArticleSEOSectionProps {
  // Auto-populated from main form
  articleTitle: string;
  articleContent: string; // bodyHtml or summaryHtml
  
  // Controlled SEO values
  metaTitle: string;
  metaDescription: string;
  handle: string;
  blogHandle: string;

  // Change handlers
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
}

export function ArticleSEOSection({
  articleTitle,
  articleContent,
  metaTitle,
  metaDescription,
  handle,
  blogHandle,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: ArticleSEOSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  // Fetch merchant's actual domain
  const { data: domainsData } = useQuery(DomainsDocument, {
    variables: { workspaceId: currentWorkspace?.id || '' },
    skip: !currentWorkspace?.id,
  });

  const primaryDomain = domainsData?.domains?.find(d => d?.isPrimary);
  const domainUrl = primaryDomain?.domain || 'mystore.com';

  // Display values (use utility functions for proper truncation/defaults)
  const displayTitle = generateMetaTitle(articleTitle, metaTitle);
  const plainContent = articleContent.replace(/<[^>]*>?/gm, '');
  const displayDescription = generateMetaDescription(plainContent, metaDescription);
  const displaySlug = handle || 'article-handle';

  // Character counts
  const titleCount = getCharacterCount(metaTitle || articleTitle, SEO_LIMITS.TITLE);
  const descCount = getCharacterCount(metaDescription || plainContent, SEO_LIMITS.DESCRIPTION);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Search engine listing</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Preview Card */}
        <div className="border rounded-lg p-4 bg-muted/30 space-y-2 break-words">
          <p className="text-sm text-muted-foreground break-all">{domainUrl}</p>
          <p className="text-xs text-muted-foreground break-all">
            {getUrlBreadcrumbs(blogHandle || 'blog', displaySlug)}
          </p>
          <h3 className="text-blue-600 font-medium text-lg hover:underline cursor-pointer break-words">
            {displayTitle || 'Article Title'}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
            {displayDescription || 'Add a description to see how this article might appear in search engine listings.'}
          </p>
        </div>

        {/* Editable Fields (shown when editing) */}
        {isEditing && (
          <div className="space-y-4 pt-4 border-t">
            {/* Meta Title */}
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta title</Label>
              <Input
                id="meta-title"
                placeholder={articleTitle || "Enter article title first"}
                value={metaTitle}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                maxLength={SEO_LIMITS.TITLE}
              />
              <p className={`text-xs ${titleCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {titleCount.message}
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta description</Label>
              <Textarea
                id="meta-description"
                placeholder={plainContent ? truncateText(plainContent, 150) : "Enter article content to auto-generate description"}
                value={metaDescription}
                onChange={(e) => onMetaDescriptionChange(e.target.value)}
                maxLength={SEO_LIMITS.DESCRIPTION}
                rows={3}
              />
              <p className={`text-xs ${descCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {descCount.message}
              </p>
            </div>

            {/* URL Preview */}
            <div className="space-y-2">
              <Label>URL preview</Label>
              <p className="text-sm text-muted-foreground break-all font-mono bg-muted px-3 py-2 rounded-md">
                https://{domainUrl}/blogs/{blogHandle || 'blog'}/{displaySlug}
              </p>
            </div>
          </div>
        )}

        {/* Info text when not editing */}
        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            Add a title and description to see how this article might appear in a search engine listing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

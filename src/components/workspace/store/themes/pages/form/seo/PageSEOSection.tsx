/**
 * PageSEOSection Component
 *
 * Features:
 * - Collapsed preview showing search engine listing
 * - Auto-populates from page title and content
 * - Expands to show editable fields
 * - Character count validation
 * - Real-time slug generation
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { Edit2 } from 'lucide-react';
import { SEO_LIMITS } from './types';
import {
  generateSlug,
  generateMetaTitle,
  generateMetaDescription,
  getCharacterCount,
  getUrlBreadcrumbs,
  truncateText,
} from './utils';

interface PageSEOSectionProps {
  // Auto-populated from main form
  pageTitle: string;
  pageContent: string; // Used for meta description auto-gen
  
  // Controlled SEO values
  seoTitle: string;
  seoDescription: string;
  handle: string;

  // Change handlers
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onHandleChange: (value: string) => void;
}

export function PageSEOSection({
  pageTitle,
  pageContent,
  seoTitle,
  seoDescription,
  handle,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onHandleChange,
}: PageSEOSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Track if handle has been manually edited
  const [isHandleTouched, setIsHandleTouched] = useState(!!handle);

  // Auto-generate slug from page title when title changes (only if handle hasn't been manually touched)
  useEffect(() => {
    if (pageTitle && !isHandleTouched) {
       const newSlug = generateSlug(pageTitle);
       if (handle !== newSlug) {
         onHandleChange(newSlug);
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageTitle, isHandleTouched]); 

  // Display values (use utility functions for proper truncation/defaults)
  const displayTitle = generateMetaTitle(pageTitle, seoTitle);
  // Strip HTML from content for description generation if needed
  const plainContent = pageContent.replace(/<[^>]*>?/gm, '');
  const displayDescription = generateMetaDescription(plainContent, seoDescription);
  const displaySlug = handle || generateSlug(pageTitle) || 'page-handle';

  // Character counts
  const titleCount = getCharacterCount(seoTitle || pageTitle, SEO_LIMITS.TITLE);
  const descCount = getCharacterCount(seoDescription || plainContent, SEO_LIMITS.DESCRIPTION);

  const handleSlugChange = (value: string) => {
    setIsHandleTouched(true);
    // Auto-format slug as user types
    const formatted = generateSlug(value);
    onHandleChange(formatted);
  };

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
        {/* Preview Card */}
        <div className="border rounded-lg p-4 bg-muted/30 space-y-2 break-words">
          <p className="text-sm text-muted-foreground break-all">My Store</p>
          <p className="text-xs text-muted-foreground break-all">
            {getUrlBreadcrumbs(displaySlug)}
          </p>
          <h3 className="text-blue-600 font-medium text-lg hover:underline cursor-pointer break-words">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
             {displayDescription || 'Add a description to see how this page might appear in search engine listings.'}
          </p>
        </div>

        {/* Editable Fields (shown when editing) */}
        {isEditing && (
          <div className="space-y-4 pt-4 border-t">
            {/* Page Title */}
            <div className="space-y-2">
              <Label htmlFor="seo-title">Page title</Label>
              <Input
                id="seo-title"
                placeholder={pageTitle || "Enter page title first"}
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                maxLength={SEO_LIMITS.TITLE}
              />
              <p className={`text-xs ${titleCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {titleCount.message}
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="seo-description">Meta description</Label>
              <Textarea
                id="seo-description"
                placeholder={plainContent ? truncateText(plainContent, 150) : "Enter page content to auto-generate description"}
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                maxLength={SEO_LIMITS.DESCRIPTION}
                rows={3}
              />
              <p className={`text-xs ${descCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {descCount.message}
              </p>
            </div>

            {/* URL Handle */}
            <div className="space-y-2">
              <Label htmlFor="url-handle">URL handle</Label>
              <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    /pages/
                  </span>
                  <Input
                    id="url-handle"
                    placeholder="page-slug"
                    value={handle}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="rounded-l-none"
                  />
              </div>
              <p className="text-xs text-muted-foreground">
                https://mystore.com/pages/{displaySlug}
              </p>
            </div>
          </div>
        )}

        {/* Info text when not editing */}
        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            Add a title and description to see how this page might appear in a search engine listing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

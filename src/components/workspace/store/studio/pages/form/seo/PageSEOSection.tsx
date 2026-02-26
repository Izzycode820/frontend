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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Studio');
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
          <CardTitle>{t('seo.listing')}</CardTitle>
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
          <p className="text-sm text-muted-foreground break-all">{t('seo.previewStoreName') || 'My Store'}</p>
          <p className="text-xs text-muted-foreground break-all">
            {getUrlBreadcrumbs(displaySlug, t('seo.breadcrumbs.pages'))}
          </p>
          <h3 className="text-blue-600 font-medium text-lg hover:underline cursor-pointer break-words">
            {displayTitle || t('pages.form.titlePlaceholder')}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
             {displayDescription || t('seo.previewFallbackDesc', { type: t('seo.breadcrumbs.pages') })}
          </p>
        </div>

        {/* Editable Fields (shown when editing) */}
        {isEditing && (
          <div className="space-y-4 pt-4 border-t">
            {/* Page Title */}
            <div className="space-y-2">
              <Label htmlFor="seo-title">{t('seo.metaTitle')}</Label>
              <Input
                id="seo-title"
                placeholder={pageTitle || t('seo.placeholderTitle', { type: t('seo.breadcrumbs.pages') })}
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                maxLength={SEO_LIMITS.TITLE}
              />
              <p className={`text-xs ${titleCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                 {t('seo.characterLimit', { count: titleCount.count, limit: SEO_LIMITS.TITLE })}
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="seo-description">{t('seo.metaDescription')}</Label>
              <Textarea
                id="seo-description"
                placeholder={plainContent ? truncateText(plainContent, 150) : t('seo.placeholderDesc', { type: t('seo.breadcrumbs.pages') })}
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                maxLength={SEO_LIMITS.DESCRIPTION}
                rows={3}
              />
              <p className={`text-xs ${descCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                 {t('seo.characterLimit', { count: descCount.count, limit: SEO_LIMITS.DESCRIPTION })}
              </p>
            </div>

            {/* URL Handle */}
            <div className="space-y-2">
              <Label htmlFor="url-handle">{t('seo.urlHandle')}</Label>
              <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    /{t('seo.breadcrumbs.pages')}/
                  </span>
                  <Input
                    id="url-handle"
                    placeholder="page-slug"
                    value={handle}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="rounded-l-none"
                  />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                https://{t('seo.previewStoreName')}/{t('seo.breadcrumbs.pages')}/{displaySlug}
              </p>
            </div>
          </div>
        )}

        {/* Info text when not editing */}
        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            {t('seo.help', { type: t('seo.breadcrumbs.pages') })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

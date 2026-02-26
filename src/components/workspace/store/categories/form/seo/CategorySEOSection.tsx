'use client'

/**
 * CategorySEOSection Component
 *
 * Features:
 * - Collapsed preview showing search engine listing
 * - Auto-populates from category name and description (rich text)
 * - Expands to show editable fields
 * - Character count validation
 * - Real-time slug generation
 * - Strips HTML from rich text description for preview
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Button } from '@/components/shadcn-ui/button'
import { Edit2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SEO_LIMITS } from './types'
import {
  generateSlug,
  generateMetaTitle,
  generateMetaDescription,
  getCharacterCount,
  getUrlBreadcrumbs,
  stripHtmlTags,
} from './utils'

interface CategorySEOSectionProps {
  // Auto-populated from main form
  categoryName: string
  categoryDescription: string // Rich text HTML

  // Controlled SEO values
  metaTitle: string
  metaDescription: string
  slug: string

  // Change handlers
  onMetaTitleChange: (value: string) => void
  onMetaDescriptionChange: (value: string) => void
  onSlugChange: (value: string) => void
}

export function CategorySEOSection({
  categoryName,
  categoryDescription,
  metaTitle,
  metaDescription,
  slug,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSlugChange,
}: CategorySEOSectionProps) {
  const t = useTranslations('Categories.form.seo')
  const [isEditing, setIsEditing] = useState(false)

  // Auto-generate slug from category name when name changes (only if slug is empty)
  useEffect(() => {
    if (categoryName && !slug) {
      onSlugChange(generateSlug(categoryName))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]) // Only when categoryName changes

  // Display values (use utility functions for proper truncation)
  const displayTitle = generateMetaTitle(categoryName, metaTitle)
  const displayDescription = generateMetaDescription(categoryDescription, metaDescription)
  const displaySlug = slug || generateSlug(categoryName) || 'category-slug'

  // Character counts
  const titleCount = getCharacterCount(metaTitle || categoryName, SEO_LIMITS.TITLE)

  // For description, strip HTML if using category description
  const descriptionForCount = metaDescription || stripHtmlTags(categoryDescription)
  const descCount = getCharacterCount(descriptionForCount, SEO_LIMITS.DESCRIPTION)

  const handleSlugChange = (value: string) => {
    // Auto-format slug as user types
    const formatted = generateSlug(value)
    onSlugChange(formatted)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{t('sectionTitle')}</CardTitle>
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
        <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
          <p className="text-sm text-muted-foreground">{t('previewStoreName')}</p>
          <p className="text-xs text-muted-foreground">
            {getUrlBreadcrumbs(displaySlug)}
          </p>
          <h3 className="text-blue-600 font-medium text-lg hover:underline cursor-pointer">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {displayDescription}
          </p>
        </div>

        {/* Editable Fields (shown when editing) */}
        {isEditing && (
          <div className="space-y-4 pt-4 border-t">
            {/* Page Title */}
            <div className="space-y-2">
              <Label htmlFor="meta-title">{t('pageTitleLabel')}</Label>
              <Input
                id="meta-title"
                placeholder={categoryName || t('pageTitlePlaceholder')}
                value={metaTitle}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                maxLength={SEO_LIMITS.TITLE}
              />
              <p className={`text-xs ${titleCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {t('charCount', { count: metaTitle.length || categoryName.length, limit: SEO_LIMITS.TITLE, exceeding: String(titleCount.isExceeding) })}
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta-description">{t('metaDescriptionLabel')}</Label>
              <Textarea
                id="meta-description"
                placeholder={stripHtmlTags(categoryDescription) || t('metaDescriptionPlaceholder')}
                value={metaDescription}
                onChange={(e) => onMetaDescriptionChange(e.target.value)}
                maxLength={SEO_LIMITS.DESCRIPTION}
                rows={3}
              />
              <p className={`text-xs ${descCount.isExceeding ? 'text-destructive' : 'text-muted-foreground'}`}>
                {t('charCount', { count: metaDescription.length || stripHtmlTags(categoryDescription).length, limit: SEO_LIMITS.DESCRIPTION, exceeding: String(descCount.isExceeding) })}
              </p>
            </div>

            {/* URL Handle */}
            <div className="space-y-2">
              <Label htmlFor="url-handle">{t('urlHandleLabel')}</Label>
              <Input
                id="url-handle"
                placeholder={t('urlHandlePlaceholder')}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                https://mystore.com/collections/{displaySlug}
              </p>
            </div>
          </div>
        )}

        {/* Info text when not editing */}
        {!isEditing && (
          <p className="text-xs text-muted-foreground">
            {t('infoText')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

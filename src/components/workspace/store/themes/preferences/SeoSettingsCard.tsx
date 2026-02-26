'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import { useMutation, ApolloProvider } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { UpdateStorefrontSeoDocument } from '@/services/graphql/hosting/mutations/storefront/__generated__/updateStorefrontSEO.generated';
import { FilesAndMediaModal } from '@/components/workspace/store/shared/files-and-media';
import type { MediaSelection } from '@/components/workspace/store/shared/files-and-media';
import { IconInfoCircle, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { adminStoreClient } from '@/services/graphql/clients';

interface SeoSettingsCardProps {
  initialSeoTitle?: string | null;
  initialSeoDescription?: string | null;
  initialSeoKeywords?: string | null;
  initialSeoImageUrl?: string | null;
  initialFaviconUrl?: string | null;
  assignedDomain: string;
}

export function SeoSettingsCard({
  initialSeoTitle,
  initialSeoDescription,
  initialSeoKeywords,
  initialSeoImageUrl,
  initialFaviconUrl,
  assignedDomain
}: SeoSettingsCardProps) {
  const t = useTranslations('Themes');
  const params = useParams();
  const workspaceId = params?.workspace_id as string;

  // Form state
  const [title, setTitle] = useState(initialSeoTitle || '');
  const [description, setDescription] = useState(initialSeoDescription || '');
  const [imageUrl, setImageUrl] = useState(initialSeoImageUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl || '');
  const [hasChanges, setHasChanges] = useState(false);

  // Keywords as array for tag UI
  const [keywords, setKeywords] = useState<string[]>(() => {
    if (!initialSeoKeywords) return [];
    return initialSeoKeywords.split(',').map(k => k.trim()).filter(Boolean);
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Media modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFaviconModal, setShowFaviconModal] = useState(false);

  const [updateSeo, { loading }] = useMutation(UpdateStorefrontSeoDocument);

  const markChanged = () => setHasChanges(true);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    markChanged();
  };

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    markChanged();
  };

  // Handle OG image selection from modal
  const handleImageSelect = (selection: MediaSelection) => {
    const allItems = [...selection.newUploads, ...selection.existingUploads];
    if (allItems.length > 0) {
      setImageUrl(allItems[0].url);
      markChanged();
    }
    setShowImageModal(false);
  };

  // Handle favicon selection from modal  
  const handleFaviconSelect = (selection: MediaSelection) => {
    const allItems = [...selection.newUploads, ...selection.existingUploads];
    if (allItems.length > 0) {
      setFaviconUrl(allItems[0].url);
      markChanged();
    }
    setShowFaviconModal(false);
  };

  // Keywords tag handling
  const addKeyword = useCallback((keyword: string) => {
    const trimmed = keyword.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 10) {
      setKeywords(prev => [...prev, trimmed]);
      markChanged();
    }
    setKeywordInput('');
  }, [keywords]);

  const removeKeyword = useCallback((keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
    markChanged();
  }, []);

  const handleKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(keywordInput);
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  const handleSave = async () => {
    try {
      await updateSeo({
        variables: {
          input: {
            workspaceId,
            seoTitle: title || null,
            seoDescription: description || null,
            seoKeywords: keywords.length > 0 ? keywords.join(', ') : null,
            seoImageUrl: imageUrl || null,
            faviconUrl: faviconUrl || null,
          },
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
    }
  };

  const titleLength = title.length;
  const descriptionLength = description.length;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-base font-semibold">{t('preferences.seo.title')}</h2>
          <IconInfoCircle className="w-4 h-4 text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left Side - Image Upload and Preview */}
          <div className="space-y-4">
            {/* Social Share Image */}
            <div
              className="bg-muted/30 border border-dashed border-border rounded-md h-44 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => setShowImageModal(true)}
            >
              {imageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={imageUrl}
                    alt="Social share preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl('');
                      markChanged();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <IconX className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    {t('preferences.seo.addImage')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('preferences.seo.recommendedSize')}
                  </p>
                </>
              )}
            </div>

            {/* Favicon Upload */}
            <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-md">
              <div
                className="cursor-pointer"
                onClick={() => setShowFaviconModal(true)}
              >
                {faviconUrl ? (
                  <div className="relative group">
                    <img
                      src={faviconUrl}
                      alt="Favicon"
                      className="w-10 h-10 object-contain rounded border bg-white"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFaviconUrl('');
                        markChanged();
                      }}
                      className="absolute -top-1 -right-1 p-0.5 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconX className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-muted rounded border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                    ico
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t('preferences.seo.faviconLabel')}</p>
                <p className="text-xs text-muted-foreground">{t('preferences.seo.faviconRecommended')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFaviconModal(true)}
              >
                {faviconUrl ? t('preferences.seo.change') : t('preferences.seo.upload')}
              </Button>
            </div>

            {/* Preview Card - Subtle gray background */}
            <div className="border border-border rounded-md p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground uppercase mb-1 tracking-wide">
                {assignedDomain || 'yourdomain.huzilerz.com'}
              </p>
              <h3 className="font-semibold text-sm mb-1 text-foreground">
                {title || assignedDomain || 'yourdomain.huzilerz.com'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {description || t('common.myStore')}
              </p>
            </div>
          </div>

          {/* Right Side - Form Fields */}
          <div className="space-y-5">
            {/* Home Page Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">{t('preferences.seo.titleLabel')}</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                maxLength={70}
                placeholder={assignedDomain || ''}
              />
              <p className="text-xs text-muted-foreground">
                {t('preferences.seo.characterLimit', { count: titleLength, limit: 70 })}
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">{t('preferences.seo.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                maxLength={320}
                rows={5}
                placeholder={t('preferences.seo.descriptionPlaceholder')}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {t('preferences.seo.characterLimit', { count: descriptionLength, limit: 320 })}
              </p>
            </div>

            {/* Keywords - Tag Input */}
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm font-medium">
                {t('preferences.seo.keywordsLabel')}
                <span className="text-muted-foreground font-normal ml-1">({t('preferences.seo.optional')})</span>
              </Label>

              <div className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-md"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-destructive transition-colors"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="keywords"
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={() => keywordInput && addKeyword(keywordInput)}
                    placeholder={keywords.length === 0 ? t('preferences.seo.keywordsPlaceholder') : ""}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    disabled={keywords.length >= 10}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t('preferences.seo.keywordsHelp', { count: keywords.length, limit: 10 })}
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? t('preferences.saving') : t('preferences.save')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Media Modal for OG Image */}
      <ApolloProvider client={adminStoreClient}>
        <FilesAndMediaModal
          open={showImageModal}
          onClose={() => setShowImageModal(false)}
          onSelect={handleImageSelect}
          allowedTypes={['image']}
          maxSelection={1}
        />
      </ApolloProvider>

      {/* Media Modal for Favicon */}
      <ApolloProvider client={adminStoreClient}>
        <FilesAndMediaModal
          open={showFaviconModal}
          onClose={() => setShowFaviconModal(false)}
          onSelect={handleFaviconSelect}
          allowedTypes={['image']}
          maxSelection={1}
        />
      </ApolloProvider>
    </div>
  );
}

'use client';

import React from 'react';
import { Badge } from '@/components/shadcn-ui/badge';
import { useTranslations } from 'next-intl';
import { ThemeTemplateTemplateTypeChoices, ThemeTemplatePriceTierChoices } from '@/types/themes/graphql-base';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  name: string;
  slug: string;
  previewImage: string;
  templateType: ThemeTemplateTemplateTypeChoices;
  priceTier: ThemeTemplatePriceTierChoices;
  priceAmount: string | null;
  onClick: () => void;
}

export function ThemeCard({
  name,
  slug,
  previewImage,
  templateType,
  priceTier,
  priceAmount,
  onClick,
}: ThemeCardProps) {
  const t = useTranslations('Theme.list.types');
  const tPrice = useTranslations('Theme.list.priceTiers');
  const tBadge = useTranslations('Theme.list.badge');
  const tDetails = useTranslations('Theme.details.hero');

  const formatPrice = (amount: string | null) => {
    if (!amount || priceTier === ThemeTemplatePriceTierChoices.Free) return tPrice('free');
    return `$${parseFloat(amount).toLocaleString()}`; // Changed to $ to match ref image style for now, user can revert if needed
  };

  const getTemplateTypeLabel = (type: ThemeTemplateTemplateTypeChoices) => {
    const labels = {
      [ThemeTemplateTemplateTypeChoices.Ecommerce]: t('ecommerce'),
      [ThemeTemplateTemplateTypeChoices.Services]: t('services'),
      [ThemeTemplateTemplateTypeChoices.Blog]: t('blog'),
      [ThemeTemplateTemplateTypeChoices.Restaurant]: t('restaurant'),
    };
    return labels[type] || type;
  };

  const isNew = false; // Placeholder for "NEW" badge logic if available in future

  return (
    <div
      className="group cursor-pointer flex flex-col space-y-3"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border/40 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-border/80">
        {previewImage ? (
          <img
            src={previewImage}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/20">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-medium mb-1">{getTemplateTypeLabel(templateType)}</div>
              <div className="text-xs">{tDetails('noPreview')}</div>
            </div>
          </div>
        )}

        {/* Overlay on hover could go here if desired */}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-base text-foreground leading-tight group-hover:underline decoration-2 underline-offset-4">
          {name}
        </h3>

        <div className="flex items-center text-sm text-muted-foreground space-x-2">
          <span className="font-medium text-foreground/90">{formatPrice(priceAmount)}</span>
          {isNew && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal tracking-wide bg-secondary text-secondary-foreground border-0">
              {tBadge('new')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

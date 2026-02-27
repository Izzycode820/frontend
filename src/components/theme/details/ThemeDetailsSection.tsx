'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn-ui/button';

interface ShowcaseSection {
  title: string | null;
  description: string | null;
  image: string | null;
}

interface ThemeDetailsSectionProps {
  name: string;
  description: string;
  author: string;
  priceTier: string;
  priceAmount: number;
  showcaseSections: ShowcaseSection[];
  demoUrl?: string | null;
  onUseTheme: () => void;
}

export function ThemeDetailsSection({
  name,
  description,
  author,
  priceTier,
  priceAmount,
  showcaseSections,
  demoUrl,
  onUseTheme,
}: ThemeDetailsSectionProps) {
  const t = useTranslations('Theme.details');
  const formatPrice = () => {
    if (priceTier === 'free') return t('info.priceFree');
    if (priceTier === 'exclusive') return t('info.priceExclusive');
    return `FCFA ${priceAmount}`;
  };

  return (
    <section className="bg-background border-b">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header Section matching Reference */}
        {/* Layout:
            Row 1: [Name] ........................ [Price]
            Row 2: [Description] ................. [by Author] (Right aligned under price)
        */}
        <div className="flex flex-col gap-6 mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">{name}</h1>
            <div className="flex flex-col items-end gap-2">
              <span className="text-3xl font-bold text-foreground">{formatPrice()}</span>
              {/* Author removed from here, moved to below description to match reference flow better if needed, 
                  but reference had it under 'Free'. Let's keep it here or under. 
                  Reference: "Free" (top right), "by Shopify" (under 'Free').
              */}
              <div className="flex items-center gap-2 text-muted-foreground text-lg">
                <span>{t('info.by')}</span>
                <span className="font-semibold text-foreground underline decoration-1 underline-offset-4">{author}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-8">
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-4xl leading-relaxed">
              {description}
            </p>
            {/* Actions moved here to be prominent but not floating */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2 md:mt-0">
              {demoUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 rounded-full font-semibold text-lg h-12"
                  onClick={() => window.open(demoUrl, '_blank')}
                >
                  {t('actions.viewDemo')}
                </Button>
              )}
              <Button onClick={onUseTheme} size="lg" className="px-8 rounded-full font-semibold text-lg h-12">
                {t('actions.useTheme')}
              </Button>
            </div>
          </div>
        </div>

        {/* Showcase Grid (3 Columns) */}
        {showcaseSections && showcaseSections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {showcaseSections.map((section, index) => (
              <div key={index} className="flex flex-col gap-6 group">
                {section.image && (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted transition-transform duration-300 group-hover:scale-[1.02] shadow-sm">
                    <Image
                      src={section.image}
                      alt={section.title || 'Showcase'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  {section.title && (
                    <h3 className="text-xl font-bold text-foreground leading-tight">{section.title}</h3>
                  )}
                  {section.description && (
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

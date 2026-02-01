'use client';

import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/shadcn-ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface FeatureCategory {
  category: string | null;
  items: (string | null)[] | null;
}

interface ThemeFeaturesSectionProps {
  features: FeatureCategory[];
}

export function ThemeFeaturesSection({ features }: ThemeFeaturesSectionProps) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <section id="features" className="w-full bg-background border-b">
      <div className="w-full px-4 md:px-8 lg:px-12 py-20">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">Features</h2>

          {/* Desktop View: Clean 4-column Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((featureCategory, categoryIndex) => (
              <div key={`desktop-${categoryIndex}`} className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">
                  {featureCategory.category || 'Features'}
                </h3>
                <ul className="space-y-3">
                  {(featureCategory.items || [])
                    .filter((item): item is string => item !== null)
                    .map((item, itemIndex) => (
                      <li key={itemIndex} className="text-muted-foreground text-sm font-medium leading-relaxed flex items-start gap-2.5">
                        {/* High contrast, smaller bullet to match clean aesthetic but kept as requested */}
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0 opacity-80" />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile View: Accordion (Collapsible) */}
          <div className="md:hidden space-y-4">
            {features.map((featureCategory, categoryIndex) => (
              <Collapsible key={`mobile-${categoryIndex}`} className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                  <span className="text-lg font-bold">{featureCategory.category || 'Features'}</span>
                  <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-1 border-t bg-muted/20">
                    <ul className="space-y-3 mt-3">
                      {(featureCategory.items || [])
                        .filter((item): item is string => item !== null)
                        .map((item, itemIndex) => (
                          <li key={itemIndex} className="text-muted-foreground text-sm leading-relaxed flex items-start gap-2.5 pl-1">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0 opacity-80" />
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

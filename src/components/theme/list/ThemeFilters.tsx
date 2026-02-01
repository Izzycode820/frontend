'use client';

import React from 'react';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { Label } from '@/components/shadcn-ui/label';
import { ThemeTemplateTemplateTypeChoices, ThemeTemplatePriceTierChoices } from '@/types/themes/graphql-base';
import { cn } from '@/lib/utils';

interface ThemeFiltersProps {
  selectedTemplateType?: string;
  selectedPriceTier?: string;
  onTemplateTypeChange: (type: string | undefined) => void;
  onPriceTierChange: (tier: string | undefined) => void;
}

export function ThemeFilters({
  selectedTemplateType,
  selectedPriceTier,
  onTemplateTypeChange,
  onPriceTierChange,
}: ThemeFiltersProps) {
  const templateTypes = [
    { value: ThemeTemplateTemplateTypeChoices.Ecommerce, label: 'E-commerce' },
    { value: ThemeTemplateTemplateTypeChoices.Services, label: 'Services' },
    { value: ThemeTemplateTemplateTypeChoices.Blog, label: 'Blog' },
    { value: ThemeTemplateTemplateTypeChoices.Restaurant, label: 'Restaurant' },
  ];

  const priceTiers = [
    { value: ThemeTemplatePriceTierChoices.Free, label: 'Free' },
    { value: ThemeTemplatePriceTierChoices.Paid, label: 'Paid' },
    // { value: ThemeTemplatePriceTierChoices.Exclusive, label: 'Exclusive' }, // Hidden based on ref image usually just showing Free/Paid or specific count
  ];

  return (
    <div className="sticky top-8 space-y-8 pr-4">
      {/* Price Filter */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-foreground/90">Price</h3>
        <div className="space-y-3">
          {priceTiers.map((tier) => (
            <div key={tier.value} className="flex items-center space-x-3 group">
              <Checkbox
                id={`price-${tier.value}`}
                checked={selectedPriceTier === tier.value}
                onCheckedChange={(checked) => {
                  onPriceTierChange(checked ? tier.value : undefined);
                }}
                className="rounded-sm border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`price-${tier.value}`}
                className={cn(
                  "text-base cursor-pointer transition-colors",
                  selectedPriceTier === tier.value
                    ? "font-medium text-foreground"
                    : "text-muted-foreground group-hover:text-foreground/80 font-normal"
                )}
              >
                {tier.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Filter */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-foreground/90">Industry</h3>
        <div className="space-y-3">
          {templateTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-3 group">
              <Checkbox
                id={`industry-${type.value}`}
                checked={selectedTemplateType === type.value}
                onCheckedChange={(checked) => {
                  onTemplateTypeChange(checked ? type.value : undefined);
                }}
                className="rounded-sm border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={`industry-${type.value}`}
                className={cn(
                  "text-base cursor-pointer transition-colors",
                  selectedTemplateType === type.value
                    ? "font-medium text-foreground"
                    : "text-muted-foreground group-hover:text-foreground/80 font-normal"
                )}
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

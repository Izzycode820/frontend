import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Switch } from '@/components/shadcn-ui/switch';
import { Label } from '@/components/shadcn-ui/label';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OptionsForm } from './OptionsForm';
import { VariantsTable } from './VariantsTable';
import type { ProductOption, VariantFormState } from './types';
import { generateVariantCombinations, validateOptionNames } from './utils';

interface ProductVariantsSectionProps {
  hasVariants: boolean;
  options: ProductOption[];
  variants: VariantFormState[];
  basePrice?: number;
  onHasVariantsChange: (hasVariants: boolean) => void;
  onOptionsChange: (options: ProductOption[]) => void;
  onVariantsChange: (variants: VariantFormState[]) => void;
}

export function ProductVariantsSection({
  hasVariants,
  options,
  variants,
  basePrice,
  onHasVariantsChange,
  onOptionsChange,
  onVariantsChange
}: ProductVariantsSectionProps) {
  const t = useTranslations('Products.variants');

  // Find duplicate option names using useMemo for efficient i18n parameter generation
  const duplicateOptions = useMemo(() => {
    const validation = validateOptionNames(options);
    return validation.isValid ? [] : validation.duplicates;
  }, [options]);

  // Auto-generate variants when options change (debounced)
  // Restore original sophisticated merging logic
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if we have valid options with values
      const hasValidOptions = options.some(
        opt => opt.optionName.trim() !== "" && opt.optionValues.some(v => v.trim() !== "")
      );

      if (hasValidOptions) {
        // Helper: Check if ID is from backend vs frontend-generated
        const isBackendId = (id?: string) => {
          if (!id) return false;
          return id.includes('-') && !id.startsWith('variant-');
        };

        // Helper: Recursively check if any variant or its children have data
        const hasDataRecursive = (v: VariantFormState): boolean => {
          const hasOwnData = (
            (v.inventoryQuantity !== undefined && v.inventoryQuantity > 0) ||
            v.mediaItem !== undefined ||
            v.featuredMediaId !== undefined ||
            (v.sku && v.sku !== '') ||
            (v.barcode && v.barcode !== '') ||
            isBackendId(v.id)
          );

          if (hasOwnData) return true;
          if (v.children && v.children.length > 0) {
            return v.children.some(child => hasDataRecursive(child));
          }
          return false;
        };

        const hasExistingVariantData = variants.length > 0 && variants.some(v => hasDataRecursive(v));

        if (hasExistingVariantData) {
          // EDIT MODE: Merge new structure with existing data
          const merged = generateVariantCombinations(options, basePrice);

          const mergeExistingData = (newVariants: VariantFormState[]): VariantFormState[] => {
            const flattenExisting = (vars: VariantFormState[]): VariantFormState[] => {
              const result: VariantFormState[] = [];
              const traverse = (v: VariantFormState) => {
                result.push(v);
                if (v.children && v.children.length > 0) {
                  v.children.forEach(traverse);
                }
              };
              vars.forEach(traverse);
              return result;
            };

            const existingFlat = flattenExisting(variants);

            const findMatch = (option1?: string, option2?: string, option3?: string) => {
              return existingFlat.find(v => {
                const isEmpty = (val?: string | null) => !val;
                if (option1 && option2 && option3) {
                  return v.option1 === option1 && v.option2 === option2 && v.option3 === option3;
                } else if (option1 && option2) {
                  return v.option1 === option1 && v.option2 === option2 && isEmpty(v.option3);
                } else if (option1) {
                  return v.option1 === option1 && isEmpty(v.option2) && isEmpty(v.option3);
                }
                return false;
              });
            };

            const mergeRecursive = (newVars: VariantFormState[]): VariantFormState[] => {
              return newVars.map(newV => {
                const match = findMatch(newV.option1, newV.option2, newV.option3);
                let merged = { ...newV };
                if (match) {
                  merged = {
                    ...newV,
                    id: isBackendId(match.id) ? match.id : newV.id,
                    price: match.price ?? newV.price,
                    costPrice: match.costPrice,
                    compareAtPrice: match.compareAtPrice,
                    inventoryQuantity: match.inventoryQuantity,
                    sku: match.sku,
                    barcode: match.barcode,
                    mediaItem: match.mediaItem,
                    featuredMediaId: match.featuredMediaId,
                    isActive: match.isActive,
                  };
                }
                if (merged.children && merged.children.length > 0) {
                  merged.children = mergeRecursive(merged.children);
                }
                return merged;
              });
            };
            return mergeRecursive(newVariants);
          };

          onVariantsChange(mergeExistingData(merged));
        } else {
          // CREATE MODE: Fresh generation
          onVariantsChange(generateVariantCombinations(options, basePrice));
        }
      } else if (options.length === 0) {
        onVariantsChange([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [options, basePrice]);

  const handleToggleVariants = (enabled: boolean) => {
    onHasVariantsChange(enabled);
    if (enabled && options.length === 0) {
      onOptionsChange([
        {
          optionName: "",
          optionValues: [""]
        }
      ]);
    } else if (!enabled) {
      onOptionsChange([]);
      onVariantsChange([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
        {!hasVariants && (
          <p className="text-xs text-muted-foreground">
            {t('enableVariantsInfo')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="has-variants"
            checked={hasVariants}
            onCheckedChange={handleToggleVariants}
          />
          <Label htmlFor="has-variants">{t('hasVariants')}</Label>
        </div>

        {hasVariants && (
          <div className="space-y-8 pt-4 border-t">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">{t('optionsHeading')}</Label>
              
              {duplicateOptions.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('duplicateOptionsError', { 
                      count: duplicateOptions.length, 
                      names: duplicateOptions.join(', ') 
                    })}
                  </AlertDescription>
                </Alert>
              )}

              <OptionsForm
                options={options}
                setOptions={onOptionsChange}
              />
            </div>

            <div className="space-y-4">
              <VariantsTable
                options={options}
                variants={variants}
                setVariants={onVariantsChange}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

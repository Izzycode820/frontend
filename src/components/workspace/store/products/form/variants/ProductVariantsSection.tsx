/**
 * ProductVariantsSection Component
 * Main entry point for product variants UI
 *
 * Features:
 * - Toggle-based enable/disable (consistent with inventory/shipping)
 * - Add up to 3 options (like Shopify)
 * - Auto-generate variant combinations
 * - Inline editing of variants
 * - Bulk operations
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Switch } from '@/components/shadcn-ui/switch';
import { Label } from '@/components/shadcn-ui/label';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { AlertTriangle } from 'lucide-react';
import { OptionsForm } from './OptionsForm';
import { VariantsTable } from './VariantsTable';
import type { ProductOption, VariantFormState } from './types';
import { generateVariantCombinations, validateOptionNames } from './utils';

interface ProductVariantsSectionProps {
  // Controlled component - parent manages state
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
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate option names for duplicates
  useEffect(() => {
    const validation = validateOptionNames(options);
    if (!validation.isValid) {
      setValidationError(
        `Duplicate option name${validation.duplicates.length > 1 ? 's' : ''}: "${validation.duplicates.join('", "')}". Variants with duplicate options will be deleted if you save.`
      );
    } else {
      setValidationError(null);
    }
  }, [options]);

  // Auto-generate variants when options change (debounced)
  // IMPORTANT: Intelligently merge when options change in EDIT mode
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if we have valid options with values
      const hasValidOptions = options.some(
        opt => opt.optionName.trim() !== "" && opt.optionValues.some(v => v.trim() !== "")
      );

      if (hasValidOptions) {
        // Helper: Check if ID is from backend (UUID) vs frontend-generated (variant-X)
        const isBackendId = (id?: string) => {
          if (!id) return false;
          // Backend IDs are UUIDs (contains multiple hyphens and hex chars)
          // Frontend IDs are like "variant-Red", "variant-Red-Small", etc.
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
            isBackendId(v.id) // Only backend IDs count
          );

          if (hasOwnData) return true;

          // Check children recursively
          if (v.children && v.children.length > 0) {
            return v.children.some(child => hasDataRecursive(child));
          }

          return false;
        };

        // Detect if we have existing variant data
        const hasExistingVariantData = variants.length > 0 && variants.some(v => hasDataRecursive(v));

        if (hasExistingVariantData) {
          // EDIT MODE WITH DATA: Merge new structure with existing data
          // This preserves inventory, images, etc. while adapting to new options
          const merged = generateVariantCombinations(options, basePrice);

          // Smart merge: Copy data from matching variants
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
                // Helper: Check if option value is empty (null or undefined)
                const isEmpty = (val?: string | null) => !val;

                if (option1 && option2 && option3) {
                  // 3-option match: all must match exactly
                  return v.option1 === option1 && v.option2 === option2 && v.option3 === option3;
                } else if (option1 && option2) {
                  // 2-option match: option3 should be empty in existing variant
                  return v.option1 === option1 && v.option2 === option2 && isEmpty(v.option3);
                } else if (option1) {
                  // 1-option match: option2 and option3 should be empty in existing variant
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
                  // Preserve data from matching variant, including backend ID
                  merged = {
                    ...newV,
                    // Keep backend UUID if it exists
                    id: isBackendId(match.id) ? match.id : newV.id,
                    // Copy all user-entered data
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

          const mergedVariants = mergeExistingData(merged);
          onVariantsChange(mergedVariants);
        } else {
          // CREATE MODE: Fresh generation
          const generated = generateVariantCombinations(options, basePrice);
          onVariantsChange(generated);
        }
      } else if (options.length === 0) {
        // Clear variants if no options
        onVariantsChange([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, basePrice]);

  const handleToggleVariants = (enabled: boolean) => {
    onHasVariantsChange(enabled);

    if (enabled && options.length === 0) {
      // Add first empty option when enabling
      onOptionsChange([
        {
          optionName: "",
          optionValues: [""]
        }
      ]);
    } else if (!enabled) {
      // Clear variants when disabling
      onOptionsChange([]);
      onVariantsChange([]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Variants</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="has-variants" className="text-sm font-normal cursor-pointer">
              This product has variants
            </Label>
            <Switch
              id="has-variants"
              checked={hasVariants}
              onCheckedChange={handleToggleVariants}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {hasVariants ? (
          <>
            {/* Options Form */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Options</h3>
              <OptionsForm
                options={options}
                setOptions={onOptionsChange}
              />
            </div>

            {/* Validation Error */}
            {validationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {/* Variants Table - Auto-appears when variants exist */}
            {variants.length > 0 && (
              <div>
                <VariantsTable
                  options={options}
                  variants={variants}
                  setVariants={onVariantsChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 px-3 py-2 rounded-md border">
            <p className="text-xs text-muted-foreground">
              Enable variants if this product comes in multiple options (e.g., size, color, material).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

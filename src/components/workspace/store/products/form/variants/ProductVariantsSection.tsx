/**
 * ProductVariantsSection Component
 * Main entry point for product variants UI
 *
 * Features:
 * - Progressive disclosure (starts with just a button)
 * - Add up to 3 options (like Shopify)
 * - Auto-generate variant combinations
 * - Inline editing of variants
 * - Bulk operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Plus, AlertTriangle } from 'lucide-react';
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
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-show options form if variants exist
  useEffect(() => {
    if (hasVariants && options.length > 0) {
      setShowOptionsForm(true);
    }
  }, [hasVariants, options.length]);

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
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if we have valid options with values
      const hasValidOptions = options.some(
        opt => opt.optionName.trim() !== "" && opt.optionValues.some(v => v.trim() !== "")
      );

      if (hasValidOptions) {
        const generated = generateVariantCombinations(options, basePrice);
        onVariantsChange(generated);
      } else if (options.length === 0) {
        // Clear variants if no options
        onVariantsChange([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, basePrice]);

  const handleStartAddingOptions = () => {
    setShowOptionsForm(true);
    onHasVariantsChange(true);

    // Add first empty option
    if (options.length === 0) {
      onOptionsChange([
        {
          optionName: "",
          optionValues: [""]
        }
      ]);
    }
  };

  const handleRemoveVariants = () => {
    if (confirm('Remove all variants? This will delete all variant data.')) {
      onHasVariantsChange(false);
      onOptionsChange([]);
      onVariantsChange([]);
      setShowOptionsForm(false);
    }
  };

  // Initial state - no variants
  if (!showOptionsForm && !hasVariants) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            Add variants if this product comes in multiple options (e.g., size, color, material)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleStartAddingOptions}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add options like size or color
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Active state - showing options and variants
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Variants</CardTitle>
            <CardDescription>
              Manage product variants and their pricing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveVariants}
            className="text-destructive hover:text-destructive"
          >
            Remove variants
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
}

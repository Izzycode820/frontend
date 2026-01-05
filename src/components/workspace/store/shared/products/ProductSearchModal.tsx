import { useState, useMemo, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { useQuery } from '@apollo/client/react';
import { SearchProductsForOrderDocument } from '@/services/graphql/admin-store/queries/products/__generated__/SearchProductsForOrder.generated';
import type { ProductSearchModalProps, OrderModeProps, CollectionModeProps } from './types';

// Currency formatting utility
function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function ProductSearchModal(props: ProductSearchModalProps) {
  const {
    open,
    onOpenChange,
    selectedProductIds,
    mode = 'order',
  } = props;

  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedProductIds);

  // Sync localSelectedIds with selectedProductIds when modal opens
  useEffect(() => {
    if (open) {
      setLocalSelectedIds(selectedProductIds);
    }
  }, [open, selectedProductIds]);

  // Query products with search - show initial products when modal opens
  const { data, loading } = useQuery(SearchProductsForOrderDocument, {
    variables: {
      search: searchTerm, // Empty string loads all products
      first: 50,
    },
    skip: !open,
  });

  const products = useMemo(() => {
    return (
      data?.products?.edges
        ?.map(edge => edge?.node)
        .filter((node): node is NonNullable<typeof node> => node != null) || []
    );
  }, [data]);

  // Toggle checkbox for any product
  const handleToggleProduct = (productId: string) => {
    setLocalSelectedIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Add selected products
  const handleAddProducts = () => {
    if (mode === 'collection') {
      // Collection mode: pass product IDs only (string[])
      if ('onAddProducts' in props) {
        (props as CollectionModeProps).onAddProducts(localSelectedIds);
      }
    } else {
      // Order mode: pass full product objects (any[])
      const newlySelectedIds = localSelectedIds.filter(id => !selectedProductIds.includes(id));
      const newlySelectedProducts = products.filter(p => newlySelectedIds.includes(p.id));

      if ('onAddProducts' in props) {
        (props as OrderModeProps).onAddProducts(newlySelectedProducts);
      }
    }
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select products</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Products Table */}
        <div className="flex-1 overflow-auto border rounded-md">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="border-b">
                <th className="w-12 p-3"></th>
                <th className="text-left p-3 text-sm font-medium">Product</th>
                {mode === 'order' && (
                  <>
                    <th className="text-right p-3 text-sm font-medium">Available</th>
                    <th className="text-right p-3 text-sm font-medium">Price</th>
                  </>
                )}
                <th className="w-24 text-right p-3 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={mode === 'order' ? 5 : 3} className="text-center p-8 text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'order' ? 5 : 3} className="text-center p-8 text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = localSelectedIds.includes(product.id);
                  const wasAlreadyAdded = selectedProductIds.includes(product.id);

                  return (
                    <tr key={product.id} className="border-b hover:bg-muted/30">
                      {/* Checkbox for all modes */}
                      <td className="p-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleProduct(product.id)}
                        />
                      </td>

                      {/* Product Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-10 h-10 bg-muted rounded overflow-hidden">
                            {product.mediaGallery?.[0]?.thumbnailUrl ? (
                              <img
                                src={product.mediaGallery[0].thumbnailUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            {mode === 'order' && product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Order Mode: Show Available & Price */}
                      {mode === 'order' && (
                        <>
                          <td className="p-3 text-right text-sm">
                            {product.inventoryQuantity}
                          </td>
                          <td className="p-3 text-right text-sm font-medium">
                            FCFA {formatCurrency(product.price)}
                          </td>
                        </>
                      )}

                      {/* Status: Show "Added" if checked */}
                      <td className="p-3 text-right">
                        {isSelected && (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <Check className="h-3 w-3 mr-1" />
                            Added
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {localSelectedIds.length} product{localSelectedIds.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProducts}
              disabled={localSelectedIds.length === 0}
            >
              Add {localSelectedIds.length > 0 ? localSelectedIds.length : ''} product{localSelectedIds.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { ProductSearchModal } from '../../../shared/products/ProductSearchModal';
import { ProductItem } from './ProductItem';
import type { ProductsSectionProps, ProductSearchResult } from './types';

export function ProductsSection({ items, onItemsChange }: ProductsSectionProps) {
  const t = useTranslations('Orders.form');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = (product: ProductSearchResult) => {
    // Check if product already exists
    if (items.some(item => item.product_id === product.id)) {
      return;
    }

    const newItem = {
      product_id: product.id,
      product_name: product.name,
      product_image: product.mediaGallery?.[0]?.thumbnailUrl || null,
      variant_id: null,
      quantity: 1,
      unit_price: product.price.toString(),
      subtotal: product.price.toString(),
    };

    onItemsChange([...items, newItem]);
  };

  const handleAddProducts = (products: ProductSearchResult[]) => {
    // Filter out products that already exist
    const newProducts = products.filter(
      product => !items.some(item => item.product_id === product.id)
    );

    // Create order items from products
    const newItems = newProducts.map(product => ({
      product_id: product.id,
      product_name: product.name,
      product_image: product.mediaGallery?.[0]?.thumbnailUrl || null,
      variant_id: null,
      quantity: 1,
      unit_price: product.price.toString(),
      subtotal: product.price.toString(),
    }));

    onItemsChange([...items, ...newItems]);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const updatedItems = items.map(item =>
      item.product_id === productId
        ? {
            ...item,
            quantity,
            subtotal: (parseFloat(item.unit_price) * quantity).toFixed(2),
          }
        : item
    );
    onItemsChange(updatedItems);
  };

  const handleRemove = (productId: string) => {
    onItemsChange(items.filter(item => item.product_id !== productId));
  };

  const selectedProductIds = items.map(item => item.product_id);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">{t('sections.products')}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('placeholders.searchProducts')}
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  // Only open modal when user starts typing
                  if (value.length > 0) {
                    setIsModalOpen(true);
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              {t('actions.browse')}
            </Button>
            <Button variant="outline">{t('actions.addCustomItem')}</Button>
          </div>

          {/* Products List */}
          {items.length > 0 ? (
            <div className="space-y-1">
              {/* Table Headers */}
              <div className="flex items-center gap-3 pb-2 text-xs font-medium text-muted-foreground">
                <div className="flex-1 min-w-0 pl-[60px]">{t('products.header.product')}</div>
                <div className="w-20 text-center">{t('products.header.quantity')}</div>
                <div className="w-32 text-right">{t('products.header.total')}</div>
                <div className="w-8"></div>
              </div>

              {/* Product Items */}
              {items.map(item => (
                <ProductItem
                  key={item.product_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
              {t('placeholders.noProducts')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Modal */}
      <ProductSearchModal
        mode="order"
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddProducts={handleAddProducts}
        selectedProductIds={selectedProductIds}
      />
    </>
  );
}

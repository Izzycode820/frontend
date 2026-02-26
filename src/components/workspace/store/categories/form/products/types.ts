/**
 * Category Products Section Types
 */

export interface CategoryProductsSectionProps {
  selectedProductIds: string[]
  onProductsChange: (productIds: string[]) => void
  errors?: {
    products?: string
  }
}

export type SortOption = 'best-selling' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc'

export const SORT_OPTIONS: { value: SortOption; label: string; translationKey: string }[] = [
  { value: 'best-selling', label: 'Sort: Best selling', translationKey: 'bestSelling' },
  { value: 'newest', label: 'Sort: Newest', translationKey: 'newest' },
  { value: 'price-asc', label: 'Sort: Price (Low to High)', translationKey: 'priceAsc' },
  { value: 'price-desc', label: 'Sort: Price (High to Low)', translationKey: 'priceDesc' },
  { value: 'name-asc', label: 'Sort: Name (A-Z)', translationKey: 'nameAsc' },
]

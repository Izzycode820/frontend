import type { MediaItem } from '@/components/workspace/store/shared/files-and-media';

/**
 * Assistant Product Form State
 * This matches the structure expected by the backend CreateProduct mutation,
 * while keeping UI-friendly formats for live editing.
 */
export interface AssistantProductFormData {
  // Details
  name: string;
  description: string;
  price: number;
  currency: string;
  brand: string;
  vendor: string | null;
  productType: string;
  categoryId: string | null;
  tags: string[];

  // Media
  mediaItems: MediaItem[];
  
  // Inventory
  trackInventory: boolean;
  inventoryQuantity: number;
  sku: string;
  barcode: string;
  condition: 'new' | 'refurbished' | 'used';
  allowBackorders: boolean;

  // SEO
  metaTitle: string;
  metaDescription: string;
  slug: string;

  // Shipping
  shippingRequired: boolean;
  packageId?: string;
  weight?: number;
  
  // Meta
  status: 'draft' | 'published';
}

export interface AssistantProductFormProps {
  formData: AssistantProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssistantProductFormData>>;
  onSave: () => void;
  onClose: () => void;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string }>;
}

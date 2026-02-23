'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm, type ProductFormData } from '@/components/workspace/store/products/form/ProductForm';
import type { VariantFormState } from '@/components/workspace/store/products/form/variants';
import type { MediaItem } from '@/components/workspace/store/products/form/media';
import { Button } from '@/components/shadcn-ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetProductDocument } from '@/services/graphql/admin-store/queries/products/__generated__/GetProduct.generated';
import { UpdateProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/UpdateProduct.generated';
import { CategoryPickerDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/CategoryPicker.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { flattenVariantsForMutation, reconstructHierarchyFromFlat } from '@/components/workspace/store/products/form/variants/utils';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const productId = params.id as string;
  const [removedImageIds, setRemovedImageIds] = React.useState<string[]>([]);
  const [confirmNavigationFn, setConfirmNavigationFn] = React.useState<
    ((onConfirm: () => void) => void) | null
  >(null);

  // Fetch product data
  const { data, loading: fetchLoading, error: fetchError } = useQuery(GetProductDocument, {
    variables: { id: productId },
    skip: !productId,
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery(CategoryPickerDocument);

  // Extract categories from edges
  const categories =
    categoriesData?.categories?.edges
      ?.map(edge => edge?.node)
      .filter((node): node is NonNullable<typeof node> => node !== null)
    || [];

  // Update product mutation
  const [updateProduct, { loading: updateLoading }] = useMutation(UpdateProductDocument, {
    onCompleted: (data) => {
      if (data.updateProduct?.success && data.updateProduct?.product) {
        toast.success(`${data.updateProduct.product.name} has been updated successfully.`);
        router.push(`/workspace/${currentWorkspace?.id}/store/products`);
      } else {
        toast.error(data.updateProduct?.error || "Failed to update product");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });

  const handleSubmit = async (formData: ProductFormData) => {
    // Flatten hierarchical variants to extract only leaf nodes (actual sellable variants)
    const flattenedVariants = formData.hasVariants ? flattenVariantsForMutation(formData.variants) : [];

    await updateProduct({
      variables: {
        productId: productId,
        updateData: {
          name: formData.name,
          description: formData.description,
          price: formData.price.toString(),
          costPrice: formData.costPrice?.toString(),
          compareAtPrice: formData.compareAtPrice?.toString(),
          chargeTax: formData.chargeTax,
          paymentCharges: formData.paymentCharges,
          chargesAmount: formData.chargesAmount?.toString(),

          // Media (upload-first system)
          featuredMediaId: formData.featuredMediaId,
          mediaIds: formData.mediaGalleryIds,

          // Inventory
          inventory: {
            sku: formData.sku,
            barcode: formData.barcode || '',
            trackInventory: formData.trackInventory,
            inventoryQuantity: formData.onhand,
            condition: formData.condition,
            locationId: formData.locationId,
            allowBackorders: formData.allowBackorders,
          },

          // Shipping
          shipping: {
            requiresShipping: formData.requiresShipping,
            packageId: formData.packageId,
            weight: formData.weight?.toString(),
          },

          // Organization
          organization: {
            productType: formData.productType?.toLowerCase() || 'physical',
            vendor: formData.vendor,
            categoryId: formData.categoryId || undefined,
            tags: JSON.stringify(formData.tags || []),
          },

          // SEO
          seo: {
            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            slug: formData.slug,
          },

          // Variants (if has variants)
          hasVariants: formData.hasVariants,
          options: formData.hasVariants ? formData.options.map(opt => ({
            optionName: opt.optionName,
            optionValues: opt.optionValues,
          })) : undefined,
          variants: formData.hasVariants ? flattenedVariants.map(variant => ({
            option1: variant.option1 || undefined,
            option2: variant.option2 || undefined,
            option3: variant.option3 || undefined,
            price: variant.price?.toString(),
            costPrice: variant.cost_price?.toString(),
            compareAtPrice: variant.compare_at_price?.toString(),
            isActive: variant.is_active ?? true,
            position: variant.position,
            // Variant featured media (upload-first system)
            featuredMediaId: variant.featuredMediaId,
            // Variant inventory
            inventory: {
              sku: variant.sku || '',
              barcode: variant.barcode || '',
              trackInventory: true,
              inventoryQuantity: variant.inventoryQuantity || 0,
              condition: 'new',
            },
          })) : undefined,

          status: formData.status.toLowerCase(),
        },
      },
    });
  };

  const handleRemoveExistingImage = (uploadId: string) => {
    setRemovedImageIds(prev => [...prev, uploadId]);
  };

  const handleSaveDraft = async (formData: ProductFormData) => {
    // Flatten hierarchical variants to extract only leaf nodes (actual sellable variants)
    const flattenedVariants = formData.hasVariants ? flattenVariantsForMutation(formData.variants) : [];

    await updateProduct({
      variables: {
        productId: productId,
        updateData: {
          name: formData.name,
          description: formData.description,
          price: formData.price.toString(),
          costPrice: formData.costPrice?.toString(),
          compareAtPrice: formData.compareAtPrice?.toString(),
          chargeTax: formData.chargeTax,
          paymentCharges: formData.paymentCharges,
          chargesAmount: formData.chargesAmount?.toString(),

          // Media (upload-first system)
          featuredMediaId: formData.featuredMediaId,
          mediaIds: formData.mediaGalleryIds,

          // Inventory
          inventory: {
            sku: formData.sku,
            barcode: formData.barcode || '',
            trackInventory: formData.trackInventory,
            inventoryQuantity: formData.onhand,
            condition: formData.condition,
            locationId: formData.locationId,
            allowBackorders: formData.allowBackorders,
          },

          // Shipping
          shipping: {
            requiresShipping: formData.requiresShipping,
            packageId: formData.packageId,
            weight: formData.weight?.toString(),
          },

          // Organization
          organization: {
            productType: formData.productType?.toLowerCase() || 'physical',
            vendor: formData.vendor,
            categoryId: formData.categoryId || undefined,
            tags: JSON.stringify(formData.tags || []),
          },

          // SEO
          seo: {
            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            slug: formData.slug,
          },

          // Variants (if has variants)
          hasVariants: formData.hasVariants,
          options: formData.hasVariants ? formData.options.map(opt => ({
            optionName: opt.optionName,
            optionValues: opt.optionValues,
          })) : undefined,
          variants: formData.hasVariants ? flattenedVariants.map(variant => ({
            option1: variant.option1 || undefined,
            option2: variant.option2 || undefined,
            option3: variant.option3 || undefined,
            price: variant.price?.toString(),
            costPrice: variant.cost_price?.toString(),
            compareAtPrice: variant.compare_at_price?.toString(),
            isActive: variant.is_active ?? true,
            position: variant.position,
            // Variant featured media (upload-first system)
            featuredMediaId: variant.featuredMediaId,
            // Variant inventory
            inventory: {
              sku: variant.sku || '',
              barcode: variant.barcode || '',
              trackInventory: true,
              inventoryQuantity: variant.inventoryQuantity || 0,
              condition: 'new',
            },
          })) : undefined,

          status: 'draft',
        },
      },
    });
  };

  const handlePreview = () => {
    // Navigate to preview page
    router.push(`/workspace/${currentWorkspace?.id}/store/products/${productId}/preview`);
  };

  const handleDiscard = () => {
    // Navigate back to products list
    router.push(`/workspace/${currentWorkspace?.id}/store/products`);
  };

  const handleBackClick = () => {
    if (confirmNavigationFn) {
      confirmNavigationFn(() => {
        router.push(`/workspace/${currentWorkspace?.id}/store/products`);
      });
    } else {
      router.push(`/workspace/${currentWorkspace?.id}/store/products`);
    }
  };

  // Loading state
  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  // Error state
  if (fetchError || !data?.product) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/workspace/${currentWorkspace?.id}/store/products`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Product Not Found</h1>
            </div>
            <p className="text-destructive">
              {fetchError?.message || "The product you're looking for doesn't exist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const product = data.product;

  // Build mediaItems from featuredMedia + mediaGallery for the form
  const buildMediaItems = (): MediaItem[] => {
    const items: MediaItem[] = [];

    // Add featured media first (becomes first item)
    if (product.featuredMedia) {
      items.push({
        uploadId: product.featuredMedia.id,
        url: product.featuredMedia.url || '',
        type: 'image',
        filename: `product-${product.id}-featured`,
        fileSize: 0, // Not available from API, using placeholder
        width: product.featuredMedia.width || undefined,
        height: product.featuredMedia.height || undefined,
        uploadedAt: product.createdAt,
        mimeType: 'image/jpeg', // Default, not available from API
        status: 'ready',
        thumbnailUrl: product.featuredMedia.thumbnailUrl || undefined,
        optimizedUrl: product.featuredMedia.optimizedUrl || undefined,
      });
    }

    // Add media gallery items (excluding featured if duplicate)
    if (product.mediaGallery) {
      product.mediaGallery.forEach((media, index) => {
        if (media && media.id !== product.featuredMedia?.id) {
          items.push({
            uploadId: media.id,
            url: media.url || '',
            type: 'image',
            filename: `product-${product.id}-gallery-${index}`,
            fileSize: 0,
            width: media.width || undefined,
            height: media.height || undefined,
            uploadedAt: product.createdAt,
            mimeType: 'image/jpeg',
            status: 'ready',
            thumbnailUrl: media.thumbnailUrl || undefined,
            optimizedUrl: media.optimizedUrl || undefined,
          });
        }
      });
    }

    return items;
  };

  // Parse options from JSON (stored as [{ optionName, optionValues }])
  // Self-healing: logic to reconstruct options from variants if missing (prevents auto-deletion)
  const parseOptions = () => {
    let parsedOptions: any[] = [];

    // 1. Try to parse from product.options
    if (product.options) {
      try {
        const parsed = typeof product.options === 'string'
          ? JSON.parse(product.options)
          : product.options;
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedOptions = parsed.map((opt: any) => ({
            optionName: opt.optionName || opt.option_name || '',
            optionValues: opt.optionValues || opt.option_values || [],
          }));
        }
      } catch {
        // Fallback to empty if parse fails
        parsedOptions = [];
      }
    }

    // 2. Self-healing: If options are empty but variants exist, reconstruct them
    if (parsedOptions.length === 0 && product.hasVariants && product.variants && product.variants.length > 0) {
      console.warn('Product has variants but no options. Attempting to reconstruct options from variants.');

      const variants = product.variants.filter((v): v is NonNullable<typeof v> => v !== null);

      // Collect all unique values for up to 3 options
      const option1Values = new Set<string>();
      const option2Values = new Set<string>();
      const option3Values = new Set<string>();

      variants.forEach(v => {
        if (v.option1) option1Values.add(v.option1);
        if (v.option2) option2Values.add(v.option2);
        if (v.option3) option3Values.add(v.option3);
      });

      // Reconstruct Option 1
      if (option1Values.size > 0) {
        parsedOptions.push({
          optionName: "Option 1", // Generic name as we don't know the original (e.g. Size, Color)
          optionValues: Array.from(option1Values)
        });
      }

      // Reconstruct Option 2
      if (option2Values.size > 0) {
        parsedOptions.push({
          optionName: "Option 2",
          optionValues: Array.from(option2Values)
        });
      }

      // Reconstruct Option 3
      if (option3Values.size > 0) {
        parsedOptions.push({
          optionName: "Option 3",
          optionValues: Array.from(option3Values)
        });
      }
    }

    return parsedOptions;
  };

  // Map variants from GraphQL to form state (flat structure)
  // Will be transformed to hierarchical structure by reconstructHierarchyFromFlat
  const mapVariants = (): VariantFormState[] => {
    if (!product.variants || !product.hasVariants) return [];

    return product.variants
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .map(variant => {
        // Get inventory data from first inventory entry (primary location)
        const primaryInventory = variant.inventory?.[0];

        return {
          id: variant.id,
          option1: variant.option1 || undefined,
          option2: variant.option2 || undefined,
          option3: variant.option3 || undefined,
          price: variant.price ? parseFloat(variant.price) : undefined,
          costPrice: variant.costPrice ? parseFloat(variant.costPrice) : undefined,
          compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : undefined,
          sku: variant.sku || '',
          barcode: variant.barcode || undefined,
          isActive: variant.isActive,
          position: variant.position,
          inventoryQuantity: primaryInventory?.quantity || variant.totalStock || 0,
          available: primaryInventory?.available || 0,
          // Map variant media
          featuredMediaId: variant.featuredMedia?.id,
          mediaItem: variant.featuredMedia ? {
            uploadId: variant.featuredMedia.id,
            url: variant.featuredMedia.url || '',
            type: 'image' as const,
            filename: `variant-${variant.id}-featured`,
            fileSize: 0,
            width: variant.featuredMedia.width || undefined,
            height: variant.featuredMedia.height || undefined,
            uploadedAt: product.createdAt,
            mimeType: 'image/jpeg',
            status: 'ready',
            thumbnailUrl: variant.featuredMedia.thumbnailUrl || undefined,
            optimizedUrl: variant.featuredMedia.optimizedUrl || undefined,
          } : undefined,
        };
      });
  };

  // Transform flat variants to hierarchical structure for UI
  const parsedOptions = parseOptions();
  const flatVariants = mapVariants();

  // Only reconstruct hierarchy if we have existing variants (edit mode)
  // This preserves all data (inventory, images, etc.) while building the tree structure
  const hierarchicalVariants = flatVariants.length > 0 && parsedOptions.length > 0
    ? reconstructHierarchyFromFlat(flatVariants, parsedOptions)
    : flatVariants;

  // Map GraphQL product data to form data
  const initialData: Partial<ProductFormData> = {
    name: product.name,
    description: product.description,
    // Media handling - use the new mediaItems format
    mediaItems: buildMediaItems(),
    price: parseFloat(product.price),
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice as string) : undefined,
    costPrice: product.costPrice ? parseFloat(product.costPrice as string) : undefined,
    chargeTax: product.chargeTax,
    paymentCharges: product.paymentCharges,
    chargesAmount: product.chargesAmount ? parseFloat(product.chargesAmount as string) : undefined,
    sku: product.sku,
    barcode: product.barcode,
    trackInventory: product.trackInventory,
    onhand: product.inventoryQuantity,
    available: product.inventoryQuantity, // Use inventoryQuantity as available
    condition: 'new', // Default condition
    allowBackorders: product.allowBackorders,
    requiresShipping: product.requiresShipping,
    packageId: product.package?.id,
    weight: product.weight ? parseFloat(product.weight) : undefined,
    weightUnit: 'kg',
    status: product.status.toLowerCase() as 'draft' | 'published',
    categoryId: product.category?.id || '',
    productType: (product.productType || 'physical').toLowerCase(),  // Normalize to lowercase
    vendor: product.vendor,
    tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || []),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    slug: product.slug,
    // Variants support - use hierarchical structure
    hasVariants: product.hasVariants,
    options: parsedOptions,
    variants: hierarchicalVariants,
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>
          <p className="text-muted-foreground">
            Update {product.name}
          </p>
        </div>

        {/* Main Form */}
        <div className="px-4 lg:px-6">
          <ProductForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            onPreview={handlePreview}
            onDiscard={handleDiscard}
            onUnsavedChangesMount={(fn) => setConfirmNavigationFn(() => fn)}
            isEditing={true}
            isLoading={updateLoading}
            categories={categories}
            onRemoveExistingImage={handleRemoveExistingImage}
          />
        </div>
      </div>
    </div>
  );
}

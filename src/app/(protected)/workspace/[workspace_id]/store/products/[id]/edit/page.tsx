'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm, type ProductFormData } from '@/components/workspace/store/products/form/ProductForm';
import { Button } from '@/components/shadcn-ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetProductDocument } from '@/services/graphql/admin-store/queries/products/__generated__/GetProduct.generated';
import { UpdateProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/UpdateProduct.generated';
import { CategoryPickerDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/CategoryPicker.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { flattenVariantsForMutation } from '@/components/workspace/store/products/form/variants/utils';

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

          // Images
          images: formData.images.length > 0 ? formData.images : undefined,
          removeImageIds: removedImageIds.length > 0 ? removedImageIds : undefined,

          // Inventory
          inventory: {
            sku: formData.sku,
            barcode: formData.barcode || '',
            trackInventory: formData.trackInventory,
            inventoryQuantity: formData.onhand,
            available: formData.available,
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
            productType: formData.productType,
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
            // Variant images (backend expects array)
            images: variant.image ? [variant.image] : undefined,
            // Variant inventory
            inventory: {
              sku: variant.sku || '',
              barcode: variant.barcode || '',
              trackInventory: true,
              inventoryQuantity: variant.inventoryQuantity || 0,
              available: variant.inventoryQuantity || 0,
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

          // Images
          images: formData.images.length > 0 ? formData.images : undefined,
          removeImageIds: removedImageIds.length > 0 ? removedImageIds : undefined,

          // Inventory
          inventory: {
            sku: formData.sku,
            barcode: formData.barcode || '',
            trackInventory: formData.trackInventory,
            inventoryQuantity: formData.onhand,
            available: formData.available,
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
            productType: formData.productType,
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
            // Variant images (backend expects array)
            images: variant.image ? [variant.image] : undefined,
            // Variant inventory
            inventory: {
              sku: variant.sku || '',
              barcode: variant.barcode || '',
              trackInventory: true,
              inventoryQuantity: variant.inventoryQuantity || 0,
              available: variant.inventoryQuantity || 0,
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
    router.push(`/workspace/${workspaceId}/store/products/${productId}/preview`);
  };

  const handleDiscard = () => {
    // Navigate back to products list
    router.push(`/workspace/${workspaceId}/store/products`);
  };

  const handleBackClick = () => {
    if (confirmNavigationFn) {
      confirmNavigationFn(() => {
        router.push(`/workspace/${workspaceId}/store/products`);
      });
    } else {
      router.push(`/workspace/${workspaceId}/store/products`);
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

  // Map GraphQL product data to form data
  const initialData: Partial<ProductFormData> = {
    name: product.name,
    description: product.description,
    images: [],
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
    available: product.available,
    condition: product.condition,
    locationId: product.locationId,
    allowBackorders: product.allowBackorders,
    requiresShipping: product.requiresShipping,
    packageId: product.packageId,
    weight: product.weight ? parseFloat(product.weight) : undefined,
    weightUnit: 'kg',
    length: product.length ? parseFloat(product.length) : undefined,
    width: product.width ? parseFloat(product.width) : undefined,
    height: product.height ? parseFloat(product.height) : undefined,
    dimensionUnit: 'cm',
    status: product.status.toLowerCase() as 'draft' | 'published' | 'archived',
    categoryId: product.category?.id || '',
    productType: product.productType,
    vendor: product.vendor,
    tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || []),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    slug: product.slug,
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
            existingImages={(product.mediaUploads || [])
              .filter((img): img is NonNullable<typeof img> => img !== null)
              .map(img => ({
                id: img.id || '',
                url: img.url || '',
                width: img.width || 0,
                height: img.height || 0,
                thumbnail: img.thumbnail || '',
                thumbnailWebp: img.thumbnailWebp || '',
                optimized: img.optimized || '',
                optimizedWebp: img.optimizedWebp || '',
              }))}
            onRemoveExistingImage={handleRemoveExistingImage}
          />
        </div>
      </div>
    </div>
  );
}

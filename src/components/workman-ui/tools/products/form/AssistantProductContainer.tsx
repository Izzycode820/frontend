'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import { CreateProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/CreateProduct.generated';
import { CategoryPickerDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/CategoryPicker.generated';
import { AssistantProductFormData } from './types';
import { AssistantProductForm } from './AssistantProductForm';
import { AssistantProductMobile } from './AssistantProductMobile';
import { SmartProductData } from '../SmartProductCard';

interface AssistantProductContainerProps {
    initialData: SmartProductData;
    onClose: () => void;
    onSubmitSuccess?: () => void;
}

export function AssistantProductContainer({ 
    initialData, 
    onClose,
    onSubmitSuccess 
}: AssistantProductContainerProps) {
    // 1. Fetch Categories
    const { data: categoriesData } = useQuery(CategoryPickerDocument);
    const categories = categoriesData?.categories?.edges?.map(e => ({
        id: e?.node?.id || '',
        name: e?.node?.name || ''
    })).filter(c => c.id) || [];

    // 2. Initialize State
    const [formData, setFormData] = useState<AssistantProductFormData>(() => ({
        name: initialData.name || '',
        description: initialData.description || '',
        price: parseFloat(initialData.price) || 0,
        currency: initialData.currency || 'XAF',
        brand: initialData.brand || '',
        vendor: '',
        productType: initialData.product_type || 'physical',
        categoryId: null,
        tags: initialData.tags || [],
        mediaItems: [], 
        trackInventory: initialData.track_inventory ?? true,
        inventoryQuantity: initialData.inventory_quantity || 0,
        sku: initialData.sku || '',
        barcode: '',
        condition: 'new',
        allowBackorders: false,
        metaTitle: initialData.meta_title || '',
        metaDescription: initialData.meta_description || '',
        slug: '',
        shippingRequired: initialData.shipping_required ?? true,
        status: (initialData.status as any) || 'draft',
    }));

    const [isMobile, setIsMobile] = useState(false);

    // 2. Responsive Check
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 3. Mutation Setup
    const [createProduct, { loading }] = useMutation(CreateProductDocument, {
        onCompleted: (data) => {
            if (data.createProduct?.success) {
                toast.success(`${data.createProduct.product?.name} created successfully!`);
                onSubmitSuccess?.();
                onClose();
            } else {
                toast.error(data.createProduct?.error || "Failed to create product");
            }
        },
        onError: (error) => {
            toast.error(error.message || "An unexpected error occurred");
        }
    });

    const handleSave = async () => {
        const [firstItem, ...restItems] = formData.mediaItems;

        await createProduct({
            variables: {
                productData: {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price.toString(),
                    featuredMediaId: firstItem?.uploadId,
                    mediaIds: restItems.map(item => item.uploadId),
                    inventory: {
                        sku: formData.sku,
                        barcode: formData.barcode,
                        trackInventory: formData.trackInventory,
                        inventoryQuantity: formData.inventoryQuantity,
                        condition: formData.condition,
                        allowBackorders: formData.allowBackorders,
                    },
                    organization: {
                        productType: formData.productType,
                        vendor: formData.brand || formData.vendor || '',
                        categoryId: formData.categoryId || undefined,
                        tags: JSON.stringify(formData.tags),
                    },
                    seo: {
                        metaTitle: formData.metaTitle,
                        metaDescription: formData.metaDescription,
                        slug: formData.slug,
                    },
                    shipping: {
                        requiresShipping: formData.shippingRequired,
                        packageId: formData.packageId,
                        weight: formData.weight?.toString(),
                    },
                    status: formData.status.toLowerCase() as any,
                }
            }
        });
    };

    const commonProps = {
        formData,
        setFormData,
        onSave: handleSave,
        onClose,
        isLoading: loading,
        categories
    };

    return isMobile ? (
        <AssistantProductMobile {...commonProps} />
    ) : (
        <AssistantProductForm {...commonProps} />
    );
}

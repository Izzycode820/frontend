'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn-ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetDiscountDocument } from '@/services/graphql/admin-store/queries/discounts/__generated__/GetDiscount.generated';
import { UpdateDiscountDocument } from '@/services/graphql/admin-store/mutations/discounts/__generated__/UpdateDiscount.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { AmountOffProductForm, type AmountOffProductFormData } from '@/components/workspace/store/discounts/create/amount-off-product/AmountOffProductForm';
import * as Types from '@/types/workspace/store/graphql-base';

/**
 * Edit Discount Page - Amount Off Product
 * 
 * Fetches existing discount data and pre-fills the form for editing.
 * Uses the same form component as create, with isEditing=true.
 */
export default function EditAmountOffProductDiscountPage() {
    const params = useParams();
    const router = useRouter();
    const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
    const discountId = params.id as string;

    // Fetch discount data
    const { data, loading: fetchLoading, error: fetchError } = useQuery(GetDiscountDocument, {
        variables: { id: discountId },
        skip: !discountId,
    });

    // Update discount mutation
    const [updateDiscount, { loading: updateLoading }] = useMutation(UpdateDiscountDocument, {
        onCompleted: (data) => {
            if (data.updateDiscount?.success && data.updateDiscount?.discount) {
                toast.success(`Discount "${data.updateDiscount.discount.code}" updated successfully`);
                router.push(`/workspace/${currentWorkspace?.id}/store/discounts`);
            } else {
                toast.error(data.updateDiscount?.error || 'Failed to update discount');
            }
        },
        onError: (error) => {
            toast.error(error.message || 'An unexpected error occurred');
        },
    });

    const handleSubmit = async (formData: AmountOffProductFormData) => {
        await updateDiscount({
            variables: {
                discountId: discountId,
                updateData: {
                    code: formData.code,
                    name: formData.name || formData.code,
                    method: formData.method,
                    discountType: Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffProduct,
                    discountValueType: formData.discountValueType,
                    value: formData.value?.toString(),
                    appliesToAllProducts: formData.appliesToAllProducts,
                    productIds: formData.productIds || [],
                    categoryIds: formData.categoryIds || [],
                    startsAt: formData.startsAt,
                    endsAt: formData.endsAt,
                    minimumRequirementType: formData.minimumRequirementType,
                    minimumPurchaseAmount: formData.minimumPurchaseAmount?.toString(),
                    minimumQuantityItems: formData.minimumQuantityItems,
                    usageLimit: formData.limitTotalUses ? formData.usageLimit : undefined,
                    limitOnePerCustomer: formData.limitOnePerCustomer,
                    canCombineWithProductDiscounts: formData.canCombineWithProductDiscounts,
                    canCombineWithOrderDiscounts: formData.canCombineWithOrderDiscounts,
                    appliesToAllCustomers: formData.appliesToAllCustomers,
                },
            },
        });
    };

    const handleDiscard = () => {
        router.push(`/workspace/${currentWorkspace?.id}/store/discounts`);
    };

    const handleBackClick = () => {
        router.push(`/workspace/${currentWorkspace?.id}/store/discounts`);
    };

    // Loading state
    if (fetchLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading discount...</p>
            </div>
        );
    }

    // Error state
    if (fetchError || !data?.discount) {
        return (
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={`/workspace/${currentWorkspace?.id}/store/discounts`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold">Discount Not Found</h1>
                        </div>
                        <p className="text-destructive">
                            {fetchError?.message || "The discount you're looking for doesn't exist."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const discount = data.discount;

    // Check if this is an "Amount Off Product" discount
    if (discount.discountType !== Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffProduct) {
        return (
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href={`/workspace/${currentWorkspace?.id}/store/discounts`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold">Wrong Discount Type</h1>
                        </div>
                        <p className="text-muted-foreground">
                            This page is for editing "Amount Off Product" discounts.
                            The discount "{discount.code}" is a different type.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Map GraphQL discount data to form data
    const initialData: Partial<AmountOffProductFormData> = {
        code: discount.code,
        name: discount.name,
        method: discount.method,
        discountValueType: discount.discountValueType || Types.WorkspaceStoreDiscountDiscountValueTypeChoices.Percentage,
        value: discount.value ? parseFloat(discount.value) : undefined,
        appliesToAllProducts: discount.appliesToAllProducts,
        productIds: Array.isArray(discount.productIds) ? discount.productIds : [],
        categoryIds: Array.isArray(discount.categoryIds) ? discount.categoryIds : [],
        startsAt: discount.startsAt,
        endsAt: discount.endsAt || undefined,
        minimumRequirementType: discount.minimumRequirementType,
        minimumPurchaseAmount: discount.minimumPurchaseAmount ? parseFloat(discount.minimumPurchaseAmount) : undefined,
        minimumQuantityItems: discount.minimumQuantityItems || undefined,
        limitTotalUses: discount.limitTotalUses,
        usageLimit: discount.usageLimit || undefined,
        limitOnePerCustomer: discount.limitOnePerCustomer,
        canCombineWithProductDiscounts: discount.canCombineWithProductDiscounts,
        canCombineWithOrderDiscounts: discount.canCombineWithOrderDiscounts,
        appliesToAllCustomers: discount.appliesToAllCustomers,
    };

    // Populate products and collections for preview
    const initialProducts: any[] = discount.products || [];
    const initialCollections: any[] = discount.collections || [];

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Header */}
                <div className="px-4 lg:px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleBackClick}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Edit discount</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Update "{discount.code}" - Amount off products
                    </p>
                </div>

                {/* Main Form */}
                <div className="px-4 lg:px-6">
                    <AmountOffProductForm
                        initialData={initialData}
                        isEditing={true}
                        initialProducts={initialProducts}
                        initialCollections={initialCollections}
                        onSubmit={handleSubmit}
                        onDiscard={handleDiscard}
                        isLoading={updateLoading}
                    />
                </div>
            </div>
        </div>
    );
}

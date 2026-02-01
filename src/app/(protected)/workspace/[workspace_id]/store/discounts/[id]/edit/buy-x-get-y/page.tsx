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
import { BuyXGetYForm, type BuyXGetYFormData } from '@/components/workspace/store/discounts/create/buy-x-get-y/BuyXGetYForm';
import * as Types from '@/types/workspace/store/graphql-base';

/**
 * Edit Discount Page - Buy X Get Y
 * 
 * Fetches existing discount data and pre-fills the form for editing.
 * Uses the same form component as create, with isEditing=true.
 */
export default function EditBuyXGetYDiscountPage() {
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

    const handleSubmit = async (formData: BuyXGetYFormData) => {
        await updateDiscount({
            variables: {
                discountId: discountId,
                updateData: {
                    code: formData.code,
                    name: formData.name || formData.code,
                    method: formData.method,
                    discountType: Types.WorkspaceStoreDiscountDiscountTypeChoices.BuyXGetY,
                    customerBuysType: formData.customerBuysType,
                    customerBuysQuantity: formData.customerBuysQuantity,
                    customerBuysValue: formData.customerBuysValue?.toString(),
                    customerBuysProductIds: formData.customerBuysProductIds || [],
                    customerGetsQuantity: formData.customerGetsQuantity,
                    customerGetsProductIds: formData.customerGetsProductIds || [],
                    bxgyDiscountType: formData.bxgyDiscountType,
                    bxgyValue: formData.bxgyValue?.toString(),
                    maxUsesPerOrder: formData.maxUsesPerOrder,
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
                    categoryIds: formData.categoryIds || [],
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

    // Check if this is a "Buy X Get Y" discount
    if (discount.discountType !== Types.WorkspaceStoreDiscountDiscountTypeChoices.BuyXGetY) {
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
                            This page is for editing "Buy X Get Y" discounts.
                            The discount "{discount.code}" is a different type.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Map GraphQL discount data to form data
    const initialData: Partial<BuyXGetYFormData> = {
        code: discount.code,
        name: discount.name,
        method: discount.method,
        customerBuysType: discount.customerBuysType || Types.WorkspaceStoreDiscountCustomerBuysTypeChoices.MinimumQuantity,
        customerBuysQuantity: discount.customerBuysQuantity || undefined,
        customerBuysValue: discount.customerBuysValue ? parseFloat(discount.customerBuysValue) : undefined,
        customerBuysProductIds: Array.isArray(discount.customerBuysProductIds) ? discount.customerBuysProductIds : [],
        customerGetsQuantity: discount.customerGetsQuantity || undefined,
        customerGetsProductIds: Array.isArray(discount.customerGetsProductIds) ? discount.customerGetsProductIds : [],
        bxgyDiscountType: discount.bxgyDiscountType || Types.WorkspaceStoreDiscountBxgyDiscountTypeChoices.Percentage,
        bxgyValue: discount.bxgyValue ? parseFloat(discount.bxgyValue) : undefined,
        maxUsesPerOrder: discount.maxUsesPerOrder || undefined,
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
        categoryIds: Array.isArray(discount.categoryIds) ? discount.categoryIds : [],
    };

    // Populate products for preview
    const initialBuysProducts: any[] = discount.customerBuysProducts || [];
    // Note: Collections for Buys are mapped to categoryIds in backend, so we use categories resolver
    const initialBuysCollections: any[] = discount.collections || [];

    const initialGetsProducts: any[] = discount.customerGetsProducts || [];
    // Note: Backend currently doesn't support "Gets Collections" separate from Buys/General.
    // If usage requires it, model schema update is needed. For now empty.
    const initialGetsCollections: any[] = [];

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
                        Update "{discount.code}" - Buy X get Y
                    </p>
                </div>

                {/* Main Form */}
                <div className="px-4 lg:px-6">
                    <BuyXGetYForm
                        initialData={initialData}
                        isEditing={true}
                        initialBuysProducts={initialBuysProducts}
                        initialBuysCollections={initialBuysCollections}
                        initialGetsProducts={initialGetsProducts}
                        initialGetsCollections={initialGetsCollections}
                        onSubmit={handleSubmit}
                        onDiscard={handleDiscard}
                        isLoading={updateLoading}
                    />
                </div>
            </div>
        </div>
    );
}

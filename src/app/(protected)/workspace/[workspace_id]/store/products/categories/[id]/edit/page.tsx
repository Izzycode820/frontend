'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CategoryForm, type CategoryFormData } from '@/components/workspace/store/categories/form/CategoryForm';
import { Button } from '@/components/shadcn-ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client/react';
import { CategoryDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/category.generated';
import { UpdateCategoryDocument } from '@/services/graphql/admin-store/mutations/categories/__generated__/updateCategory.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const categoryId = params.id as string;

  // Fetch category data
  const { data, loading: fetchLoading, error: fetchError } = useQuery(CategoryDocument, {
    variables: { id: categoryId },
    skip: !categoryId,
  });

  // Update category mutation
  const [updateCategory, { loading: updateLoading }] = useMutation(UpdateCategoryDocument, {
    onCompleted: (data) => {
      if (data.updateCategory?.success && data.updateCategory?.category) {
        toast.success(`${data.updateCategory.category.name} has been updated successfully.`);
        router.push(`/workspace/${currentWorkspace?.id}/store/categories`);
      } else {
        toast.error(data.updateCategory?.error || "Failed to update category");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred");
    },
  });

  const handleSubmit = async (formData: CategoryFormData) => {
    await updateCategory({
      variables: {
        id: categoryId,
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image,
        isVisible: formData.isVisible,
        isFeatured: formData.isFeatured,
        sortOrder: formData.sortOrder,
      },
    });
  };

  const handleSaveDraft = async (formData: CategoryFormData) => {
    await updateCategory({
      variables: {
        id: categoryId,
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image,
        isVisible: false,
        isFeatured: formData.isFeatured,
        sortOrder: formData.sortOrder,
      },
    });
  };

  const handlePreview = () => {
    toast.info("Category preview coming soon!");
  };

  const handleRemoveExistingImage = () => {
    // Handle image removal in update
    updateCategory({
      variables: {
        id: categoryId,
        removeImage: true,
      },
    });
  };

  // Loading state
  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading category...</p>
      </div>
    );
  }

  // Error state
  if (fetchError || !data?.category) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/workspace/${currentWorkspace?.id}/store/categories`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Category Not Found</h1>
            </div>
            <p className="text-destructive">
              {fetchError?.message || "The category you're looking for doesn't exist."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const category = data.category;

  // Map GraphQL category data to form data
  const initialData: Partial<CategoryFormData> = {
    name: category.name,
    description: category.description || '',
    image: undefined, // Will be handled via existingImage prop
    isVisible: category.isVisible,
    isFeatured: category.isFeatured,
    sortOrder: category.sortOrder || 0,
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/workspace/${currentWorkspace?.id}/store/categories`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Category</h1>
          </div>
          <p className="text-muted-foreground">
            Update {category.name}
          </p>
        </div>

        {/* Main Form */}
        <div className="px-4 lg:px-6">
          <CategoryForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            onPreview={handlePreview}
            isEditing={true}
            isLoading={updateLoading}
            existingImage={category.categoryImage ? {
              id: category.categoryImage.id || '',
              url: category.categoryImage.url || '',
              width: category.categoryImage.width || 0,
              height: category.categoryImage.height || 0,
            } : undefined}
            onRemoveExistingImage={handleRemoveExistingImage}
          />
        </div>
      </div>
    </div>
  );
}
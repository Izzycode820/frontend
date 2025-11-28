'use client';

/**
 * Categories List Container (Smart Component)
 *
 * Industry Standard Pattern:
 * - Container handles data fetching (GraphQL)
 * - Presentational components handle UI (card grid)
 * - Clean separation of concerns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoriesGrid } from './CategoriesGrid';
import { CategoriesToolbar } from './CategoriesToolbar';
import { CategoriesFilters } from './CategoriesFilters';
import { CategoriesEmptyState } from './CategoriesEmptyState';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { useQuery, useMutation } from '@apollo/client/react';
import { CategoriesDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/categories.generated';
import { DeleteCategoryDocument } from '@/services/graphql/admin-store/mutations/categories/__generated__/deleteCategory.generated';
import { ToggleCategoryVisibilityDocument } from '@/services/graphql/admin-store/mutations/categories/__generated__/toggleCategoryVisibility.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';

export default function CategoriesListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string | undefined>();
  const [featuredFilter, setFeaturedFilter] = useState<string | undefined>();

  // Mutations
  const [deleteCategory] = useMutation(DeleteCategoryDocument);
  const [toggleCategoryVisibility] = useMutation(ToggleCategoryVisibilityDocument);

  // Debug: Log workspace context
  console.log('[CategoriesListContainer] Workspace context:', {
    hasWorkspace: !!currentWorkspace,
    workspaceId: currentWorkspace?.id || '(none)',
    workspaceName: currentWorkspace?.name || '(none)',
  });

  // Fetch categories with GraphQL (skip until workspace is loaded)
  const { data, loading, error, fetchMore, refetch } = useQuery(CategoriesDocument, {
    variables: {
      first: 20,
      search: search || undefined,
      isVisible: visibilityFilter ? visibilityFilter === 'visible' : undefined,
      isFeatured: featuredFilter ? featuredFilter === 'featured' : undefined,
    },
    skip: !currentWorkspace, // Don't query until workspace context is available
  });

  // Debug: Log query state
  console.log('[CategoriesListContainer] Query state:', {
    loading,
    hasData: !!data,
    hasError: !!error,
    isSkipped: !currentWorkspace,
  });

  // Transform GraphQL data to component format
  const categories = data?.categories?.edges?.map(edge => ({
    id: edge?.node?.id || '',
    name: edge?.node?.name || '',
    description: edge?.node?.description || '',
    slug: edge?.node?.slug || '',
    isVisible: edge?.node?.isVisible || false,
    isFeatured: edge?.node?.isFeatured || false,
    sortOrder: edge?.node?.sortOrder || 0,
    productCount: edge?.node?.productCount || 0,
    image: edge?.node?.categoryImage ? {
      id: edge.node.categoryImage.id,
      thumbnail: edge.node.categoryImage.thumbnail,
      thumbnailWebp: edge.node.categoryImage.thumbnailWebp,
      width: edge.node.categoryImage.width,
      height: edge.node.categoryImage.height,
    } : undefined,
    createdAt: edge?.node?.createdAt || '',
    updatedAt: edge?.node?.updatedAt || '',
  })).filter(Boolean) || [];

  const hasNextPage = data?.categories?.pageInfo?.hasNextPage || false;

  // Handlers
  const handleAddCategory = () => {
    router.push(`/workspace/${currentWorkspace?.id}/store/products/categories/add`);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/workspace/${currentWorkspace?.id}/store/products/categories/${categoryId}/edit`);
  };

  const handleViewCategory = (categoryId: string) => {
    // Navigate to category detail page (create this later)
    router.push(`/workspace/${currentWorkspace?.id}/store/products/categories/${categoryId}`);
  };

  const handleToggleVisibility = async (categoryId: string) => {
    try {
      const { data: toggleData } = await toggleCategoryVisibility({
        variables: { id: categoryId },
      });

      if (toggleData?.toggleCategoryVisibility?.success) {
        const newVisibility = toggleData.toggleCategoryVisibility.isVisible;
        toast.success(`Category ${newVisibility ? 'published' : 'hidden'}`);
        refetch(); // Refresh the list
      } else {
        toast.error(toggleData?.toggleCategoryVisibility?.error || 'Failed to toggle visibility');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle visibility');
      console.error('Toggle visibility error:', err);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { data: deleteData } = await deleteCategory({
        variables: {
          id: categoryId,
        },
      });

      if (deleteData?.deleteCategory?.success) {
        toast.success('Category deleted successfully');
        refetch(); // Refresh the list
      } else {
        toast.error(deleteData?.deleteCategory?.error || 'Failed to delete category');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
      console.error('Delete category error:', err);
    }
  };

  const handleBulkAction = (action: 'archive' | 'delete' | 'export') => {
    // TODO: Implement bulk actions with GraphQL mutations
    toast.info(`Bulk ${action} ${selectedCategories.length} categories - Coming soon!`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && data?.categories?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          after: data.categories.pageInfo.endCursor,
        },
      });
    }
  };

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load categories</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!loading && categories.length === 0 && !search && !visibilityFilter && !featuredFilter) {
    return (
      <div className="px-4 lg:px-6">
        <CategoriesEmptyState onAddCategory={handleAddCategory} />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize your products into categories ({data?.categories?.totalCount || 0} total)
        </p>
      </div>

      {/* Filters */}
      <CategoriesFilters
        searchValue={search}
        onSearchChange={setSearch}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
        featuredFilter={featuredFilter}
        onFeaturedFilterChange={setFeaturedFilter}
      />

      {/* Toolbar (Bulk Actions) */}
      <CategoriesToolbar
        selectedCount={selectedCategories.length}
        onBulkAction={handleBulkAction}
        onAddCategory={handleAddCategory}
      />

      {/* Categories Grid */}
      {loading && categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CategoriesGrid
          categories={categories}
          onEdit={handleEditCategory}
          onView={handleViewCategory}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more categories'}
          </button>
        </div>
      )}
    </div>
  );
}
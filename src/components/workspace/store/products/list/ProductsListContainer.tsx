'use client';

/**
 * Products List Container (Smart Component)
 *
 * Industry Standard Pattern:
 * - Container handles data fetching (GraphQL)
 * - Presentational components handle UI (list/ folder)
 * - Clean separation of concerns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductsTable } from './ProductsTable';
import { ProductsToolbar } from './ProductsToolbar';
import { ProductsFilters } from './ProductsFilters';
import { ProductsEmptyState } from './ProductsEmptyState';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetProductsListDocument } from '@/services/graphql/admin-store/queries/products/__generated__/GetProductsList.generated';
import { DeleteProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/DeleteProduct.generated';
import { DuplicateProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/DuplicateProduct.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';

export default function ProductsListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Mutations
  const [deleteProduct] = useMutation(DeleteProductDocument);
  const [duplicateProduct] = useMutation(DuplicateProductDocument);

  // Debug: Log workspace context
  console.log('[ProductsListContainer] Workspace context:', {
    hasWorkspace: !!currentWorkspace,
    workspaceId: currentWorkspace?.id || '(none)',
    workspaceName: currentWorkspace?.name || '(none)',
  });

  // Fetch products with GraphQL (skip until workspace is loaded)
  const { data, loading, error, fetchMore, refetch } = useQuery(GetProductsListDocument, {
    variables: {
      first: 20,
      search: search || undefined,
      status: statusFilter,
    },
    skip: !currentWorkspace, // Don't query until workspace context is available
  });

  // Debug: Log query state
  console.log('[ProductsListContainer] Query state:', {
    loading,
    hasData: !!data,
    hasError: !!error,
    isSkipped: !currentWorkspace,
  });

  // Transform GraphQL data to component format
  const products = data?.products?.edges?.map(edge => {
    const firstMedia = edge?.node?.mediaGallery?.[0];
    return {
      id: edge?.node?.id || '',
      name: edge?.node?.name || '',
      status: edge?.node?.status?.toLowerCase() as 'published' | 'archived',
      price: parseFloat(edge?.node?.price || '0'),
      inventory: edge?.node?.inventoryQuantity || 0,
      category: edge?.node?.category?.name || '',
      type: edge?.node?.productType || '',
      vendor: edge?.node?.vendor || '',
      featuredMedia: firstMedia ? {
        thumbnailUrl: firstMedia.thumbnailUrl || undefined,
        url: firstMedia.url || undefined,
      } : undefined,
    };
  }).filter(Boolean) || [];

  const hasNextPage = data?.products?.pageInfo?.hasNextPage || false;

  // Handlers
  const handleAddProduct = () => {
    router.push(`/workspace/${currentWorkspace?.id}/store/products/add`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/workspace/${currentWorkspace?.id}/store/products/${productId}/edit`);
  };

  const handleViewProduct = (productId: string) => {
    // Navigate to product preview page
    router.push(`/workspace/${currentWorkspace?.id}/store/products/${productId}/preview`);
  };

  const handleDuplicateProduct = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      const newName = product ? `${product.name} (Copy)` : 'Product Copy';

      const { data: duplicateData } = await duplicateProduct({
        variables: {
          productId,
          newName,
          copyVariants: true,
          copyInventory: false,
        },
      });

      if (duplicateData?.duplicateProduct?.success) {
        toast.success(`Product duplicated: ${newName}`);
        refetch(); // Refresh the list
      } else {
        toast.error(duplicateData?.duplicateProduct?.error || 'Failed to duplicate product');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate product');
      console.error('Duplicate product error:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { data: deleteData } = await deleteProduct({
        variables: { productId },
      });

      if (deleteData?.deleteProduct?.success) {
        toast.success('Product deleted successfully');
        refetch(); // Refresh the list
      } else {
        toast.error(deleteData?.deleteProduct?.error || 'Failed to delete product');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
      console.error('Delete product error:', err);
    }
  };

  const handleBulkAction = (action: 'archive' | 'delete' | 'export') => {
    // TODO: Implement bulk actions with GraphQL mutations
    toast.info(`Bulk ${action} ${selectedProducts.length} products - Coming soon!`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && data?.products?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          after: data.products.pageInfo.endCursor,
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
              <p>Failed to load products</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0 && !search && !statusFilter) {
    return (
      <div className="px-4 lg:px-6">
        <ProductsEmptyState onAddProduct={handleAddProduct} />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage your store products ({data?.products?.totalCount || 0} total)
        </p>
      </div>

      {/* Filters */}
      <ProductsFilters
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Toolbar (Bulk Actions) */}
      <ProductsToolbar
        selectedCount={selectedProducts.length}
        selectedProductIds={selectedProducts}
        onBulkAction={handleBulkAction}
        onAddProduct={handleAddProduct}
        onCategoryUpdate={refetch}
      />

      {/* Products Table */}
      {loading && products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ProductsTable
          products={products}
          onProductSelect={setSelectedProducts}
          onEdit={handleEditProduct}
          onView={handleViewProduct}
          onDuplicate={handleDuplicateProduct}
          onDelete={handleDeleteProduct}
          onCategoryUpdate={refetch}
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
            {loading ? 'Loading...' : 'Load more products'}
          </button>
        </div>
      )}
    </div>
  );
}

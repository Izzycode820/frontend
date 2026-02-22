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
import { DuplicateProductModal } from './DuplicateProductModal';
import { MobileProductsList } from './mobile';
import { useIsMobile } from '@/hooks/shadcn/use-mobile';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/shadcn-ui/pagination';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GetProductsListDocument,
  GetProductsListQuery,
  GetProductsListQueryVariables
} from '@/services/graphql/admin-store/queries/products/__generated__/GetProductsList.generated';
import { CategoryPickerDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/CategoryPicker.generated';
import { WorkspaceStoreProductStatusChoices } from '@/types/workspace/store/graphql-base';
import { DeleteProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/DeleteProduct.generated';
import { DuplicateProductDocument } from '@/services/graphql/admin-store/mutations/products/__generated__/DuplicateProduct.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';

export default function ProductsListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isMobile = useIsMobile();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  // const [typeFilter, setTypeFilter] = useState<string | undefined>(); // Helper: Type filter not supported by backend yet

  // Pagination state
  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<{ [page: number]: string }>({});

  // Duplicate modal state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [productToDuplicate, setProductToDuplicate] = useState<{ id: string; name: string } | null>(null);

  // Mutations
  const [deleteProduct] = useMutation(DeleteProductDocument, {
    update(cache, { data }) {
      if (data?.deleteProduct?.success) {
        cache.modify({
          fields: {
            products(existingProducts = {}, { readField }) {
              if (!existingProducts.edges) return existingProducts;

              return {
                ...existingProducts,
                totalCount: existingProducts.totalCount - 1,
                edges: existingProducts.edges.filter((edgeRef: any) => {
                  const nodeRef = readField('node', edgeRef);
                  if (!nodeRef) return false;

                  const id = readField('id', nodeRef as any);
                  return id !== data?.deleteProduct?.deletedId;
                }),
              };
            },
          },
        });
      }
    },
  });

  const [duplicateProduct, { loading: isDuplicating }] = useMutation(DuplicateProductDocument, {
    update(cache, { data }) {
      if (data?.duplicateProduct?.success && data.duplicateProduct.product) {
        // We only update the cache if we have the full product data
        const newProduct = data.duplicateProduct.product;

        try {
          // Read the exact query that populated the list
          // Note: We need to match the variables exactly. 
          // For simplicity, we 'optimistically' add it to the main list.
          // In a complex app, we might need to handle multiple variable permutations.
          const queryVariables = {
            first: pageSize,
            after: undefined, // Add to first page
            search: search || undefined,
            status: statusFilter ? (statusFilter as WorkspaceStoreProductStatusChoices) : undefined,
          };

          // Read existing cache
          const existingData = cache.readQuery<GetProductsListQuery>({
            query: GetProductsListDocument,
            variables: queryVariables,
          });

          if (existingData?.products?.edges) {
            // Create new edge
            const newEdge: any = {
              __typename: 'ProductTypeEdge',
              node: newProduct,
            };

            // Write back to cache with new product prepended
            cache.writeQuery({
              query: GetProductsListDocument,
              variables: queryVariables,
              data: {
                products: {
                  ...existingData.products,
                  totalCount: (existingData.products.totalCount || 0) + 1,
                  edges: [newEdge, ...existingData.products.edges],
                },
              },
            });
          }
        } catch (e) {
          // If query is not in cache (e.g. user landed on page 2), we can safely ignore
          // or fallback to refetch if critical.
          console.warn('Could not update cache directly:', e);
        }
      }
    },
  });

  // Debug: Log workspace context
  console.log('[ProductsListContainer] Workspace context:', {
    hasWorkspace: !!currentWorkspace,
    workspaceId: currentWorkspace?.id || '(none)',
    workspaceName: currentWorkspace?.name || '(none)',
  });

  // Fetch products with GraphQL (skip until workspace is loaded)
  const { data, loading, error, refetch } = useQuery<GetProductsListQuery, GetProductsListQueryVariables>(GetProductsListDocument, {
    variables: {
      first: pageSize,
      after: cursors[currentPage] || undefined,
      search: search || undefined,
      status: statusFilter ? (statusFilter as WorkspaceStoreProductStatusChoices) : undefined,
      // Note: Backend might need updates to support category/type filters in the query
      // For now we just track the state, but if your API supports it, add it here:
      // category: categoryFilter,
      // type: typeFilter,
    },
    skip: !currentWorkspace, // Don't query until workspace context is available
  });

  // Fetch Categories
  const { data: categoriesData } = useQuery(CategoryPickerDocument, {
    skip: !currentWorkspace,
  });

  const categoryOptions = categoriesData?.categories?.edges?.map(edge => ({
    value: edge?.node?.id || '',
    label: edge?.node?.name || '',
  })).filter(c => c.value && c.label) || [];

  // Store cursor for next page when data loads
  React.useEffect(() => {
    const endCursor = data?.products?.pageInfo?.endCursor;
    if (endCursor) {
      setCursors(prev => {
        // Avoid unnecessary updates
        if (prev[currentPage + 1] === endCursor) return prev;

        console.log(`[ProductsList] Storing cursor for page ${currentPage + 1}:`, endCursor);
        return {
          ...prev,
          [currentPage + 1]: endCursor
        };
      });
    }
  }, [data, currentPage]);

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
  const totalCount = data?.products?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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

  const handleDuplicateProduct = (productId: string) => {
    // Find product and open modal
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDuplicate({ id: product.id, name: product.name });
      setDuplicateModalOpen(true);
    }
  };

  const handleConfirmDuplicate = async (
    customName: string | null,
    copyVariants: boolean,
    copyInventory: boolean
  ) => {
    if (!productToDuplicate) return;

    try {
      const variables: any = {
        productId: productToDuplicate.id,
        copyVariants,
        copyInventory,
      };

      // Only include newName if user provided a custom one
      if (customName) {
        variables.newName = customName;
      }

      const { data: duplicateData } = await duplicateProduct({ variables });

      if (duplicateData?.duplicateProduct?.success) {
        const newProductName = duplicateData?.duplicateProduct?.product?.name || 'Product';
        const newProductSlug = duplicateData?.duplicateProduct?.product?.slug;

        toast.success(
          `Product duplicated: ${newProductName}${newProductSlug ? ` (${newProductSlug})` : ''}`
        );

        setDuplicateModalOpen(false);
        setProductToDuplicate(null);
        setDuplicateModalOpen(false);
        setProductToDuplicate(null);
        // refetch(); // Removed: Handled by cache update
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
        optimisticResponse: {
          deleteProduct: {
            success: true,
            deletedId: productId,
            message: 'Deleted successfully',
            error: null,
            __typename: 'DeleteProduct',
          },
        },
      });

      if (deleteData?.deleteProduct?.success) {
        toast.success('Product deleted successfully');
        toast.success('Product deleted successfully');
        // refetch(); // Removed: Handled by cache update
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  // Long press handler for mobile selection
  const handleLongPressProduct = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([productId]);
    }
  };

  // Clear selection handler
  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  // Select product handler (toggle)
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Bulk delete handler for mobile
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Delete ${selectedProducts.length} product(s)?`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id => deleteProduct({ variables: { productId: id } }))
      );
      toast.success(`${selectedProducts.length} product(s) deleted`);
      setSelectedProducts([]);
      refetch();
    } catch (err) {
      toast.error('Failed to delete products');
    }
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setCursors({});
  }, [search, statusFilter, categoryFilter]);

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

  // Mobile filter chips
  const mobileFilterChips = [
    { value: 'all', label: 'All' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'DRAFT', label: 'Draft' },
  ];

  // Map status filter to chip value
  const activeChip = statusFilter || 'all';

  // Handle chip change for mobile
  const handleChipChange = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value);
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="px-4 pt-4">
        <MobileProductsList
          products={products as any}
          workspaceId={currentWorkspace?.id || ''}
          searchTerm={search}
          onSearchChange={setSearch}
          chips={mobileFilterChips}
          activeChip={activeChip}
          onChipChange={handleChipChange}
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          onLongPressProduct={handleLongPressProduct}
          onClearSelection={handleClearSelection}
          onBulkArchive={() => handleBulkAction('archive')}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEditProduct}
          onView={handleViewProduct}
          onDuplicate={handleDuplicateProduct}
          onDelete={handleDeleteProduct}
          onCategoryUpdate={refetch}
          isLoading={loading}
          // Filters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categoryOptions} // Pass dynamic categories
          onAddProduct={handleAddProduct}
        />

        {/* Duplicate Product Modal (must render in mobile branch too) */}
        {productToDuplicate && (
          <DuplicateProductModal
            open={duplicateModalOpen}
            onOpenChange={setDuplicateModalOpen}
            productName={productToDuplicate.name}
            onConfirm={handleConfirmDuplicate}
            isLoading={isDuplicating}
          />
        )}
      </div>
    );
  }

  // Desktop View
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
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categoryOptions}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              <PaginationItem>
                <div className="flex items-center justify-center px-4 font-medium min-w-[100px]">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </div>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Duplicate Product Modal */}
      {productToDuplicate && (
        <DuplicateProductModal
          open={duplicateModalOpen}
          onOpenChange={setDuplicateModalOpen}
          productName={productToDuplicate.name}
          onConfirm={handleConfirmDuplicate}
          isLoading={isDuplicating}
        />
      )}
    </div>
  );
}

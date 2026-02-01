# Seamless Data Update Strategy

## Overview
This document outlines the strategy used to ensure **seamless data updates** in the product listing UI without requiring manual reloads or full network refetches after creating, duplicating, or deleting items.

The core principle is **Optimistic Cache Manipulation**: we manually update the local Apollo Client cache to reflect the change immediately, providing an "instant" user experience.

## Strategy: Apollo Cache Updates

Instead of relying on `refetchQueries` (which triggers a new network request) or waiting for page reloads, we use the `update` callback function available in Apollo's `useMutation` hook.

### 1. Duplication / Creation (Append to List)
When a new item is created (e.g., via `DuplicateProduct`), we manually inject it into the existing `GetProductsList` query result in the cache.

**Implementation (`ProductsListContainer.tsx`):**
```typescript
const [duplicateProduct] = useMutation(DuplicateProductDocument, {
  update(cache, { data }) {
    if (data?.duplicateProduct?.success && data.duplicateProduct.product) {
      const newProduct = data.duplicateProduct.product;
      
      // 1. Define variables matching the current list view (page 1)
      const queryVariables = {
        first: pageSize,
        search: search || undefined,
        status: statusFilter ? statusFilter : undefined,
      };

      // 2. Read the CURRENT cache for the list
      const existingData = cache.readQuery({
        query: GetProductsListDocument,
        variables: queryVariables,
      });

      if (existingData?.products?.edges) {
        // 3. Create a new "edge" structure
        const newEdge = {
          __typename: 'ProductTypeEdge',
          node: newProduct,
        };

        // 4. Write back to cache: New Item + Existing Items
        cache.writeQuery({
          query: GetProductsListDocument,
          variables: queryVariables,
          data: {
            products: {
              ...existingData.products,
              totalCount: (existingData.products.totalCount || 0) + 1,
              edges: [newEdge, ...existingData.products.edges], // Prepend new item
            },
          },
        });
      }
    }
  },
});
```

### 2. Deletion (Remove from List)
When an item is deleted, we use `cache.modify` to directly filter it out of the `edges` array. This is more efficient than `readQuery/writeQuery` for deletions.

**Implementation (`ProductsListContainer.tsx`):**
```typescript
const [deleteProduct] = useMutation(DeleteProductDocument, {
  update(cache, { data }) {
    if (data?.deleteProduct?.success) {
      cache.modify({
        fields: {
          products(existingProducts = {}, { readField }) {
            // Filter the edges array to exclude the deleted ID
            return {
              ...existingProducts,
              totalCount: existingProducts.totalCount - 1,
              edges: existingProducts.edges.filter((edgeRef: any) => {
                // TYPE SAFETY NOTE: We cast nodeRef to 'any' to resolve strict typings
                const nodeRef = readField('node', edgeRef);
                const id = readField('id', nodeRef as any);
                return id !== data.deleteProduct.deletedId;
              }),
            };
          },
        },
      });
    }
  },
});
```

## Key Technical Decisions

1.  **Safety with `readField`**: When accessing nested references in the cache (like `edge -> node -> id`), strict TypeScript might complain. We resolved this by asserting `nodeRef as any` inside the filter function.
2.  **Optimistic vs. Exact**: For duplication, we assume the user is viewing the first page (`after: undefined`) or that we want the new item to appear at the top. We write to the specific query variables that match the default "Page 1" view.
3.  **Fallback**: The `try/catch` block handling cache reads ensures that if the specific query isn't in cache (e.g., user is on Page 5 and cache for Page 1 has been instantiated but not fully present, or variables mismatch), the app doesn't crash—it simply falls back to the backend state on next fetch.

## Future Usage (Blueprint)
When implementing new list features (e.g., Collections, Orders):
1.  **Always return the full object** from your mutation (e.g., the created `Product`, `Order`) to allow cache insertion.
2.  **Use `cache.writeQuery`** for Additions to inject the new object into the top of the list.
3.  **Use `cache.modify`** for Deletions to surgically remove the item reference.

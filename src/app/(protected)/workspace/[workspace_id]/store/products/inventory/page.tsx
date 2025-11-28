'use client'

/**
 * Inventory Management Page
 *
 * Features:
 * - Lists all inventory records (variant × location combinations)
 * - Inline editing for onhand and available quantities
 * - Real-time updates with optimistic UI
 * - Filters by location and stock status
 * - Cursor-based pagination
 */

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Card, CardContent } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Button } from '@/components/shadcn-ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
import { InventoryTable } from '@/components/workspace/store/inventory/InventoryTable'
import { GetInventoryDocument } from '@/services/graphql/admin-store/queries/inventory/__generated__/GetInventory.generated'
import { GetLocationsDocument } from '@/services/graphql/admin-store/queries/inventory/__generated__/GetLocations.generated'
import { UpdateInventoryDocument } from '@/services/graphql/admin-store/mutations/inventory/__generated__/UpdateInventory.generated'
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore'
import { toast } from 'sonner'
import { Search, Package } from 'lucide-react'

export default function InventoryPage() {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace)

  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState<string | undefined>()
  const [stockStatusFilter, setStockStatusFilter] = useState<string | undefined>()

  // Fetch locations for filter
  const { data: locationsData } = useQuery(GetLocationsDocument, {
    skip: !currentWorkspace,
  })

  // Fetch inventory
  const { data, loading, error, fetchMore, refetch } = useQuery(GetInventoryDocument, {
    variables: {
      first: 50,
      location: locationFilter,
    },
    skip: !currentWorkspace,
  })

  // Update inventory mutation
  const [updateInventory] = useMutation(UpdateInventoryDocument)

  // Transform GraphQL data
  const inventory = data?.inventory?.edges
    ?.map((edge) => edge?.node)
    .filter((node): node is NonNullable<typeof node> => node !== null && node !== undefined) || []

  // Apply client-side filters (search and stock status)
  const filteredInventory = inventory.filter((item) => {
    // Search filter (product name, SKU, variant options)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesProduct = item.productName?.toLowerCase().includes(query)
      const matchesSku = item.sku?.toLowerCase().includes(query)
      const matchesVariant =
        item.variant?.option1?.toLowerCase().includes(query) ||
        item.variant?.option2?.toLowerCase().includes(query) ||
        item.variant?.option3?.toLowerCase().includes(query)

      if (!matchesProduct && !matchesSku && !matchesVariant) {
        return false
      }
    }

    // Stock status filter
    if (stockStatusFilter && stockStatusFilter !== 'all') {
      if (item.stockStatus !== stockStatusFilter) {
        return false
      }
    }

    return true
  })

  const hasNextPage = data?.inventory?.pageInfo?.hasNextPage || false
  const totalCount = data?.inventory?.totalCount || 0
  const locations = (locationsData?.locations || []).filter((loc): loc is NonNullable<typeof loc> => loc !== null && loc !== undefined)

  // Handle inventory update
  const handleUpdateInventory = async (
    inventoryId: string,
    variantId: string,
    locationId: string,
    field: 'onhand' | 'available',
    value: number
  ) => {
    try {
      const { data: updateData } = await updateInventory({
        variables: {
          updateData: {
            variantId,
            locationId,
            [field]: value,
          },
        },
      })

      if (updateData?.updateInventory?.success) {
        toast.success(`${field === 'onhand' ? 'On Hand' : 'Available'} updated successfully`)
        refetch() // Refresh to get computed fields
      } else {
        toast.error(updateData?.updateInventory?.error || 'Failed to update inventory')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update inventory')
      console.error('Update inventory error:', err)
    }
  }

  const handleLoadMore = () => {
    if (hasNextPage && data?.inventory?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          after: data.inventory.pageInfo.endCursor,
        },
      })
    }
  }

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setLocationFilter(undefined)
    setStockStatusFilter(undefined)
  }

  const hasFilters = searchQuery || locationFilter || stockStatusFilter

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load inventory</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Manage inventory across all locations ({totalCount} total records)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product, SKU, or variant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Location Filter */}
            <Select value={locationFilter || 'all'} onValueChange={(v) => setLocationFilter(v === 'all' ? undefined : v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Status Filter */}
            <Select
              value={stockStatusFilter || 'all'}
              onValueChange={(v) => setStockStatusFilter(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      {loading && filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <div className="animate-pulse text-muted-foreground">Loading inventory...</div>
            </div>
          </CardContent>
        </Card>
      ) : filteredInventory.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No inventory records found</p>
              <p className="text-sm text-muted-foreground">
                {hasFilters ? 'Try adjusting your filters' : 'Add products to create inventory records'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <InventoryTable inventory={filteredInventory} onUpdateInventory={handleUpdateInventory} />

          {/* Showing count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredInventory.length} of {totalCount} records
            </div>

            {/* Load More */}
            {hasNextPage && (
              <Button variant="ghost" size="sm" onClick={handleLoadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

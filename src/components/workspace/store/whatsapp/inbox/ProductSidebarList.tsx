"use client"

import * as React from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import { Search, Package, Check, ArrowRight, RefreshCw, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  GetProductsListDocument, 
  GetProductsListQuery, 
  GetProductsListQueryVariables 
} from "@/services/graphql/admin-store/queries/products/__generated__/GetProductsList.generated"
import { 
  SyncProductsToMetaDocument,
  SyncProductsToMetaMutation,
  SyncProductsToMetaMutationVariables
} from "@/services/graphql/admin-store/mutations/whatsapp/__generated__/SyncProductsToMeta.generated"
import { Skeleton } from "@/components/shadcn-ui/skeleton"
import { Button } from "@/components/shadcn-ui/button"
import { Badge } from "@/components/shadcn-ui/badge"
import { toast } from "sonner"

interface ProductSidebarListProps {
  selectedId?: string
  onSelect: (product: any) => void
  onClear: () => void
  workspaceId: string
}

export function ProductSidebarList({
  selectedId,
  onSelect,
  onClear,
  workspaceId
}: ProductSidebarListProps) {
  const [search, setSearch] = React.useState("")

  const { data, loading, error, refetch } = useQuery<GetProductsListQuery, GetProductsListQueryVariables>(
    GetProductsListDocument,
    {
      variables: {
        first: 50,
        search: search || undefined,
      },
      skip: !workspaceId,
    }
  )

  const [syncToMeta, { loading: syncLoading }] = useMutation<SyncProductsToMetaMutation, SyncProductsToMetaMutationVariables>(SyncProductsToMetaDocument)

  const products = (data?.products?.edges || [])
    .map(e => e?.node)
    .filter((node): node is NonNullable<typeof node> => !!node)

  const handleSyncAll = async () => {
    const ids = products.map(p => p.id)
    if (ids.length === 0) return

    try {
      const { data: syncData } = await syncToMeta({
        variables: { productIds: ids }
      })

      if (syncData?.syncProductsToMeta?.success) {
        toast.success(`Successfully synced ${syncData.syncProductsToMeta.count} products to Meta.`)
        refetch()
      } else {
        toast.error(syncData?.syncProductsToMeta?.error || "Sync failed")
      }
    } catch (err) {
      toast.error("An error occurred during sync.")
    }
  }

  const renderSyncBadge = (sync: any) => {
    if (!sync) return null
    
    switch (sync.status) {
      case 'APPROVED':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] px-1.5 h-4 uppercase">Live</Badge>
      case 'PENDING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] px-1.5 h-4 uppercase">Syncing</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] px-1.5 h-4 uppercase">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search Header */}
      <header className="sticky top-0 z-10 p-4 border-b bg-background/95 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Catalog</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] font-bold gap-1.5 text-primary hover:bg-primary/5"
            onClick={handleSyncAll}
            disabled={syncLoading || products.length === 0}
          >
            <RefreshCw className={cn("size-3", syncLoading && "animate-spin")} />
            Sync All
          </Button>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 bg-muted/30 rounded-xl text-sm border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </header>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="size-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
            <Package className="size-10 mb-2" />
            <p className="text-xs font-medium uppercase tracking-widest">No products found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {products.map((product: any) => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className={cn(
                  "group relative flex w-full gap-3 rounded-xl p-2 text-left transition-all duration-200",
                  selectedId === product.id 
                    ? "bg-primary/5 ring-1 ring-primary/20" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted border">
                  {product.mediaGallery?.[0]?.thumbnailUrl ? (
                    <img 
                      src={product.mediaGallery[0].thumbnailUrl} 
                      alt={product.name} 
                      className="size-full object-cover" 
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground/30">
                      <Package className="size-5" />
                    </div>
                  )}
                  {selectedId === product.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] animate-in fade-in">
                      <Check className="size-6 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-[13px] font-bold text-foreground flex-1">
                      {product.name}
                    </h4>
                    {renderSyncBadge(product.metaSync)}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-primary">
                      {product.price ? `${parseInt(product.price).toLocaleString()} ${product.currency || 'XAF'}` : "N/A"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {product.inventoryQuantity || 0} in stock
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table'
import { Badge } from '@/components/shadcn-ui/badge'
import { useTranslations } from 'next-intl'
import { EditableCell } from './EditableCell'
import type { GetInventoryQuery } from '@/services/graphql/admin-store/queries/inventory/__generated__/GetInventory.generated'

type InventoryNode = NonNullable<
  NonNullable<NonNullable<GetInventoryQuery['inventory']>['edges'][0]>['node']
>

interface InventoryTableProps {
  inventory: InventoryNode[]
  onUpdateInventory: (
    inventoryId: string,
    variantId: string,
    locationId: string,
    field: 'onhand' | 'available',
    value: number
  ) => Promise<void>
}

export function InventoryTable({ inventory, onUpdateInventory }: InventoryTableProps) {
  const t = useTranslations('Inventory')
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace)
  const [updatingCells, setUpdatingCells] = useState<Set<string>>(new Set())

  const getStockStatusBadge = (stockStatus: string | null) => {
    if (!stockStatus) return null

    const variants = {
      in_stock: 'bg-green-100 text-green-800 border-green-200',
      low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      out_of_stock: 'bg-red-100 text-red-800 border-red-200',
    }

    const labels = {
      in_stock: t('status.in_stock'),
      low_stock: t('status.low_stock'),
      out_of_stock: t('status.out_of_stock'),
    }

    return (
      <Badge variant="outline" className={variants[stockStatus as keyof typeof variants]}>
        {labels[stockStatus as keyof typeof labels]}
      </Badge>
    )
  }

  const getConditionBadge = (condition: string | null) => {
    if (!condition) return <span className="text-sm text-muted-foreground">-</span>

    const variants = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      refurbished: 'bg-purple-100 text-purple-800 border-purple-200',
      second_hand: 'bg-gray-100 text-gray-800 border-gray-200',
      used_like_new: 'bg-teal-100 text-teal-800 border-teal-200',
      used_good: 'bg-orange-100 text-orange-800 border-orange-200',
      used_acceptable: 'bg-amber-100 text-amber-800 border-amber-200',
    }

    const labels = {
      new: t('condition.new'),
      refurbished: t('condition.refurbished'),
      second_hand: t('condition.second_hand'),
      used_like_new: t('condition.used_like_new'),
      used_good: t('condition.used_good'),
      used_acceptable: t('condition.used_acceptable'),
    }

    return (
      <Badge variant="outline" className={variants[condition as keyof typeof variants] || ''}>
        {labels[condition as keyof typeof labels] || condition}
      </Badge>
    )
  }

  const handleCellUpdate = async (
    inventoryId: string,
    variantId: string,
    locationId: string,
    field: 'onhand' | 'available',
    value: number
  ) => {
    const cellKey = `${inventoryId}-${field}`
    setUpdatingCells(prev => new Set(prev).add(cellKey))

    try {
      await onUpdateInventory(inventoryId, variantId, locationId, field, value)
    } finally {
      setUpdatingCells(prev => {
        const next = new Set(prev)
        next.delete(cellKey)
        return next
      })
    }
  }

  if (inventory.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          <p>{t('list.noInventory')}</p>
          <p className="text-sm">{t('list.noInventoryDetail')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.product')}</TableHead>
            <TableHead>{t('table.variant')}</TableHead>
            <TableHead>{t('table.sku')}</TableHead>
            <TableHead>{t('table.location')}</TableHead>
            <TableHead className="text-right">{t('table.quantity')}</TableHead>
            <TableHead className="text-right">{t('table.onHand')}</TableHead>
            <TableHead className="text-right">{t('table.available')}</TableHead>
            <TableHead>{t('table.condition')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => {
            const variantId = item.variant?.id || ''
            const productId = item.variant?.product?.id || ''
            const locationId = item.location?.id || ''
            const variantUrl = productId && variantId
              ? `/workspace/${currentWorkspace?.id}/store/products/${productId}/variants/${variantId}`
              : null

            return (
              <TableRow key={item.id}>
                {/* Product */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {item.productImage?.thumbnailUrl || item.productImage?.url ? (
                      <img
                        src={(item.productImage.thumbnailUrl || item.productImage.url) ?? undefined}
                        alt={item.productName || ''}
                        className="h-10 w-10 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border">
                        <span className="text-xs text-muted-foreground">{t('table.noImage')}</span>
                      </div>
                    )}
                    <div>
                      {variantUrl ? (
                        <Link
                          href={variantUrl}
                          className="font-medium hover:underline"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <div className="font-medium">{item.productName}</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Variant */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.variant?.option1 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.variant.option1}
                      </Badge>
                    )}
                    {item.variant?.option2 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.variant.option2}
                      </Badge>
                    )}
                    {item.variant?.option3 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.variant.option3}
                      </Badge>
                    )}
                    {!item.variant?.option1 && !item.variant?.option2 && !item.variant?.option3 && (
                      <span className="text-sm text-muted-foreground">{t('table.default')}</span>
                    )}
                  </div>
                </TableCell>

                {/* SKU */}
                <TableCell>
                  <span className="text-sm font-mono">{item.sku || '-'}</span>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{item.location?.name}</div>
                    <div className="text-xs text-muted-foreground">{item.location?.region}</div>
                  </div>
                </TableCell>

                {/* Quantity (Read-only, computed field) */}
                <TableCell className="text-right">
                  <span className="font-medium tabular-nums">{item.quantity}</span>
                </TableCell>

                {/* On Hand (Editable) */}
                <TableCell className="text-right">
                  <EditableCell
                    value={item.onhand}
                    onSave={async (value) => {
                      await handleCellUpdate(item.id, variantId, locationId, 'onhand', value)
                    }}
                    disabled={updatingCells.has(`${item.id}-onhand`)}
                    min={0}
                    className="ml-auto"
                  />
                </TableCell>

                {/* Available (Editable) */}
                <TableCell className="text-right">
                  <EditableCell
                    value={item.available}
                    onSave={async (value) => {
                      await handleCellUpdate(item.id, variantId, locationId, 'available', value)
                    }}
                    disabled={updatingCells.has(`${item.id}-available`)}
                    min={0}
                    className="ml-auto"
                  />
                </TableCell>

                {/* Condition */}
                <TableCell>{getConditionBadge(item.condition)}</TableCell>

                {/* Status */}
                <TableCell>{getStockStatusBadge(item.stockStatus)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

'use client'

import { Button } from '@/components/shadcn-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu'
import { Download, Archive, Trash2, MoreHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CategoriesToolbarProps {
  selectedCount: number
  onBulkAction?: (action: 'archive' | 'delete' | 'export') => void
  onAddCategory?: () => void
}

export function CategoriesToolbar({
  selectedCount,
  onBulkAction,
  onAddCategory,
}: CategoriesToolbarProps) {
  const t = useTranslations('Categories.toolbar');
  const handleBulkAction = (action: 'archive' | 'delete' | 'export') => {
    onBulkAction?.(action)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {selectedCount > 0 ? (
          <>
            <div className="text-sm text-muted-foreground">
              {t('selectedCount', { count: selectedCount })}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  {t('bulkActions')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {t('archive')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('export')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            {t('selectToPerform')}
          </div>
        )}
      </div>

      <Button onClick={onAddCategory}>
        {t('addCategory')}
      </Button>
    </div>
  )
}
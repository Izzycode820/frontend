'use client'

/**
 * CategorySidebar Component
 *
 * Clean sidebar matching Shopify design
 * - Publishing: Visibility and Featured toggles
 * - Organization: Sort order for category positioning
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Switch } from '@/components/shadcn-ui/switch'
import { useTranslations } from 'next-intl'

interface CategorySidebarProps {
  isVisible: boolean
  isFeatured: boolean
  sortOrder: number
  onIsVisibleChange: (isVisible: boolean) => void
  onIsFeaturedChange: (isFeatured: boolean) => void
  onSortOrderChange: (sortOrder: number) => void
}

export function CategorySidebar({
  isVisible,
  isFeatured,
  sortOrder,
  onIsVisibleChange,
  onIsFeaturedChange,
  onSortOrderChange,
}: CategorySidebarProps) {
  const t = useTranslations('Categories.form.sidebar');
  return (
    <>
      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('publishing')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-visible">{t('visibleLabel')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('visibleDesc')}
              </p>
            </div>
            <Switch
              id="sidebar-visible"
              checked={isVisible}
              onCheckedChange={onIsVisibleChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-featured">{t('featuredLabel')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('featuredDesc')}
              </p>
            </div>
            <Switch
              id="sidebar-featured"
              checked={isFeatured}
              onCheckedChange={onIsFeaturedChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('organization')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="sidebar-sort-order">{t('sortOrderLabel')}</Label>
            <Input
              id="sidebar-sort-order"
              type="number"
              placeholder="0"
              value={sortOrder}
              onChange={(e) => onSortOrderChange(Number(e.target.value))}
              min="0"
              max="999"
            />
            <p className="text-xs text-muted-foreground">
              {t('sortOrderDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
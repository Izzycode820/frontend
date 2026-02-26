'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Switch } from '@/components/shadcn-ui/switch'
import { useTranslations } from 'next-intl'

interface CategoryVisibilitySectionProps {
  isVisible: boolean
  isFeatured: boolean
  sortOrder: number
  onIsVisibleChange: (isVisible: boolean) => void
  onIsFeaturedChange: (isFeatured: boolean) => void
  onSortOrderChange: (sortOrder: number) => void
}

export function CategoryVisibilitySection({
  isVisible,
  isFeatured,
  sortOrder,
  onIsVisibleChange,
  onIsFeaturedChange,
  onSortOrderChange,
}: CategoryVisibilitySectionProps) {
  const t = useTranslations('Categories.form.sidebar');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('publishing')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="category-visible">{t('visibleLabel')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('visibleDesc')}
            </p>
          </div>
          <Switch
            id="category-visible"
            checked={isVisible}
            onCheckedChange={onIsVisibleChange}
          />
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="category-featured">{t('featuredLabel')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('featuredDesc')}
            </p>
          </div>
          <Switch
            id="category-featured"
            checked={isFeatured}
            onCheckedChange={onIsFeaturedChange}
          />
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label htmlFor="category-sort-order">{t('sortOrderLabel')}</Label>
          <Input
            id="category-sort-order"
            type="number"
            placeholder="0"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(Number(e.target.value))}
            min="0"
            max="999"
          />
          <p className="text-sm text-muted-foreground">
            {t('sortOrderDesc')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
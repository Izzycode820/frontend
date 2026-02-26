'use client'

import { Card, CardContent } from '@/components/shadcn-ui/card'
import { Button } from '@/components/shadcn-ui/button'
import { Package, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CategoriesEmptyStateProps {
  onAddCategory?: () => void
}

export function CategoriesEmptyState({
  onAddCategory,
}: CategoriesEmptyStateProps) {
  const t = useTranslations('Categories.emptyState');

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold mb-2">{t('title')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('description')}
          </p>

          <Button onClick={onAddCategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('createAction')}
          </Button>

          <div className="mt-8 text-sm text-muted-foreground max-w-lg mx-auto space-y-2">
            <p><strong>{t('whyTitle')}</strong></p>
            <ul className="text-left space-y-1">
              <li>• {t('benefit1')}</li>
              <li>• {t('benefit2')}</li>
              <li>• {t('benefit3')}</li>
              <li>• {t('benefit4')}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
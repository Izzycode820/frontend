'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Label } from '@/components/shadcn-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
import { useTranslations } from 'next-intl'

interface ProductSidebarProps {
  status: 'draft' | 'published'
  onStatusChange: (status: 'draft' | 'published') => void
}

export function ProductSidebar({
  status,
  onStatusChange,
}: ProductSidebarProps) {
  const t = useTranslations('Products.form.sidebar');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Status */}
        <div className="space-y-2">
          <Label htmlFor="status">{t('productStatus')}</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t('draft')}</SelectItem>
              <SelectItem value="published">{t('published')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Availability */}
        <div className="space-y-2">
          <Label>{t('availability')}</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="online-store"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="online-store" className="text-sm font-normal">
                {t('onlineStore')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pos"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="pos" className="text-sm font-normal">
                {t('pos')}
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

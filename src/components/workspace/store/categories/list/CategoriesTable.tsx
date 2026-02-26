'use client'

import { Badge } from '@/components/shadcn-ui/badge'
import { Button } from '@/components/shadcn-ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu'
import { MoreHorizontal, Eye, EyeOff, Edit, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Category {
  id: string
  name: string
  isVisible: boolean
  isFeatured: boolean
  productCount: number
  featuredMedia?: {
    id: string
    url?: string | null
    thumbnailUrl?: string | null
    optimizedUrl?: string | null
    width?: number | null
    height?: number | null
  }
}

interface CategoriesTableProps {
  categories: Category[]
  onEdit?: (categoryId: string) => void
  onView?: (categoryId: string) => void
  onToggleVisibility?: (categoryId: string) => void
  onDelete?: (categoryId: string) => void
}

export function CategoriesTable({
  categories,
  onEdit,
  onView,
  onToggleVisibility,
  onDelete,
}: CategoriesTableProps) {
  const t = useTranslations('Categories.table');

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20"></TableHead>
            <TableHead className="w-96">{t('columnCategory')}</TableHead>
            <TableHead className="text-center">{t('columnProducts')}</TableHead>
            <TableHead className="text-center">{t('columnStatus')}</TableHead>
            <TableHead className="text-center">{t('columnFeatured')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                {t('noCategoriesFound')}
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                {/* Thumbnail */}
                <TableCell>
                  {category.featuredMedia?.thumbnailUrl || category.featuredMedia?.url ? (
                    <img
                      src={category.featuredMedia.thumbnailUrl || category.featuredMedia.url || undefined}
                      alt={category.name}
                      className="h-16 w-16 rounded-md object-cover border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center border">
                      <span className="text-xs text-muted-foreground">{t('noImage')}</span>
                    </div>
                  )}
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium">
                  <button
                    onClick={() => onView?.(category.id)}
                    className="hover:underline text-left"
                  >
                    {category.name}
                  </button>
                </TableCell>

                {/* Product Count */}
                <TableCell className="text-center text-sm">
                  {category.productCount}
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  {category.isVisible ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t('statusVisible')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {t('statusHidden')}
                    </Badge>
                  )}
                </TableCell>

                {/* Featured */}
                <TableCell className="text-center">
                  {category.isFeatured && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {t('statusFeatured')}
                    </Badge>
                  ) || '-'}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(category.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleVisibility?.(category.id)}>
                        {category.isVisible ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            {t('hide')}
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('show')}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete?.(category.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

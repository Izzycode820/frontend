'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table'
import { Badge } from '@/components/shadcn-ui/badge'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { Button } from '@/components/shadcn-ui/button'
import { Eye, MoreHorizontal, Pencil, Trash, ExternalLink } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

export interface Page {
  id: string
  title: string
  handle: string
  isPublished: boolean
  updatedAt: string
  url?: string
}

interface PagesTableProps {
  pages: Page[]
  onPageSelect?: (selectedIds: string[]) => void
  onEdit: (pageId: string) => void
  onView: (pageId: string) => void
  onDelete: (pageId: string) => void
}

export function PagesTable({
  pages,
  onPageSelect,
  onEdit,
  onView,
  onDelete,
}: PagesTableProps) {
  const t = useTranslations('Studio');
  const [selectedPages, setSelectedPages] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? pages.map(p => p.id) : []
    setSelectedPages(newSelected)
    onPageSelect?.(newSelected)
  }

  const handleSelectPage = (pageId: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedPages, pageId]
      : selectedPages.filter(id => id !== pageId)
    setSelectedPages(newSelected)
    onPageSelect?.(newSelected)
  }

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-12">
                <Checkbox
                    checked={selectedPages.length === pages.length && pages.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label={t('common.selectAll')}
                />
                </TableHead>
                <TableHead>{t('pages.table.title')}</TableHead>
                <TableHead>{t('pages.table.status')}</TableHead>
                <TableHead>{t('pages.table.handle')}</TableHead>
                <TableHead>{t('pages.table.updated')}</TableHead>
                <TableHead className="w-12"></TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {pages.map((page) => (
                <TableRow key={page.id}>
                <TableCell>
                    <Checkbox
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                    aria-label={t('common.selectItem', { name: page.title })}
                    />
                </TableCell>
                <TableCell className="font-medium">
                    <span className="font-semibold block">{page.title}</span>
                </TableCell>
                <TableCell>
                    <Badge variant={page.isPublished ? 'outline' : 'secondary'} className={page.isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                        {page.isPublished ? t('common.published') : t('common.hidden')}
                    </Badge>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-mono text-muted-foreground">/{page.handle}</span>
                </TableCell>
                <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          const date = new Date(page.updatedAt);
                          if (isNaN(date.getTime())) return t('common.invalidDate');
                          return format(date, 'MMM d, yyyy');
                        } catch {
                          return t('common.invalidDate');
                        }
                      })()}
                    </span>
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(page.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> {t('pages.form.update')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onView(page.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> {t('articles.form.view')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => onDelete(page.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                        <Trash className="mr-2 h-4 w-4" /> {t('common.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </div>
  )
}

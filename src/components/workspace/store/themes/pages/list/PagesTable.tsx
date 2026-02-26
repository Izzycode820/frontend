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
} from '@/components/shadcn-ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

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
  const t = useTranslations('Themes');
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
                    aria-label="Select all"
                />
                </TableHead>
                <TableHead>{t('pages.table.title')}</TableHead>
                <TableHead>{t('pages.table.status')}</TableHead>
                <TableHead>{t('pages.table.handle')}</TableHead>
                <TableHead>{t('pages.table.lastUpdated')}</TableHead>
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
                    aria-label={`Select ${page.title}`}
                    />
                </TableCell>
                <TableCell className="font-medium">
                    <span className="font-semibold block">{page.title}</span>
                </TableCell>
                <TableCell>
                    <Badge variant={page.isPublished ? 'outline' : 'secondary'} className={page.isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                        {page.isPublished ? t('pages.table.published') : t('pages.table.hidden')}
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
                        <span className="sr-only">{t('library.card.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('library.card.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(page.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> {t('pages.table.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onView(page.id)}>
                        <ExternalLink className="mr-2 h-4 w-4" /> {t('pages.table.view')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => onDelete(page.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                        <Trash className="mr-2 h-4 w-4" /> {t('pages.table.delete')}
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

'use client';

import { Page } from '@/components/workspace/store/themes/pages/list/PagesTable';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import { MoreHorizontal, Pencil, Trash, ExternalLink } from 'lucide-react';
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

interface MobilePagesListProps {
  pages: Page[];
  onEdit: (pageId: string) => void;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
}

export function MobilePagesList({ pages, onEdit, onView, onDelete }: MobilePagesListProps) {
  const t = useTranslations('Themes');
  
  return (
    <div className="space-y-4">
          {pages.map((page) => (
             <div key={page.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
                 <div className="flex items-start justify-between">
                     <div>
                        <div className="font-semibold">{page.title}</div>
                        <div className="text-xs text-muted-foreground">/{page.handle}</div>
                     </div>
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
                              className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> {t('pages.table.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                     <Badge variant={page.isPublished ? 'outline' : 'secondary'} className={page.isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                        {page.isPublished ? t('pages.table.published') : t('pages.table.hidden')}
                     </Badge>
                     <span className="text-muted-foreground">{format(new Date(page.updatedAt), 'MMM d, yyyy')}</span>
                 </div>
             </div>
          ))}
    </div>
  );
}

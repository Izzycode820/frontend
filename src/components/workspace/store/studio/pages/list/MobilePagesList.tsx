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
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface MobilePagesListProps {
  pages: Page[];
  onEdit: (pageId: string) => void;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
}

export function MobilePagesList({ pages, onEdit, onView, onDelete }: MobilePagesListProps) {
  const t = useTranslations('Studio');
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
                              className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                     <Badge variant={page.isPublished ? 'outline' : 'secondary'} className={page.isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                        {page.isPublished ? t('common.published') : t('common.hidden')}
                     </Badge>
                     <span className="text-muted-foreground">
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
                 </div>
             </div>
          ))}
    </div>
  );
}

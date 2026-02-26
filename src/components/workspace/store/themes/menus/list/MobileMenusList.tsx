'use client';

import { Menu } from '@/components/workspace/store/themes/menus/list/MenusTable';
import { Button } from '@/components/shadcn-ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';

interface MobileMenusListProps {
  menus: Menu[];
  onEdit: (menuId: string) => void;
  onDelete: (menuId: string) => void;
}

export function MobileMenusList({ menus, onEdit, onDelete }: MobileMenusListProps) {
  const t = useTranslations('Themes');
  return (
    <div className="space-y-4">
        {menus.map((menu) => (
          <div key={menu.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
             <div className="flex items-center justify-between">
                <div className="font-semibold">{menu.title}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">{t('library.card.openMenu')}</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('library.card.actions')}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(menu.id)}>
                      <Pencil className="mr-2 h-4 w-4" /> {t('menus.table.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => onDelete(menu.id)}
                        className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" /> {t('menus.table.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
             <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                 <div>
                    <span className="block text-xs font-medium uppercase text-muted-foreground/70">{t('menus.table.handle')}</span>
                    <span className="font-mono">{menu.handle}</span>
                 </div>
                 <div>
                    <span className="block text-xs font-medium uppercase text-muted-foreground/70">{t('menus.table.items')}</span>
                    <span>{menu.itemsCount}</span>
                 </div>
             </div>
          </div>
        ))}
    </div>
  );
}

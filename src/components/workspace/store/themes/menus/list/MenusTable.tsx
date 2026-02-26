'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
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

export interface Menu {
  id: string;
  title: string;
  handle: string;
  itemsCount: number;
}

interface MenusTableProps {
  menus: Menu[];
  onEdit: (menuId: string) => void;
  onDelete: (menuId: string) => void;
}

export function MenusTable({
  menus,
  onEdit,
  onDelete,
}: MenusTableProps) {
  const t = useTranslations('Themes');
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('menus.table.title')}</TableHead>
            <TableHead>{t('menus.table.handle')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menus.map((menu) => (
            <TableRow key={menu.id}>
              <TableCell className="font-medium">
                {menu.title}
              </TableCell>
              <TableCell>
                 <span className="font-mono text-sm text-muted-foreground">{menu.handle}</span>
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
                    <DropdownMenuItem onClick={() => onEdit(menu.id)}>
                      <Pencil className="mr-2 h-4 w-4" /> {t('menus.table.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => onDelete(menu.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash className="mr-2 h-4 w-4" /> {t('menus.table.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

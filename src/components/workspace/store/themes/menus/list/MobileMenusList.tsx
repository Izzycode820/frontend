'use client';

import { Menu } from '@/components/workspace/store/themes/menus/list/MenusTable';
import { Button } from '@/components/shadcn-ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
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
  return (
    <div className="space-y-4">
        {menus.map((menu) => (
          <div key={menu.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
             <div className="flex items-center justify-between">
                <div className="font-semibold">{menu.title}</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(menu.id)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit menu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => onDelete(menu.id)}
                        className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete menu
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
             <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                 <div>
                    <span className="block text-xs font-medium uppercase text-muted-foreground/70">Handle</span>
                    <span className="font-mono">{menu.handle}</span>
                 </div>
                 <div>
                    <span className="block text-xs font-medium uppercase text-muted-foreground/70">Items</span>
                    <span>{menu.itemsCount}</span>
                 </div>
             </div>
          </div>
        ))}
    </div>
  );
}

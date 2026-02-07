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
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Items</TableHead>
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
                 {menu.itemsCount} items
              </TableCell>
              <TableCell>
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
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete menu
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

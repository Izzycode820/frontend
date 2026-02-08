'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react';

export interface Article {
  id: string;
  title: string;
  handle: string;
  isPublished: boolean;
  statusDisplay: string | null;
  author: string;
  blog: {
    id: string;
    title: string;
    handle: string;
  };
  publishedAt: string | null;
  createdAt: string;
  url: string | null;
}

interface ArticlesTableProps {
  articles: Article[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function ArticlesTable({ articles, onEdit, onDelete }: ArticlesTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Blog</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{article.title}</div>
                  <div className="text-sm text-muted-foreground font-mono">/{article.handle}</div>
                </div>
              </TableCell>
              <TableCell>
                {article.isPublished ? (
                  <Badge variant="default" className="bg-green-600">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">{article.author}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{article.blog.title}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(article.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {article.url && (
                      <DropdownMenuItem onClick={() => window.open(article.url!, '_blank')}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(article.id, article.title)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
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

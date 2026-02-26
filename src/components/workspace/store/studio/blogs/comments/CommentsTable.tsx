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
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { MoreHorizontal, Check, ShieldAlert, Trash, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { WorkspaceStoreCommentStatusChoices } from '@/types/workspace/store/graphql-base';

export interface Comment {
  id: string;
  content: string;
  nickname: string;
  email: string | null;
  status: WorkspaceStoreCommentStatusChoices;
  statusDisplay: string | null;
  createdAt: string;
  article: {
    id: string;
    title: string;
    blog: {
      id: string;
      title: string;
    };
  };
}

interface CommentsTableProps {
  comments: Comment[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function CommentsTable({ comments, onStatusChange, onDelete }: CommentsTableProps) {
  const t = useTranslations('Studio');

  const getStatusBadge = (status: WorkspaceStoreCommentStatusChoices) => {
    switch (status) {
      case WorkspaceStoreCommentStatusChoices.Approved:
        return <Badge variant="default" className="bg-green-600">{t('comments.status.approved')}</Badge>;
      case WorkspaceStoreCommentStatusChoices.Pending:
        return <Badge variant="secondary">{t('comments.status.pending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">{t('comments.table.author')}</TableHead>
            <TableHead className="w-[40%]">{t('comments.table.comment')}</TableHead>
            <TableHead>{t('comments.table.article')}</TableHead>
            <TableHead>{t('comments.table.status')}</TableHead>
            <TableHead>{t('comments.table.date')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{comment.nickname}</span>
                  <span className="text-xs text-muted-foreground">{comment.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm line-clamp-3 text-muted-foreground italic">
                   "{comment.content}"
                </p>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{comment.article.title}</span>
                    <span className="text-xs text-muted-foreground">{comment.article.blog.title}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(comment.status)}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(comment.createdAt), 'MMM d, yyyy')}
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
                    {comment.status !== WorkspaceStoreCommentStatusChoices.Approved && (
                      <DropdownMenuItem onClick={() => onStatusChange(comment.id, 'APPROVED')}>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        {t('comments.actions.approve')}
                      </DropdownMenuItem>
                    )}
                    {comment.status !== WorkspaceStoreCommentStatusChoices.Pending && (
                      <DropdownMenuItem onClick={() => onStatusChange(comment.id, 'PENDING')}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {t('comments.actions.unapprove')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onStatusChange(comment.id, 'SPAM')}>
                      <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" />
                      {t('comments.actions.spam')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t('comments.actions.remove')}
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

'use client';

import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Check, ShieldAlert, Trash, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Comment } from './CommentsTable';
import { WorkspaceStoreCommentStatusChoices } from '@/types/workspace/store/graphql-base';

interface MobileCommentsListProps {
  comments: Comment[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function MobileCommentsList({ comments, onStatusChange, onDelete }: MobileCommentsListProps) {
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
    <div className="space-y-3">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-semibold text-base">{comment.nickname}</span>
                  <span className="text-xs text-muted-foreground">{comment.email}</span>
                </div>
                {getStatusBadge(comment.status)}
              </div>

              <div className="bg-muted/30 p-3 rounded-md italic text-sm text-muted-foreground">
                "{comment.content}"
              </div>

              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-muted-foreground uppercase">{t('comments.table.article')}</span>
                 <span className="text-sm">{comment.article.title}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <span className="text-xs text-muted-foreground">
                   {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                 </span>
                 <div className="flex items-center gap-2">
                    {comment.status !== WorkspaceStoreCommentStatusChoices.Approved && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-green-600"
                        onClick={() => onStatusChange(comment.id, 'APPROVED')}
                      >
                         <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-orange-600"
                      onClick={() => onStatusChange(comment.id, 'SPAM')}
                    >
                       <ShieldAlert className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDelete(comment.id)}
                    >
                       <Trash className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/shadcn/use-mobile';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { GetCommentsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetComments.generated';
import { ManageCommentDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/ManageComment.generated';
import { CommentsTable, type Comment } from './CommentsTable';
import { MobileCommentsList } from './MobileCommentsList';
interface CommentsListContainerProps {
  articleId?: string;
}

export default function CommentsListContainer({ articleId }: CommentsListContainerProps) {
  const t = useTranslations('Studio');
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isMobile = useIsMobile();
  
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [manageComment] = useMutation(ManageCommentDocument);

  const { data, loading, error, refetch } = useQuery(GetCommentsDocument, {
    variables: {
      articleId: articleId || undefined,
      status: selectedStatus || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const handleStatusChange = async (commentId: string, status: string) => {
    try {
      const { data: result } = await manageComment({
        variables: { id: commentId, status },
      });

      if (result?.manageComment?.success) {
        toast.success(t('comments.toasts.updateSuccess'));
        refetch();
      } else {
        toast.error(result?.manageComment?.message || t('comments.toasts.updateError'));
      }
    } catch (err: any) {
      toast.error(t('comments.toasts.updateError'));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('comments.toasts.deleteConfirm'))) return;

    try {
      // Logic for actual removal if backend supports it via status
      await manageComment({
        variables: { id: commentId, status: 'REMOVED' },
      });
      toast.success(t('comments.toasts.updateSuccess'));
      refetch();
    } catch (err: any) {
      toast.error(t('comments.toasts.updateError'));
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-muted-foreground">{t('comments.loading')}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">{t('comments.error', { error: error.message })}</div>;
  }

  const rawComments = data?.comments?.edges?.map(edge => edge?.node) || [];
  const comments: Comment[] = rawComments.filter((node): node is NonNullable<typeof node> => node != null) as Comment[];
  
  const filteredComments = comments.filter((comment) =>
    comment.content.toLowerCase().includes(search.toLowerCase()) ||
    comment.nickname.toLowerCase().includes(search.toLowerCase()) ||
    comment.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 -ml-2">
                <ArrowLeft className="h-4 w-4" />
             </Button>
             <h1 className="text-2xl font-bold">
               {articleId ? t('comments.titleArticle') : t('comments.title')}
             </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('comments.description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('comments.search')}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">{t('comments.allStatuses')}</option>
          <option value="APPROVED">{t('comments.status.approved')}</option>
          <option value="PENDING">{t('comments.status.pending')}</option>
          <option value="SPAM">{t('comments.status.spam')}</option>
        </select>
      </div>

      {/* Content */}
      {filteredComments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">{t('comments.noComments')}</p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <MobileCommentsList
          comments={filteredComments}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteComment}
        />
      ) : (
        <CommentsTable
          comments={filteredComments}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteComment}
        />
      )}
    </div>
  );
}

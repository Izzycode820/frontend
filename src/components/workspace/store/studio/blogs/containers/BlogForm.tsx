'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CreateBlogDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/CreateBlog.generated';
import { UpdateBlogDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/UpdateBlog.generated';
import { GetBlogDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlog.generated';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';

export default function BlogForm() {
  const t = useTranslations('Studio');
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');
  const isEditing = !!blogId;

  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  const [title, setTitle] = useState('');
  const [commentPolicy, setCommentPolicy] = useState<string>('moderate'); // Backend expects: 'no', 'moderate', 'auto'

  const [createBlog, { loading: isCreating }] = useMutation(CreateBlogDocument, {
    refetchQueries: [{ query: GetBlogsDocument }],
    awaitRefetchQueries: true, // Wait for cache update before navigation
  });

  const [updateBlog, { loading: isUpdating }] = useMutation(UpdateBlogDocument, {
    refetchQueries: [{ query: GetBlogsDocument }],
    awaitRefetchQueries: true, // Wait for cache update before navigation
  });

  const { data: blogData, loading: isLoadingData } = useQuery(GetBlogDocument, {
    variables: { id: blogId || '' },
    skip: !isEditing,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (blogData?.blog) {
      setTitle(blogData.blog.title || '');
      setCommentPolicy(blogData.blog.commentPolicy || 'moderate');
    }
  }, [blogData]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error(t('blogs.form.toasts.validation'));
      return;
    }

    const input = {
      title,
      commentPolicy,
    };

    try {
      if (isEditing) {
        const result = await updateBlog({ variables: { id: blogId, input } });
        if (result.data?.updateBlog?.success) {
          toast.success(t('blogs.form.toasts.updateSuccess'));
          router.back();
        } else {
          toast.error(result.data?.updateBlog?.message || t('blogs.form.toasts.updateError'));
        }
      } else {
        const result = await createBlog({ variables: { input } });
        if (result.data?.createBlog?.success) {
          toast.success(t('blogs.form.toasts.createSuccess'));
          router.back();
        } else {
          toast.error(result.data?.createBlog?.message || t('blogs.form.toasts.createError'));
        }
      }
    } catch (err: any) {
      toast.error(t('blogs.form.toasts.updateError') + ': ' + err.message);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6 px-4 lg:px-6 py-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:pl-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('common.save')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-2">
            <Label>{t('blogs.form.title')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('blogs.form.placeholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('blogs.form.help')}
            </p>
          </div>

          <div className="grid gap-3">
            <Label>{t('blogs.form.policy')}</Label>
            <RadioGroup value={commentPolicy} onValueChange={(value: any) => setCommentPolicy(value)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="auto" id="enabled" className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                    {t('blogs.form.allowComments')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('blogs.form.allowHelp')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="moderate" id="moderated" className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="moderated" className="text-sm font-medium cursor-pointer">
                    {t('blogs.form.moderateComments')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('blogs.form.moderateHelp')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="no" id="disabled" className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="disabled" className="text-sm font-medium cursor-pointer">
                    {t('blogs.form.disableComments')}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t('blogs.form.disableHelp')}
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

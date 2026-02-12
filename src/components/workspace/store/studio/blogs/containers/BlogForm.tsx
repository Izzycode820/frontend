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

import { CreateBlogDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/CreateBlog.generated';
import { UpdateBlogDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/UpdateBlog.generated';
import { GetBlogDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlog.generated';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';

export default function BlogForm() {
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
      toast.error('Title is required');
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
          toast.success('Blog updated');
          router.back();
        } else {
          toast.error(result.data?.updateBlog?.message || 'Failed to update blog');
        }
      } else {
        const result = await createBlog({ variables: { input } });
        if (result.data?.createBlog?.success) {
          toast.success('Blog created');
          router.back();
        } else {
          toast.error(result.data?.createBlog?.message || 'Failed to create blog');
        }
      }
    } catch (err: any) {
      toast.error('Failed to save blog: ' + err.message);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6 px-4 lg:px-6 py-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:pl-0 hover:bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-2">
            <Label>Blog title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., News, Updates, Announcements"
            />
            <p className="text-xs text-muted-foreground">
              A blog is a collection of related articles. Customers can view all articles in a blog.
            </p>
          </div>

          <div className="grid gap-3">
            <Label>Comment policy</Label>
            <RadioGroup value={commentPolicy} onValueChange={(value: any) => setCommentPolicy(value)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="auto" id="enabled" className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                    Allow comments
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Comments are published automatically
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="moderate" id="moderated" className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="moderated" className="text-sm font-medium cursor-pointer">
                    Moderate comments
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Comments must be approved before publishing
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="no" id="disabled" className="mt-0.5" />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="disabled" className="text-sm font-medium cursor-pointer">
                    Disable comments
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Don't allow comments on articles in this blog
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

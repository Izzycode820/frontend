'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Plus, Search, Pencil, Trash, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';
import { DeleteBlogDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/DeleteBlog.generated';
import { STORE_ROUTES } from '@/routes/domains/workspace';

export default function BlogsListContainer() {
  const t = useTranslations('Studio');
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const [search, setSearch] = useState('');

  const [deleteBlog] = useMutation(DeleteBlogDocument);

  const { data, loading, error, refetch } = useQuery(GetBlogsDocument, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const handleAddBlog = () => {
    router.push(STORE_ROUTES.STUDIO.BLOGS.MANAGE_FORM(currentWorkspace?.id || ''));
  };

  const handleEditBlog = (blogId: string) => {
    router.push(`${STORE_ROUTES.STUDIO.BLOGS.MANAGE(currentWorkspace?.id || '')}?id=${blogId}`);
  };

  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    if (!confirm(t('blogs.form.toasts.deleteConfirm', { title: blogTitle }))) return;

    try {
      await deleteBlog({ variables: { id: blogId } });
      toast.success(t('blogs.form.toasts.deleteSuccess'));
      refetch();
    } catch (err: any) {
      toast.error(t('blogs.form.toasts.deleteError', { error: err.message }));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">{t('blogs.loading')}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">{t('blogs.error', { error: error.message })}</div>;
  }

  const blogs = data?.blogs?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  const filteredBlogs = blogs.filter(blog =>
    blog?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 px-4 lg:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('blogs.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('blogs.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(STORE_ROUTES.STUDIO.BLOGS.LIST(currentWorkspace?.id || ''))}
          >
            {t('blogs.viewPosts')}
          </Button>
          <Button onClick={handleAddBlog}>
            <Plus className="mr-2 h-4 w-4" /> {t('blogs.add')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('blogs.search')}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">{t('blogs.noBlogs')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBlogs.map((blog: any) => (
            <Card key={blog.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground font-mono">/{blog.handle}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {t('blogs.articles', { count: blog.articleCount || 0 })}
                      </span>
                      <span>
                        {t('blogs.comments', { policy: blog.commentPolicy.toLowerCase().replace('_', ' ') })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBlog(blog.id)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteBlog(blog.id, blog.title)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

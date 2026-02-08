'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/shadcn/use-mobile';

import type { GetArticlesQuery } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetArticles.generated';
import { ArticlesTable, type Article } from './ArticlesTable';
import { MobileArticlesList } from './MobileArticlesList';
import { GetArticlesDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetArticles.generated';
import { DeleteArticleDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/DeleteArticle.generated';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';
import { STORE_ROUTES } from '@/routes/domains/workspace';

export default function ArticlesListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isMobile = useIsMobile();
  
  const [search, setSearch] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [deleteArticle] = useMutation(DeleteArticleDocument);

  // Fetch blogs for filter dropdown
  const { data: blogsData } = useQuery(GetBlogsDocument, {
    fetchPolicy: 'cache-first',
  });

  // Fetch articles with filters
  const { data, loading, error, refetch } = useQuery(GetArticlesDocument, {
    variables: {
      blogId: selectedBlog || undefined,
      status: selectedStatus || undefined,
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const handleAddArticle = () => {
    router.push(STORE_ROUTES.STUDIO.BLOGS.NEW(currentWorkspace?.id || ''));
  };

  const handleEditArticle = (articleId: string) => {
    router.push(STORE_ROUTES.STUDIO.BLOGS.EDIT(currentWorkspace?.id || '', articleId));
  };

  const handleManageBlogs = () => {
    router.push(STORE_ROUTES.STUDIO.BLOGS.MANAGE(currentWorkspace?.id || ''));
  };

  const handleManageComments = () => {
    router.push(STORE_ROUTES.STUDIO.BLOGS.COMMENTS(currentWorkspace?.id || ''));
  };

  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!confirm(`Delete "${articleTitle}"? This action cannot be undone.`)) return;

    try {
      await deleteArticle({ variables: { id: articleId } });
      toast.success('Article deleted successfully');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete article: ' + err.message);
    }
  };

  if (loading && !data) {
    return <div className="p-8 text-center text-muted-foreground">Loading articles...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">Error loading articles: {error.message}</div>;
  }

  // Extract and filter articles
  const rawArticles = data?.articles?.edges?.map(edge => edge?.node) || [];
  const articles: Article[] = rawArticles.filter((node): node is NonNullable<typeof node> => node != null);
  
  const blogs = blogsData?.blogs?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  
  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog posts</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage blog articles for your store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleManageBlogs}>
            Manage blogs
          </Button>
          <Button variant="outline" onClick={handleManageComments}>
            Manage comments
          </Button>
          <Button onClick={handleAddArticle}>
            <Plus className="mr-2 h-4 w-4" /> Add blog post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={selectedBlog}
          onChange={(e) => setSelectedBlog(e.target.value)}
        >
          <option value="">All blogs</option>
          {blogs.map((blog: any) => (
            <option key={blog.id} value={blog.id}>
              {blog.title}
            </option>
          ))}
        </select>

        <select
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Content */}
      {filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No articles found.</p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <MobileArticlesList
          articles={filteredArticles}
          onEdit={handleEditArticle}
          onDelete={handleDeleteArticle}
        />
      ) : (
        <ArticlesTable
          articles={filteredArticles}
          onEdit={handleEditArticle}
          onDelete={handleDeleteArticle}
        />
      )}
    </div>
  );
}

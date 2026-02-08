'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';

import { RichTextEditor } from '@/components/workspace/store/shared/RichTextEditor';
import { ArticleSEOSection } from './ArticleSEOSection';
import { CreateArticleDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/CreateArticle.generated';
import { UpdateArticleDocument } from '@/services/graphql/admin-store/mutations/blogs/__generated__/UpdateArticle.generated';
import { GetArticleDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetArticle.generated';
import { GetArticlesDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetArticles.generated';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';
import { STORE_ROUTES } from '@/routes/domains/workspace';

interface ArticleFormProps {
  articleId?: string;
}

export default function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isEditing = !!articleId;

  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [summaryHtml, setSummaryHtml] = useState('');
  const [author, setAuthor] = useState('');
  const [blogId, setBlogId] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [image, setImage] = useState('');
  const [templateSuffix, setTemplateSuffix] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [createArticle, { loading: isCreating }] = useMutation(CreateArticleDocument, {
    refetchQueries: [{ query: GetArticlesDocument, variables: {} }],
  });

  const [updateArticle, { loading: isUpdating }] = useMutation(UpdateArticleDocument);

  const { data: articleData, loading: isLoadingData } = useQuery(GetArticleDocument, {
    variables: { id: articleId || '' },
    skip: !isEditing,
    fetchPolicy: 'cache-and-network',
  });

  const { data: blogsData } = useQuery(GetBlogsDocument, {
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (articleData?.article) {
      const article = articleData.article;
      setTitle(article.title || '');
      setHandle(article.handle || '');
      setBodyHtml(article.bodyHtml || '');
      setSummaryHtml(article.summaryHtml || '');
      setAuthor(article.author || '');
      setBlogId(article.blog?.id || '');
      setTags(article.tags ? JSON.stringify(article.tags) : '');
      setIsPublished(article.isPublished || false);
      setImage(article.image || '');
      setTemplateSuffix(article.templateSuffix || '');
      setMetaTitle(article.metaTitle || '');
      setMetaDescription(article.metaDescription || '');
    }
  }, [articleData]);

  // Auto-generate handle from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedHandle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setHandle(generatedHandle);
    }
  }, [title, isEditing]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!blogId) {
      toast.error('Please select a blog');
      return;
    }

    const input: any = {
      title,
      handle,
      bodyHtml,
      summaryHtml,
      author,
      blogId,
      tags,
      isPublished,
      image,
      templateSuffix,
      metaTitle,
      metaDescription,
    };

    try {
      if (isEditing) {
        await updateArticle({ variables: { id: articleId, input } });
        toast.success('Article updated');
      } else {
        await createArticle({ variables: { input } });
        toast.success('Article created');
      }
      router.push(STORE_ROUTES.STUDIO.BLOGS.LIST(currentWorkspace?.id || ''));
    } catch (err: any) {
      toast.error('Failed to save article: ' + err.message);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  const blogs = blogsData?.blogs?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  const selectedBlog = blogs.find((blog: any) => blog.id === blogId);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> {isEditing ? 'Edit' : 'Add'} blog post
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blog about your latest products or deals"
                />
              </div>

              <div className="grid gap-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={bodyHtml}
                  onChange={setBodyHtml}
                  placeholder="Write your article content..."
                  minHeight="min-h-[300px]"
                />
              </div>

              <div className="grid gap-2">
                <Label>Excerpt</Label>
                <Input
                  value={summaryHtml}
                  onChange={(e) => setSummaryHtml(e.target.value)}
                  placeholder="Add a summary of the post to appear on your home page or blog"
                />
                <p className="text-xs text-muted-foreground">
                  Shown on blog listing pages and search results
                </p>
              </div>
            </CardContent>
          </Card>

          <ArticleSEOSection
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            handle={handle}
            blogHandle={selectedBlog?.handle || ''}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={isPublished ? 'visible' : 'hidden'} onValueChange={(val) => setIsPublished(val === 'visible')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visible" id="visible" />
                  <Label htmlFor="visible" className="font-normal cursor-pointer">
                    Visible
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hidden" id="hidden" />
                  <Label htmlFor="hidden" className="font-normal cursor-pointer">
                    Hidden
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Button variant="outline" size="sm">Add image</Button>
                <p className="text-xs text-muted-foreground mt-2">or drop an image to upload</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Author</Label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-2">
                <Label>Blog</Label>
                <select
                  className="h-10 w-full px-3 rounded-md border border-input bg-background text-sm"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                >
                  <option value="">Select a blog</option>
                  {blogs.map((blog: any) => (
                    <option key={blog.id} value={blog.id}>
                      {blog.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theme template</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="h-10 w-full px-3 rounded-md border border-input bg-background text-sm"
                value={templateSuffix}
                onChange={(e) => setTemplateSuffix(e.target.value)}
              >
                <option value="">Default blog post</option>
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn-ui/popover';
import { Calendar } from '@/components/shadcn-ui/calendar';
import { ArrowLeft, Loader2, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { RichTextEditor } from '@/components/workspace/store/shared/RichTextEditor';
import { FilesAndMediaModal } from '@/components/workspace/store/shared/files-and-media';
import type { MediaItem, MediaSelection } from '@/components/workspace/store/shared/files-and-media';
import { ArticleSEOSection } from './seo/ArticleSEOSection';
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
  const [visibilityMode, setVisibilityMode] = useState<'visible' | 'hidden' | 'scheduled'>('visible');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(undefined);
  const [image, setImage] = useState('');
  const [mediaItem, setMediaItem] = useState<MediaItem | undefined>(undefined);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [templateSuffix, setTemplateSuffix] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [createArticle, { loading: isCreating }] = useMutation(CreateArticleDocument, {
    refetchQueries: [{ query: GetArticlesDocument, variables: {} }],
    awaitRefetchQueries: true, // Wait for cache update before navigation
  });

  const [updateArticle, { loading: isUpdating }] = useMutation(UpdateArticleDocument, {
    refetchQueries: [{ query: GetArticlesDocument, variables: {} }],
    awaitRefetchQueries: true, // Wait for cache update before navigation
  });

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
      
      // Set visibility mode based on publishedAt
      if (article.publishedAt) {
        const pubDate = new Date(article.publishedAt);
        if (pubDate > new Date()) {
          setVisibilityMode('scheduled');
          setPublishedAt(pubDate);
        } else {
          setVisibilityMode(article.isPublished ? 'visible' : 'hidden');
        }
      } else {
        setVisibilityMode(article.isPublished ? 'visible' : 'hidden');
      }
      
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

    // Handle visibility and publishing logic
    let finalIsPublished = false;
    let finalPublishedAt: string | null = null;

    if (visibilityMode === 'visible') {
      finalIsPublished = true;
      finalPublishedAt = new Date().toISOString();
    } else if (visibilityMode === 'scheduled') {
      if (!publishedAt) {
        toast.error('Please select a publish date');
        return;
      }
      finalIsPublished = false; // Will be published at scheduled time
      finalPublishedAt = publishedAt.toISOString();
    } else {
      // hidden
      finalIsPublished = false;
      finalPublishedAt = null;
    }

    const input: any = {
      title,
      bodyHtml,
      summaryHtml,
      author,
      blogId,
      tags,
      isPublished: finalIsPublished,
      publishedAt: finalPublishedAt,
      image: mediaItem?.url || image,
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

  const handleMediaSelect = (selection: MediaSelection) => {
    const selectedItem = selection.newUploads[0] || selection.existingUploads[0];
    if (selectedItem) {
      setMediaItem(selectedItem);
    }
    setShowMediaModal(false);
  };

  const handleImageRemove = () => {
    setMediaItem(undefined);
    setImage('');
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
            articleTitle={title}
            articleContent={bodyHtml || summaryHtml}
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
            <CardContent className="space-y-4">
              <RadioGroup value={visibilityMode} onValueChange={(val: any) => setVisibilityMode(val)}>
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="font-normal cursor-pointer">
                    Scheduled
                  </Label>
                </div>
              </RadioGroup>

              {visibilityMode === 'scheduled' && (
                <div className="pt-2">
                  <Label className="text-sm mb-2">Publish date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !publishedAt && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publishedAt ? format(publishedAt, 'PPP p') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={publishedAt}
                        onSelect={setPublishedAt}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
            </CardHeader>
            <CardContent>
              {mediaItem || image ? (
                <div className="relative group">
                  <img
                    src={mediaItem?.thumbnailUrl || mediaItem?.url || image}
                    alt="Article image"
                    className="w-full aspect-square rounded-md object-cover border"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-12 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMediaModal(true)}
                    className="mb-2"
                  >
                    Add image
                  </Button>
                  <p className="text-xs text-muted-foreground">or drop an image to upload</p>
                </div>
              )}
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
                <Select value={blogId} onValueChange={setBlogId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a blog" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogs.map((blog: any) => (
                      <SelectItem key={blog.id} value={blog.id}>
                        {blog.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Select value={templateSuffix} onValueChange={setTemplateSuffix}>
                <SelectTrigger>
                  <SelectValue placeholder="Default template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  {/* <SelectItem value="alternate">Alternate</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem> */}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Assign a template from your current theme to define how the article is displayed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Modal */}
      <FilesAndMediaModal
        open={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        maxSelection={1}
      />
    </div>
  );
}

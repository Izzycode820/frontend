'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Button } from '@/components/shadcn-ui/button';
import { Card } from '@/components/shadcn-ui/card';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';

// Sections
import { PageTitleSection } from './PageTitleSection';
import { PageSEOSection } from './seo';
import { PageVisibilitySection } from './PageVisibilitySection';

// Generated Documents
import { CreatePageDocument } from '@/services/graphql/admin-store/mutations/pages/__generated__/CreatePage.generated';
import { UpdatePageDocument } from '@/services/graphql/admin-store/mutations/pages/__generated__/UpdatePage.generated';
import { GetPageDocument }    from '@/services/graphql/admin-store/queries/pages/__generated__/GetPage.generated';

interface PageFormProps {
  pageId?: string; // If present, we are editing
}

export default function PageForm({ pageId }: PageFormProps) {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isEditing = !!pageId;

  // Form State
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [handle, setHandle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const [createPage, { loading: isCreating }] = useMutation(CreatePageDocument);
  const [updatePage, { loading: isUpdating }] = useMutation(UpdatePageDocument);

  // Query (if editing)
  const { data: pageData, loading: isLoadingData } = useQuery(GetPageDocument, {
     variables: { id: (pageId || '') as string },
     skip: !isEditing
  });

  useEffect(() => {
    if (pageData?.page) {
        setTitle(pageData.page.title || '');
        setBodyHtml(pageData.page.bodyHtml || '');
        setSeoTitle(pageData.page.metaTitle || '');
        setSeoDescription(pageData.page.metaDescription || '');
        setHandle(pageData.page.handle || '');
        setIsPublished(pageData.page.isPublished || false);
        setPublishedAt(pageData.page.publishedAt || null);
    }
  }, [pageData]);


  const validate = () => {
     const newErrors: Record<string, string> = {};
     if (!title.trim()) newErrors.title = 'Title is required';
     if (!handle.trim()) newErrors.handle = 'Handle is required';
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
     if (!validate()) {
        toast.error('Please fix the errors in the form');
        return;
     }

     // Construct Input 
     const input = {
        title,
        bodyHtml,
        metaTitle: seoTitle,     
        metaDescription: seoDescription, 
        handle,
        isPublished,
        publishedAt
     };

     try {
        if (isEditing) {
           // UpdatePage takes: id, input 
           const { data } = await updatePage({
              variables: { 
                 id: pageId!, 
                 input
              }
           });
           
            if (!data?.pageUpdate?.success) {
                toast.error(data?.pageUpdate?.error || 'Update failed');
            } else {
                toast.success('Page updated successfully');
                router.push(`/workspace/${currentWorkspace?.id}/store/studio/pages`);
            }
        } else {
           // CreatePage takes: workspaceId, input
           const { data } = await createPage({
              variables: { 
                 input,
                 workspaceId: currentWorkspace?.id || ''
              }
           });
           
            if (!data?.pageCreate?.success) {
                toast.error(data?.pageCreate?.error || 'Create failed');
            } else {
                toast.success('Page created successfully');
                router.push(`/workspace/${currentWorkspace?.id}/store/studio/pages`);
            }
        }
     } catch (err: unknown) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Something went wrong');
     }
  };


  if (isLoadingData) {
     return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
       
       <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:pl-0 hover:bg-transparent">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages
            </Button>
       </div>

       <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form Column */}
          <div className="flex-1 max-w-3xl space-y-6">
             <PageTitleSection
                title={title}
                onTitleChange={setTitle}
                body={bodyHtml}
                onBodyChange={setBodyHtml}
                errors={errors}
             />

             <PageSEOSection
                pageTitle={title}
                pageContent={bodyHtml}
                seoTitle={seoTitle}
                onSeoTitleChange={setSeoTitle}
                seoDescription={seoDescription}
                onSeoDescriptionChange={setSeoDescription}
                handle={handle}
                onHandleChange={setHandle}
             />
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-96 lg:flex-shrink-0 space-y-6">
             
             <PageVisibilitySection
                isPublished={isPublished}
                publishedAt={publishedAt}
                onVisibilityChange={setIsPublished}
                onDateChange={setPublishedAt}
             />

             {/* Action Buttons */}
             <Card className="p-4 space-y-3 sticky top-6">
                <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={isCreating || isUpdating}
                >
                    {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Update Page' : 'Save Page'}
                </Button>
                <Button
                   variant="outline"
                   onClick={() => router.back()}
                   className="w-full"
                >
                   Cancel
                </Button>
             </Card>
          </div>
       </div>
    </div>
  );
}

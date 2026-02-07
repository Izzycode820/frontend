'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Button } from '@/components/shadcn-ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

// Fixed relative imports assuming PageForm is in .../pages/form/PageForm.tsx
import { PageTitleSection } from './PageTitleSection';
import { PageSEOSection } from './PageSEOSection';

// Placeholder imports for generated documents - replace when codegen runs
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
  const [isPublished, setIsPublished] = useState(false); // TODO: Add visibility toggle in UI

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const [createPage, { loading: isCreating }] = useMutation(CreatePageDocument);
  const [updatePage, { loading: isUpdating }] = useMutation(UpdatePageDocument);

  // Query (if editing)
  const { data: pageData, loading: isLoadingData } = useQuery(GetPageDocument, {
     variables: { id: pageId },
     skip: !isEditing,
     onCompleted: (data) => {
        if(data?.page) {
           setTitle(data.page.title || '');
           setBodyHtml(data.page.bodyHtml || '');
           setSeoTitle(data.page.seoTitle || '');
           setSeoDescription(data.page.seoDescription || '');
           setHandle(data.page.handle || '');
           setIsPublished(data.page.isPublished || false);
        }
     }
  });


  const validate = () => {
     const newErrors: Record<string, string> = {};
     if (!title.trim()) newErrors.title = 'Title is required';
     if (!handle.trim()) newErrors.handle = 'Handle is required';
     // Body can be empty? Let's say yes for now.
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
     if (!validate()) {
        toast.error('Please fix the errors in the form');
        return;
     }

     const input = {
        title,
        bodyHtml,
        seoTitle,
        seoDescription,
        handle,
        isPublished,
        workspaceId: currentWorkspace?.id // Ensure this is passed if required by API, or handled by context/middleware
     };

     try {
        if (isEditing) {
           const { data } = await updatePage({
              variables: { id: pageId, input }
           });
           if (data?.pageUpdate?.userErrors?.length > 0) {
               toast.error(data.pageUpdate.userErrors[0].message);
           } else {
               toast.success('Page updated successfully');
               router.push(`/workspace/${currentWorkspace?.id}/store/themes`); // Go back to list
           }
        } else {
           const { data } = await createPage({
              variables: { input }
           });
           if (data?.pageCreate?.userErrors?.length > 0) {
               toast.error(data.pageCreate.userErrors[0].message);
           } else {
               toast.success('Page created successfully');
               router.push(`/workspace/${currentWorkspace?.id}/store/themes`);
           }
        }
     } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Something went wrong');
     }
  };

  // Auto-generate handle from title if creating and handle is empty
  useEffect(() => {
     if (!isEditing && title && !handle) {
         const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
         setHandle(slug);
     }
  }, [title, isEditing, handle]);


  if (isLoadingData) {
     return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
       {/* Actions Bar */}
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

       <div className="grid gap-6">
          <PageTitleSection
             title={title}
             onTitleChange={setTitle}
             body={bodyHtml}
             onBodyChange={setBodyHtml}
             errors={errors}
          />

          <PageSEOSection
             seoTitle={seoTitle}
             onSeoTitleChange={setSeoTitle}
             seoDescription={seoDescription}
             onSeoDescriptionChange={setSeoDescription}
             handle={handle}
             onHandleChange={setHandle}
          />
       </div>
    </div>
  );
}

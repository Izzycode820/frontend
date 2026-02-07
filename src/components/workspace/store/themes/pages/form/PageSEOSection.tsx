'use client';

import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shadcn-ui/card';

interface PageSEOSectionProps {
  seoTitle: string;
  onSeoTitleChange: (value: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (value: string) => void;
  handle: string;
  onHandleChange: (value: string) => void;
}

export function PageSEOSection({
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  handle,
  onHandleChange
}: PageSEOSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search engine listing preview</CardTitle>
        <CardDescription>
          Add a title and description to see how this page might appear in search engine listings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* Preview Box */}
         <div className="space-y-1">
             <div className="text-sm text-blue-600 font-medium truncate">
                {seoTitle || 'Page Title'}
             </div>
             <div className="text-sm text-green-700 truncate">
                https://huzilerz.com/pages/{handle || 'page-handle'}
             </div>
             <div className="text-sm text-muted-foreground line-clamp-2">
                {seoDescription || 'Add a description to see how this page might appear in search engine results.'}
             </div>
         </div>

         <div className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">Page Title</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => onSeoTitleChange(e.target.value)}
                maxLength={70}
              />
              <p className="text-xs text-muted-foreground text-right">{seoTitle.length} of 70 characters used</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Description</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => onSeoDescriptionChange(e.target.value)}
                maxLength={320}
                className="h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{seoDescription.length} of 320 characters used</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">URL Handle</Label>
              <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    /pages/
                  </span>
                  <Input
                    id="handle"
                    value={handle}
                    onChange={(e) => onHandleChange(e.target.value)}
                    className="rounded-l-none"
                  />
              </div>
            </div>
         </div>
      </CardContent>
    </Card>
  );
}

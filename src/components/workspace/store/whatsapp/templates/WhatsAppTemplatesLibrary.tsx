'use client';

import React from 'react';
import { WhatsAppTemplateCard } from './WhatsAppTemplateCard';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

interface LibraryProps {
  templates: any[];
  loading: boolean;
  onPreview: (template: any) => void;
  onImport: (id: string) => void;
  importingId: string | null;
  searchQuery: string;
}

export function WhatsAppTemplatesLibrary({ 
  templates, 
  loading, 
  onPreview, 
  onImport, 
  importingId,
  searchQuery 
}: LibraryProps) {
  
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4 border rounded-xl p-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredTemplates.length === 0) {
    return (
      <div className="text-center py-20 border rounded-xl border-dashed">
        <p className="text-muted-foreground">No templates found in the library.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map((template) => (
        <WhatsAppTemplateCard 
          key={template.id} 
          template={template} 
          onPreview={onPreview}
          onAction={() => onImport(template.id)}
          actionText="Import"
          isActionLoading={importingId === template.id}
        />
      ))}
    </div>
  );
}

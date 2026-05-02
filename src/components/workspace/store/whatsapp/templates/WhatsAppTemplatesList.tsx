'use client';

import React from 'react';
import { WhatsAppTemplateCard } from './WhatsAppTemplateCard';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

interface ListProps {
  templates: any[];
  loading: boolean;
  status: string;
  onPreview: (template: any) => void;
  searchQuery: string;
}

export function WhatsAppTemplatesList({ 
  templates, 
  loading, 
  status, 
  onPreview,
  searchQuery 
}: ListProps) {
  
  // Note: Local filtering by status because the query GetMerchantTemplates doesn't currently accept status as a variable
  // based on flow.md, but if it does later, we can move this to the query.
  const filteredTemplates = templates.filter(t => {
    const matchesStatus = status === 'ALL' || t.status === status;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 border rounded-xl p-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between gap-2">
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
        <p className="text-muted-foreground">No templates found for {status.toLowerCase()} status.</p>
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
        />
      ))}
    </div>
  );
}

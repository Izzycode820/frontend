'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Eye, Plus } from 'lucide-react';

interface CardProps {
  template: any;
  onPreview: (template: any) => void;
  onAction?: () => void;
  actionText?: string;
  isActionLoading?: boolean;
}

export function WhatsAppTemplateCard({ 
  template, 
  onPreview, 
  onAction, 
  actionText,
  isActionLoading 
}: CardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-muted text-muted-foreground border-transparent';
    }
  };

  // Use the direct bodyText field from GraphQL
  const bodyPreview = template.bodyText || "No content available";

  return (
    <Card className="overflow-hidden border-muted-foreground/20 hover:border-primary/50 transition-colors shadow-none">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md">
            {template.category}
          </Badge>
          {template.status && (
            <Badge className={`text-[10px] variant-outline ${getStatusColor(template.status)} border rounded-full`}>
              {template.status}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base font-semibold mt-2 truncate">
          {template.name.replace(/_/g, ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3rem] italic">
          "{bodyPreview}"
        </p>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs gap-1.5" 
          onClick={() => onPreview(template)}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </Button>
        {onAction && (
          <Button 
            size="sm" 
            className="flex-1 text-xs gap-1.5"
            onClick={onAction}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {actionText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

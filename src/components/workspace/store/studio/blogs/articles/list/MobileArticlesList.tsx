'use client';

import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Pencil, Trash, Eye } from 'lucide-react';
import { Article } from './ArticlesTable';

interface MobileArticlesListProps {
  articles: Article[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export function MobileArticlesList({ articles, onEdit, onDelete }: MobileArticlesListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <div className="font-semibold">{article.title}</div>
                <div className="text-xs text-muted-foreground font-mono">/{article.handle}</div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {article.isPublished ? (
                  <Badge variant="default" className="bg-green-600">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
                <span className="text-xs text-muted-foreground">{article.blog.title}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{article.author}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                Published: {formatDate(article.publishedAt || article.createdAt)}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(article.id)}
                  className="flex-1"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                {article.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(article.url!, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onDelete(article.id, article.title)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

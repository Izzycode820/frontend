'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { MoreHorizontal, Package, Edit2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveThemeCardProps {
  id: string;
  themeName: string;
  previewImage: string;
  version: string;
  createdAt: string;
  onEditTheme: () => void;
  onDuplicate?: () => void;
  onRename?: () => void;
}

export function ActiveThemeCard({
  id,
  themeName,
  previewImage,
  version,
  createdAt,
  onEditTheme,
  onDuplicate,
  onRename,
}: ActiveThemeCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Preview Image */}
        <div className="mb-6">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-border bg-muted/30">
            {previewImage ? (
              <Image
                src={previewImage}
                alt={themeName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Theme Info */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold">{themeName}</h3>
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                Current theme
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Added: {formatDate(createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Version {version}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info('Customize coming soon')}>
                  Customize
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onRename && (
                  <DropdownMenuItem onClick={onRename}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={onEditTheme} variant="default">
              Edit theme
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

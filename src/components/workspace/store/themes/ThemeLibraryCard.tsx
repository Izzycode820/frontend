'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { Calendar, MoreHorizontal, Package, Edit2, Eye, Copy, Trash2, DownloadCloud, History } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeVersionHistoryModal } from './modals/ThemeVersionHistoryModal';
import { ApplyThemeUpdateModal } from './modals/ApplyThemeUpdateModal';

interface ThemeLibraryCardProps {
  id: string; // customization ID
  themeName: string;
  previewImage: string;
  currentVersion: string;
  activeVersionNumber: string;
  activeVersionId: string;
  createdAt: string;
  isPublished: boolean | null;
  canDelete: boolean | null;
  isPublishing?: boolean;
  onEditTheme: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
  onUpdateSuccess?: () => void;
  onRollbackSuccess?: () => void;
}

export function ThemeLibraryCard({
  id,
  themeName,
  previewImage,
  currentVersion,
  activeVersionNumber,
  activeVersionId,
  createdAt,
  isPublished,
  canDelete,
  isPublishing = false,
  onEditTheme,
  onPublish,
  onDelete,
  onUpdateSuccess,
  onRollbackSuccess,
}: ThemeLibraryCardProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const hasUpdate = activeVersionNumber && currentVersion && activeVersionNumber !== currentVersion;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Preview Image */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-24 rounded-md overflow-hidden border border-gray-200">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt={themeName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Theme Info */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-semibold text-gray-900 truncate">
                    {themeName}
                  </h4>
                  {hasUpdate && (
                    <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-blue-100 text-blue-800 border-none">
                      Update Available
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Added: {formatDate(createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>v{activeVersionNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isPublished && onPublish && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={onEditTheme}
                disabled={isPublishing}
              >
                Customize
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {hasUpdate && (
                    <DropdownMenuItem 
                      onClick={() => setIsUpdateModalOpen(true)}
                      className="text-blue-600 font-medium"
                    >
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Update to v{currentVersion}
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => setIsHistoryModalOpen(true)}>
                    <History className="mr-2 h-4 w-4" />
                    Version History
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => toast.info('Rename coming soon')}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('Preview coming soon')}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('Duplicate coming soon')}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  
                  {canDelete && onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApplyThemeUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        customizationId={id}
        themeName={themeName}
        currentVersion={activeVersionNumber}
        newVersion={currentVersion}
        onUpdateSuccess={onUpdateSuccess}
      />

      <ThemeVersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        customizationId={id}
        themeName={themeName}
        activeVersionId={activeVersionId}
        onRollbackSuccess={onRollbackSuccess}
      />
    </>
  );
}

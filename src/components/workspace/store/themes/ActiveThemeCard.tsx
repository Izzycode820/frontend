'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import { Calendar, Package, DownloadCloud, History } from 'lucide-react';
import { ThemeVersionHistoryModal } from './modals/ThemeVersionHistoryModal';
import { ApplyThemeUpdateModal } from './modals/ApplyThemeUpdateModal';

interface ActiveThemeCardProps {
  id: string; // customization ID
  themeName: string;
  previewImage: string;
  currentVersion: string;
  activeVersionNumber: string;
  activeVersionId: string;
  createdAt: string;
  onEditTheme: () => void;
  onUpdateSuccess?: () => void;
  onRollbackSuccess?: () => void;
}

export function ActiveThemeCard({
  id,
  themeName,
  previewImage,
  currentVersion,
  activeVersionNumber,
  activeVersionId,
  createdAt,
  onEditTheme,
  onUpdateSuccess,
  onRollbackSuccess,
}: ActiveThemeCardProps) {
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
      <Card className="overflow-hidden border-2 border-primary/10">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Preview Image */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-40 rounded-lg overflow-hidden border border-gray-200">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt={themeName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Theme Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{themeName}</h3>
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Live Store
                  </Badge>
                  {hasUpdate && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none flex items-center gap-1">
                      <DownloadCloud className="w-3 h-3" />
                      Update available
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Added: {formatDate(createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>Version {activeVersionNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button onClick={onEditTheme} size="default" className="w-[140px]">
                  Customize
                </Button>
                
                {hasUpdate && (
                  <Button 
                    variant="default" 
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Update to v{currentVersion}
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="gap-2 ml-auto text-muted-foreground hover:text-foreground"
                >
                  <History className="w-4 h-4" />
                  History
                </Button>
              </div>
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

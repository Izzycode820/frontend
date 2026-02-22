'use client';

import React from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/shadcn-ui/dialog';
import { Button } from '@/components/shadcn-ui/button';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Badge } from '@/components/shadcn-ui/badge';
import { History, ArrowLeftCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeVersionHistoryDocument } from '@/services/graphql/themes/queries/mythemes/__generated__/themeVersionHistory.generated';
import { RollbackThemeVersionDocument } from '@/services/graphql/themes/mutations/mythemes/__generated__/rollbackThemeVersion.generated';

interface ThemeVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customizationId: string;
  themeName: string;
  activeVersionId: string;
  onRollbackSuccess?: () => void;
}

export function ThemeVersionHistoryModal({
  isOpen,
  onClose,
  customizationId,
  themeName,
  activeVersionId,
  onRollbackSuccess,
}: ThemeVersionHistoryModalProps) {
  // Fetch history
  const { data, loading, refetch } = useQuery(ThemeVersionHistoryDocument, {
    variables: { customizationId },
    skip: !isOpen || !customizationId,
    fetchPolicy: 'cache-and-network',
  });

  // Rollback mutation
  const [rollbackThemeVersion, { loading: isRollingBack }] = useMutation(RollbackThemeVersionDocument, {
    onCompleted: (result) => {
      if (result.rollbackThemeVersion?.success) {
        toast.success(`Successfully restored version.`);
        onRollbackSuccess?.();
        onClose();
      } else {
        toast.error(result.rollbackThemeVersion?.error || 'Failed to rollback version');
      }
    },
    onError: (err) => {
      toast.error('An error occurred during rollback.');
      console.error(err);
    }
  });

  const handleRollback = (versionId: string) => {
    if (confirm('Are you sure you want to restore this version? Any unsaved edits in the current version will be lost.')) {
      rollbackThemeVersion({ variables: { id: customizationId, versionId } });
    }
  };

  const history = data?.themeVersionHistory || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            {themeName} timeline. Restore any previous snapshot.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 mt-4">
          {loading ? (
            <div className="flex justify-center p-8 text-muted-foreground">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="flex justify-center p-8 text-muted-foreground">No history found.</div>
          ) : (
            <div className="relative pl-6 py-2 border-l-2 border-muted space-y-8 ml-2">
              {history.map((version) => {
                if (!version) return null;
                const isActive = version.id === activeVersionId;
                const date = new Date(version.createdAt);

                return (
                  <div key={version.id} className="relative">
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center 
                        ${isActive ? 'bg-primary' : version.isSystemUpdate ? 'bg-blue-500' : 'bg-gray-400'}`}
                    >
                      {isActive && <CheckCircle2 className="h-4 w-4 text-white absolute" />}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              Version {version.versionNumber}
                            </span>
                            {isActive && (
                              <Badge variant="default" className="text-[10px] h-5 px-1.5 py-0 leading-none">
                                Active
                              </Badge>
                            )}
                            {version.isSystemUpdate && !isActive && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 py-0 leading-none bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Global Update
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(date, 'MMM d, yyyy - h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By {version.createdByActor || 'System'}
                          </p>
                        </div>

                        {!isActive && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs shrink-0"
                            onClick={() => handleRollback(version.id)}
                            disabled={isRollingBack}
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

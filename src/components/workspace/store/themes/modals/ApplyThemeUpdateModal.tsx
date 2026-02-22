'use client';

import React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/shadcn-ui/dialog';
import { Button } from '@/components/shadcn-ui/button';
import { DownloadCloud, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ApplyThemeUpdateDocument } from '@/services/graphql/themes/mutations/mythemes/__generated__/applyThemeUpdate.generated';

interface ApplyThemeUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customizationId: string;
  themeName: string;
  currentVersion: string;
  newVersion: string;
  onUpdateSuccess?: () => void;
}

export function ApplyThemeUpdateModal({
  isOpen,
  onClose,
  customizationId,
  themeName,
  currentVersion,
  newVersion,
  onUpdateSuccess,
}: ApplyThemeUpdateModalProps) {
  const [applyThemeUpdate, { loading }] = useMutation(ApplyThemeUpdateDocument, {
    onCompleted: (result) => {
      if (result.applyThemeUpdate?.success) {
        toast.success(`Theme update initialized.`);
        onUpdateSuccess?.();
        onClose();
      } else {
        toast.error(result.applyThemeUpdate?.error || 'Failed to initialize update');
      }
    },
    onError: (err) => {
      toast.error('An error occurred during update request.');
      console.error(err);
    }
  });

  const handleUpdate = () => {
    applyThemeUpdate({ variables: { id: customizationId } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <DownloadCloud className="h-5 w-5" />
            Update {themeName}
          </DialogTitle>
          <DialogDescription>
            A new global update is available for your theme.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex flex-col items-center flex-1">
              <span className="text-sm font-medium text-muted-foreground">Current</span>
              <span className="text-lg font-bold">{currentVersion}</span>
            </div>
            <div className="px-4 text-muted-foreground">→</div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-sm font-medium text-blue-600">New</span>
              <span className="text-lg font-bold text-blue-700">{newVersion}</span>
            </div>
          </div>

          <div className="flex gap-3 items-start text-sm text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>
              Your content will be safely merged. A new snapshot will be created automatically, meaning you can easily <strong>Rollback</strong> if anything looks wrong after the update.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Updating...' : 'Update Theme Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

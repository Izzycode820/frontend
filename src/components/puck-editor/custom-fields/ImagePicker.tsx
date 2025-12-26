'use client';

import { useState } from 'react';
import { Button } from '@/components/shadcn-ui/button';
import { FilesAndMediaModal } from '@/components/workspace/store/shared/files-and-media';
import type { MediaSelection } from '@/components/workspace/store/shared/files-and-media';
import { Image as ImageIcon, X } from 'lucide-react';

interface ImagePickerProps {
  value: string; // URL of selected image
  onChange: (value: string) => void;
}

/**
 * ImagePicker - Opens media library to select image
 */
export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [showModal, setShowModal] = useState(false);

  const handleMediaSelect = (selection: MediaSelection) => {
    // Get first image from selection
    const firstImage = [...selection.newUploads, ...selection.existingUploads][0];

    if (firstImage) {
      onChange(firstImage.url);
    }

    setShowModal(false);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {value ? (
        // Show selected image
        <div className="relative group">
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            <img
              src={value}
              alt="Selected"
              className="w-full h-40 object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={() => setShowModal(true)}
          >
            Change Image
          </Button>
        </div>
      ) : (
        // Show select button
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed flex flex-col gap-2"
          onClick={() => setShowModal(true)}
        >
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm">Select Image</span>
        </Button>
      )}

      <FilesAndMediaModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        maxSelection={1}
      />
    </div>
  );
}

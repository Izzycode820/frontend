'use client';

import React, { useState } from 'react';
import { ProductMediaGrid } from '@/components/workspace/store/products/form/media/ProductMediaGrid';
import { FilesAndMediaModal, type MediaSelection } from '@/components/workspace/store/shared/files-and-media';
import { useTranslations } from 'next-intl';
import { AssistantProductFormData } from '../types';

interface MediaSectionProps {
    formData: AssistantProductFormData;
    onChange: (items: any[]) => void;
}

export function MediaSection({ formData, onChange }: MediaSectionProps) {
    const t = useTranslations('Products.media');
    const [showModal, setShowModal] = useState(false);

    const handleMediaSelect = (selection: MediaSelection) => {
        const allItems = [...selection.newUploads, ...selection.existingUploads];
        onChange([...formData.mediaItems, ...allItems]);
        setShowModal(false);
    };

    const handleRemove = (uploadId: string) => {
        onChange(formData.mediaItems.filter(item => item.uploadId !== uploadId));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                    Media / Galllery
                </label>
                <span className="text-[10px] text-zinc-600 font-medium">
                    {formData.mediaItems.length} {formData.mediaItems.length === 1 ? 'file' : 'files'}
                </span>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
                <ProductMediaGrid 
                    mediaItems={formData.mediaItems}
                    onRemove={handleRemove}
                    onAddMore={() => setShowModal(true)}
                />
            </div>

            <FilesAndMediaModal 
                open={showModal}
                onClose={() => setShowModal(false)}
                onSelect={handleMediaSelect}
                selectedItems={formData.mediaItems}
                maxSelection={10}
            />
        </div>
    );
}

'use client';

import React from 'react';
import { AssistantProductFormData } from '../types';
import { FieldRow } from '../AssistantProductFieldRow';

interface SEOSectionProps {
    formData: AssistantProductFormData;
    onChange: (field: keyof AssistantProductFormData, value: any) => void;
}

export function SEOSection({ formData, onChange }: SEOSectionProps) {
    return (
        <div className="space-y-6">
            <FieldRow label="Meta Title">
                <input 
                    value={formData.metaTitle}
                    onChange={(e) => onChange('metaTitle', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all text-sm"
                    placeholder="SEO Title..."
                />
            </FieldRow>

            <FieldRow label="URL Slug">
                <div className="relative">
                    <input 
                        value={formData.slug}
                        onChange={(e) => onChange('slug', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-5 pr-5 text-zinc-400 outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all text-xs font-mono"
                        placeholder="product-url-slug"
                    />
                </div>
            </FieldRow>

            <FieldRow label="Meta Description">
                <textarea 
                    rows={4}
                    value={formData.metaDescription}
                    onChange={(e) => onChange('metaDescription', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all resize-none text-sm leading-relaxed"
                    placeholder="Brief description for search engines..."
                />
            </FieldRow>
        </div>
    );
}

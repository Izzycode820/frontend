'use client';

import React from 'react';
import { AssistantProductFormData } from '../types';
import { FieldRow } from '../AssistantProductFieldRow';

interface DetailsSectionProps {
    formData: AssistantProductFormData;
    onChange: (field: keyof AssistantProductFormData, value: any) => void;
}

export function DetailsSection({ formData, onChange }: DetailsSectionProps) {
    return (
        <div className="space-y-6">
            <FieldRow label="Product Title">
                <input 
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all font-light text-sm"
                    placeholder="e.g. Samsung Galaxy S8"
                />
            </FieldRow>

            <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Price">
                    <div className="relative">
                        <input 
                            type="number"
                            value={formData.price}
                            onChange={(e) => onChange('price', parseFloat(e.target.value))}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-5 text-white outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all text-sm font-medium"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 uppercase">
                            {formData.currency}
                        </span>
                    </div>
                </FieldRow>
            </div>
            <FieldRow label="Description">
                <textarea 
                    rows={6}
                    value={formData.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all resize-none font-light leading-relaxed text-sm"
                    placeholder="Describe the product..."
                />
            </FieldRow>
        </div>
    );
}
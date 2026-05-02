'use client';

import React from 'react';
import { AssistantProductFormData } from '../types';
import { FieldRow } from '../AssistantProductFieldRow';
import { Plus, ChevronDown, Check, Tag as TagIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizationSectionProps {
    formData: AssistantProductFormData;
    onChange: (field: keyof AssistantProductFormData, value: any) => void;
    categories?: Array<{ id: string; name: string }>;
}

export function OrganizationSection({ formData, onChange, categories = [] }: OrganizationSectionProps) {
    const [isCatOpen, setIsCatOpen] = React.useState(false);

    const selectedCategory = categories.find(c => c.id === formData.categoryId);

    return (
        <div className="space-y-6">
            {/* Category Selector */}
            <FieldRow label="Store Category">
                <div className="relative">
                    <button
                        onClick={() => setIsCatOpen(!isCatOpen)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-left flex items-center justify-between transition-all hover:bg-zinc-900 focus:border-indigo-500/40"
                    >
                        <span className={cn("text-xs", !selectedCategory ? "text-zinc-600" : "text-white font-medium")}>
                            {selectedCategory ? selectedCategory.name : "Select a category..."}
                        </span>
                        <ChevronDown className={cn("size-4 text-zinc-600 transition-transform", isCatOpen && "rotate-180")} />
                    </button>

                    {isCatOpen && (
                        <div className="absolute top-[calc(100%+8px)] inset-x-0 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-48 overflow-y-auto py-2 custom-scrollbar">
                                {categories.length === 0 && (
                                    <div className="px-4 py-3 text-[10px] text-zinc-500 italic">No categories found</div>
                                )}
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            onChange('categoryId', cat.id);
                                            setIsCatOpen(false);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs text-zinc-400 hover:bg-white/5 hover:text-white flex items-center justify-between group"
                                    >
                                        {cat.name}
                                        {formData.categoryId === cat.id && <Check className="size-3 text-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                            <button 
                                className="w-full p-3 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:bg-white/10 transition-all"
                                onClick={() => {/* Quick Add logic later */}}
                            >
                                <Plus className="size-3" />
                                Quick Add Category
                            </button>
                        </div>
                    )}
                </div>
            </FieldRow>

            {/* Vendor & Brand */}
            <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Brand Name">
                    <input 
                        value={formData.brand || ''}
                        onChange={(e) => onChange('brand', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 transition-all text-xs"
                        placeholder="e.g. Apple"
                    />
                </FieldRow>
                <FieldRow label="Vendor">
                    <input 
                        value={formData.vendor || ''}
                        onChange={(e) => onChange('vendor', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 transition-all text-xs"
                        placeholder="Supplier..."
                    />
                </FieldRow>
            </div>

            {/* Product Type (Simplified) */}
            <FieldRow label="Product Classification">
                <div className="flex bg-zinc-900/50 border border-white/5 rounded-2xl p-1 h-[46px]">
                    {['physical', 'digital'].map(type => (
                        <button
                            key={type}
                            onClick={() => onChange('productType', type)}
                            className={cn(
                                "flex-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                formData.productType === type ? "bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30" : "text-zinc-600 hover:text-zinc-400"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </FieldRow>

            {/* Tags (Compact) */}
            <FieldRow label="Search Tags">
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-lg bg-zinc-800 border border-white/5 text-[10px] text-zinc-400 flex items-center gap-1.5 animate-in scale-in-95 duration-200">
                            {tag}
                            <X 
                                className="size-3 hover:text-white cursor-pointer" 
                                onClick={() => onChange('tags', formData.tags.filter(t => t !== tag))}
                            />
                        </span>
                    ))}
                </div>
                <div className="relative">
                    <input 
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-10 pr-5 text-white outline-none focus:border-indigo-500/40 transition-all text-xs"
                        placeholder="Type and press Enter to add tag..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value.trim();
                                if (val && !formData.tags.includes(val)) {
                                    onChange('tags', [...formData.tags, val]);
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                    <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
                </div>
            </FieldRow>
        </div>
    );
}

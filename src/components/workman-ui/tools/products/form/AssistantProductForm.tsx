'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, BarChart3, Globe, Image as ImageIcon, X, Check, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssistantProductFormData, AssistantProductFormProps } from './types';
import { DetailsSection } from './sections/DetailsSection';
import { MediaSection } from './sections/MediaSection';
import { OrganizationSection } from './sections/OrganizationSection';
import { InventorySection } from './sections/InventorySection';
import { SEOSection } from './sections/SEOSection';

export function AssistantProductForm({
    formData,
    setFormData,
    onSave,
    onClose,
    isLoading,
    categories
}: AssistantProductFormProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'media' | 'org' | 'inventory' | 'seo'>('details');

    const handleChange = (field: keyof AssistantProductFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const tabs = [
        { id: 'details', label: 'Details', icon: Tag },
        { id: 'media', label: 'Images', icon: ImageIcon },
        { id: 'org', label: 'Brand & Category', icon: Settings },
        { id: 'inventory', label: 'Inventory', icon: BarChart3 },
        { id: 'seo', label: 'Search', icon: Globe },
    ] as const;

    return (
        <div className="flex flex-col h-full bg-[#090909] text-white">
            {/* Slim Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/20">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Tag className="size-4 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold tracking-tight">
                            {formData.name || 'Untitled Product'}
                        </h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Product Draft
                        </p>
                    </div>
                </div>
                <button 
                   onClick={onClose}
                   className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all shadow-inner"
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Tab Navigation (Slim) */}
            <div className="flex px-6 border-b border-white/5 bg-black/40">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 py-3 px-4 text-[10px] font-bold tracking-wider uppercase transition-all relative",
                            activeTab === tab.id ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <tab.icon className="size-3" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div 
                                layoutId="active-tab" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                <div className="max-w-xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'details' && (
                                <DetailsSection formData={formData} onChange={handleChange} />
                            )}
                            {activeTab === 'media' && (
                                <MediaSection 
                                    formData={formData} 
                                    onChange={(items) => handleChange('mediaItems', items)} 
                                />
                            )}
                            {activeTab === 'org' && (
                                <OrganizationSection 
                                    formData={formData} 
                                    onChange={handleChange} 
                                    categories={categories}
                                />
                            )}
                            {activeTab === 'inventory' && (
                                <InventorySection formData={formData} onChange={handleChange} />
                            )}
                            {activeTab === 'seo' && (
                                <SEOSection formData={formData} onChange={handleChange} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating/Slim Actions */}
            <div className="px-6 py-4 border-t border-white/5 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-medium italic">
                    All changes are saved as local draft
                </div>
                <button 
                    onClick={onSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                >
                    {isLoading ? "Saving..." : <><Check className="size-3.5" /> Save Product</>}
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
}

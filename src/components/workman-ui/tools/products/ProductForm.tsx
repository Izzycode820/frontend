"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Settings, BarChart3, Globe, PackageOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartProductData } from './SmartProductCard';

interface ProductFormProps {
  initialData: SmartProductData;
  onSubmit: (data: SmartProductData) => void;
  onClose: () => void;
}

export function ProductForm({ 
  initialData, 
  onSubmit,
  onClose
}: ProductFormProps) {
  const [formData, setFormData] = useState<SmartProductData>(initialData);
  const [activeTab, setActiveTab] = useState<'details' | 'seo' | 'inventory'>('details');

  const handleChange = (field: keyof SmartProductData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-zinc-900/50 to-transparent">
          <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <PackageOpen className="size-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-white tracking-tight">Product Draft</h2>
                <p className="text-xs text-zinc-500 font-light mt-0.5">Refining generated details</p>
              </div>
          </div>
          <button 
            onClick={onClose}
            className="size-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all underline decoration-zinc-800 underline-offset-4"
          >
            Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-8 border-b border-white/5 overflow-x-auto no-scrollbar bg-black/20">
          {[
            { id: 'details', label: 'Details', icon: Tag },
            { id: 'inventory', label: 'Inventory', icon: BarChart3 },
            { id: 'seo', label: 'SEO', icon: Globe },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 px-4 text-[10px] font-bold tracking-widest uppercase transition-all relative",
                  activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <tab.icon className={cn("size-3.5", activeTab === tab.id ? "text-indigo-400" : "text-zinc-600")} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
              </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-xl mx-auto">
            {activeTab === 'details' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Product Title</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-all font-light"
                      placeholder="Enter product name..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Price</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleChange('price', e.target.value)}
                          className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-indigo-500/50 transition-all"
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400/50 uppercase">{formData.currency.split(',')[0]}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Brand</label>
                      <input 
                        value={formData.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Description</label>
                    <textarea 
                      rows={6}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all resize-none font-light leading-relaxed"
                    />
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                          <Settings className="size-5 text-indigo-400" />
                      </div>
                      <div>
                          <p className="text-sm font-medium text-white">Track Inventory</p>
                          <p className="text-xs text-zinc-500">Enable stock level management</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.track_inventory} 
                        onChange={(e) => handleChange('track_inventory', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                    </label>
                </div>

                {formData.track_inventory && (
                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Available Quantity</label>
                      <input 
                          type="number"
                          value={formData.inventory_quantity}
                          onChange={(e) => handleChange('inventory_quantity', parseInt(e.target.value))}
                          className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all font-mono"
                      />
                    </div>
                )}
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Meta Title</label>
                    <input 
                      value={formData.meta_title}
                      onChange={(e) => handleChange('meta_title', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Meta Description</label>
                    <textarea 
                      rows={6}
                      value={formData.meta_description}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 flex items-center justify-end gap-3 bg-zinc-950/50 backdrop-blur-xl">
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-10 py-4 bg-white text-black rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5"
          >
            <Check className="size-4" />
            SAVE PRODUCT
          </button>
        </div>

        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        `}</style>
    </div>
  );
}

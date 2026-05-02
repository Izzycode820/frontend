'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { AssistantProductFormData } from '../types';
import { FieldRow } from '../AssistantProductFieldRow';

interface InventorySectionProps {
    formData: AssistantProductFormData;
    onChange: (field: keyof AssistantProductFormData, value: any) => void;
}

export function InventorySection({ formData, onChange }: InventorySectionProps) {
    return (
        <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Settings className="size-4 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">Track Inventory</p>
                        <p className="text-[10px] text-zinc-500">Enable stock management</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.trackInventory} 
                        onChange={(e) => onChange('trackInventory', e.target.checked)}
                        className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                </label>
            </div>

            {formData.trackInventory && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <FieldRow label="In Stock">
                        <input 
                            type="number"
                            value={formData.inventoryQuantity}
                            onChange={(e) => onChange('inventoryQuantity', parseInt(e.target.value))}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all text-sm font-mono"
                        />
                    </FieldRow>
                    <FieldRow label="SKU / Reference">
                        <input 
                            value={formData.sku || ''}
                            onChange={(e) => onChange('sku', e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 px-5 text-white outline-none focus:border-indigo-500/40 focus:bg-zinc-900 transition-all text-sm uppercase placeholder:text-zinc-800"
                            placeholder="e.g. SN-001"
                        />
                    </FieldRow>
                </div>
            )}

            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                            <span className="text-[10px] text-zinc-400 font-bold">SHP</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white">Shipping Policy</p>
                            <p className="text-[10px] text-zinc-500">Is this a physical product?</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.shippingRequired} 
                            onChange={(e) => onChange('shippingRequired', e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}

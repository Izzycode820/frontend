import { DetailsSection } from './sections/DetailsSection';
import { MediaSection } from './sections/MediaSection';
import { OrganizationSection } from './sections/OrganizationSection';
import { InventorySection } from './sections/InventorySection';
import { SEOSection } from './sections/SEOSection';
import { X, Check } from 'lucide-react';
import { AssistantProductFormProps } from './types';

export function AssistantProductMobile({
    formData,
    setFormData,
    onSave,
    onClose,
    isLoading,
    categories
}: AssistantProductFormProps) {
    const handleChange = (field: any, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-20">
                <div>
                   <h2 className="text-lg font-bold tracking-tight">Product Setup</h2>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Workman Assistant</p>
                </div>
                <button 
                   onClick={onClose}
                   className="p-3 rounded-full bg-zinc-900 text-zinc-400"
                >
                    <X className="size-5" />
                </button>
            </div>

            {/* Scrollable Flow */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="divide-y divide-white/5">
                    <section className="px-6 py-8">
                        <DetailsSection formData={formData} onChange={handleChange} />
                    </section>

                    <section className="px-6 py-8">
                        <OrganizationSection 
                            formData={formData} 
                            onChange={handleChange}
                            categories={categories}
                        />
                    </section>

                    <section className="px-6 py-8 bg-zinc-900/10">
                        <MediaSection 
                            formData={formData} 
                            onChange={(items) => handleChange('mediaItems', items)} 
                        />
                    </section>

                    <section className="px-6 py-8">
                        <InventorySection formData={formData} onChange={handleChange} />
                    </section>

                    <section className="px-6 py-8 bg-zinc-900/10">
                        <SEOSection formData={formData} onChange={handleChange} />
                    </section>
                </div>
            </div>

            {/* Sticky Mobile Footer */}
            <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
                <button 
                    onClick={onSave}
                    disabled={isLoading}
                    className="w-full h-16 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isLoading ? "PROCESSSING..." : <><Check className="size-5" /> SAVE PRODUCT</>}
                </button>
            </div>
        </div>
    );
}

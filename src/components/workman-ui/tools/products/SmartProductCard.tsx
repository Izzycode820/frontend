import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Edit3, ShoppingCart, Tag } from 'lucide-react';
import { useMerchantChat } from '@/components/workspace/store/dashboard/chat/MerchantChatContext';

export interface SmartProductData {
  name: string;
  price: string;
  compare_at_price?: string | null;
  description: string;
  product_type: string;
  brand: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  status: string;
  currency: string;
  track_inventory: boolean;
  inventory_quantity: number;
  shipping_required: boolean;
  sku?: string;
}

interface SmartProductCardProps {
  args: SmartProductData;
}

export const SmartProductCard: React.FC<SmartProductCardProps> = ({ args }) => {
  const { openSidePanel } = useMerchantChat();
  const [localData] = useState(args);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: localData.currency.split(',')[0].trim() || 'XAF',
  }).format(parseFloat(localData.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mt-3 w-full max-w-[320px] bg-[#111111] rounded-2xl border border-white/8 shadow-xl overflow-hidden"
    >
      {/* Slim header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5">
        <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Package className="size-5 text-indigo-400" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white leading-snug truncate">{localData.name}</p>
          <p className="text-[11px] text-zinc-500 font-light truncate">{localData.brand} · {localData.product_type}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Draft</span>
        </div>
      </div>

      {/* Price + description */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Price</span>
          <span className="text-[15px] font-bold text-white">{formattedPrice}</span>
        </div>
        <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2">{localData.description}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => openSidePanel('PRODUCT', localData)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 border border-white/5 text-white text-[12px] font-medium hover:bg-zinc-800 transition-colors"
        >
          <Edit3 className="size-3.5 text-zinc-400" />
          Edit Draft
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-black text-[12px] font-bold hover:bg-zinc-100 transition-colors">
          <ShoppingCart className="size-3.5" />
          Create
        </button>
      </div>
    </motion.div>
  );
};


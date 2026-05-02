"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMerchantChat } from './MerchantChatContext';
import { AssistantProductContainer } from '../../../../workman-ui/tools/products/form/AssistantProductContainer';
import { cn } from '@/lib/utils';

export function ChatSandbox() {
  const { sidePanel, closeSidePanel } = useMerchantChat();

  return (
    <AnimatePresence mode="wait">
      {sidePanel.isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0, y: 0 }}
          animate={{ x: 0, opacity: 1, y: 0 }}
          exit={{ x: '100%', opacity: 0 }}
          // On mobile we want it to slide up, on desktop we want it to slide from the right.
          // Tailwind handles the positioning, motion handles the animation.
          className={cn(
             "h-full border-l border-white/5 bg-[#090909] relative flex flex-col shadow-2xl z-30",
             "fixed md:relative inset-y-0 right-0 w-full md:w-[450px] lg:w-[500px]", // Desktop: Right Sidebar
             "max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:h-[85vh] max-md:rounded-t-[2.5rem] max-md:border-l-0 max-md:border-t" // Mobile: Bottom Sheet
          )}
          transition={{ type: 'spring', damping: 30, stiffness: 250 }}
        >
          {sidePanel.type === 'PRODUCT' && (
            <AssistantProductContainer 
              initialData={sidePanel.data} 
              onClose={closeSidePanel}
              onSubmitSuccess={() => {
                // Future: Maybe refresh the card or mark as created
              }}
            />
          )}

          {sidePanel.type === 'SHIPPING' && (
             <div className="flex-1 flex items-center justify-center p-12 text-zinc-500 font-light text-center">
                <p>Shipping Form Sandbox coming soon...</p>
             </div>
          )}
          
          {/* Fallback */}
          {!sidePanel.type && (
             <div className="flex-1 flex items-center justify-center p-12 text-zinc-500 font-light text-center">
               <p>No active tool selected.</p>
             </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

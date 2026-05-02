'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shadcn-ui/dialog";
import { Badge } from '@/components/shadcn-ui/badge';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  Video, 
  CheckCheck,
  Smartphone
} from 'lucide-react';

interface PreviewProps {
  template: any;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppTemplatePreviewModal({ template, isOpen, onClose }: PreviewProps) {
  if (!template) return null;

  // Parse components only for format/structural information (e.g., IMAGE format)
  let components = [];
  try {
    components = typeof template.components === 'string' ? JSON.parse(template.components) : (template.components || []);
  } catch (e) {}

  const headerComp = components.find((c: any) => c.type === 'HEADER');
  
  // Use direct fields for content
  const headerText = template.headerText;
  const bodyText = template.bodyText;
  const footerText = template.footerText;
  
  // Handle buttons which might be a JSON string or an array
  let buttons = [];
  try {
    buttons = typeof template.buttons === 'string' ? JSON.parse(template.buttons) : (template.buttons || []);
  } catch (e) {
    // Fallback to components if direct buttons field fails
    buttons = components.find((c: any) => c.type === 'BUTTONS')?.buttons || [];
  }

  const headerFormat = headerComp?.format || 'TEXT';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[440px] w-full max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:ring-0">
        <DialogHeader className="sr-only">
          <DialogTitle>WhatsApp Template Preview</DialogTitle>
          <DialogDescription>
            Preview of {template.name} template
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 sm:p-6 h-full w-full">
          {/* Mock Device Frame */}
          <div className="relative w-full aspect-[9/18] bg-black rounded-[2.5rem] p-2 shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col mx-auto">
            
            {/* iOS Status Bar Mockup */}
            <div className="h-10 w-full flex items-center justify-between px-6 pt-2 select-none pointer-events-none bg-white text-black text-[11px] font-bold z-30">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 grayscale opacity-80">
                <div className="flex gap-0.5 items-end h-2.5">
                  <div className="w-[2px] h-[30%] bg-black rounded-full" />
                  <div className="w-[2px] h-[50%] bg-black rounded-full" />
                  <div className="w-[2px] h-[80%] bg-black rounded-full" />
                  <div className="w-[2px] h-[100%] bg-black rounded-full" />
                </div>
                <span>5G</span>
                <div className="w-5 h-2.5 border border-black/30 rounded-[2px] relative flex items-center p-[1px]">
                  <div className="h-full w-[80%] bg-black rounded-[1px]" />
                  <div className="absolute -right-[3px] w-[2px] h-[4px] bg-black/30 rounded-full" />
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col w-full bg-[#0b141a] select-none overflow-hidden relative">
              
              {/* WhatsApp Header - Accurate Style */}
              <div className="bg-[#f6f6f6] border-b border-black/5 text-[#007aff] px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0 z-20">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[15px]">
                    <ArrowLeft className="w-5 h-5" />
                    <span>3</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-[#075e54] flex items-center justify-center text-white text-[10px] font-black">AI</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-black leading-none">Conversation Ai</span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-none italic">Conversation.ai</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 opacity-80 text-[#007aff]">
                   <Video className="w-4.5 h-4.5" />
                   <Phone className="w-4 h-4" />
                </div>
              </div>

              {/* Chat Area with Damask Wallpaper */}
              <div 
                className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col relative no-scrollbar"
                style={{ 
                  backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                  backgroundSize: '350px',
                  backgroundBlendMode: 'soft-light',
                  backgroundColor: '#0b141a' // Dark mode wallpaper feel
                }}
              >
                <div className="bg-[#182229] self-center px-2.5 py-1 rounded-md text-[10px] text-slate-300 shadow-md mb-4 font-bold tracking-tight">
                  Today
                </div>

                {/* Meta Disclosure Box */}
                <div className="bg-[#dcf8c6]/10 border border-[#dcf8c6]/20 self-center max-w-[90%] p-3 rounded-lg text-center text-[11px] text-[#dcf8c6] mb-5 shadow-sm backdrop-blur-sm">
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">i</div>
                      <span>This business uses a secure service from Meta to manage this chat. Tap to learn more.</span>
                   </div>
                </div>

                {/* Received Template Bubble (White Card Style) */}
                <div className="self-start max-w-[85%] relative mb-3 animate-in fade-in duration-500">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden relative border border-black/5">
                    {/* Image Header */}
                    {headerFormat === 'IMAGE' ? (
                        <div className="w-full aspect-[4/3] bg-slate-100 flex flex-col items-center justify-center p-4">
                           <div className="w-16 h-16 bg-red-500 rounded-lg shadow-lg flex items-center justify-center">
                              <span className="text-white font-bold text-xs">IMG</span>
                           </div>
                           <span className="text-[9px] text-slate-400 mt-4 font-bold uppercase tracking-widest">Template Image</span>
                        </div>
                    ) : headerText && (
                        <div className="px-4 pt-3 font-bold text-[14px] text-black">
                           {headerText}
                        </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="p-4 space-y-3">
                      {headerFormat === 'IMAGE' && headerText && (
                         <h4 className="font-bold text-[14px] text-black leading-snug">
                            {headerText}
                         </h4>
                      )}
                      
                      {bodyText && (
                        <div className="text-[13px] text-slate-700 leading-normal whitespace-pre-wrap">
                          {bodyText}
                        </div>
                      )}

                      {footerText && (
                        <div className="text-[11px] text-slate-400 italic">
                          {footerText}
                        </div>
                      )}

                      <div className="flex items-center justify-end">
                        <span className="text-[10px] text-slate-400">4:00 PM</span>
                      </div>
                    </div>

                    {/* Action Links */}
                    {buttons.length > 0 && (
                      <div className="border-t border-slate-100">
                        {buttons.map((btn: any, idx: number) => (
                          <div key={idx} className="py-3 px-4 text-center border-b last:border-b-0 border-slate-100 active:bg-slate-50 transition-colors">
                            <span className="text-[14px] text-[#007aff] font-medium">{btn.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chat Bubble Tail - Left Side */}
                    <div className="absolute top-0 -left-1.5 w-3 h-3 bg-white" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                  </div>
                </div>
              </div>

              {/* iOS Style Input Bar */}
              <div className="bg-[#fdfdfd] px-2 py-2.5 pb-8 flex items-center gap-3 border-t border-black/5 flex-shrink-0 z-20">
                <div className="text-[#007aff] font-light text-2xl px-1">+</div>
                <div className="flex-1 bg-white rounded-full px-4 py-1.5 text-[14px] border border-black/10 shadow-inner flex items-center justify-between">
                   <span className="text-slate-300"> </span>
                   <div className="flex gap-4 opacity-70 scale-90">
                      <div className="w-5 h-5 border-2 border-[#007aff] rounded flex items-center justify-center p-[2px]">
                         <div className="w-full h-full border border-[#007aff] rounded-sm" />
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-[#007aff]" />
                   </div>
                </div>
                <div className="flex gap-4 text-[#007aff] opacity-90 pr-2 items-center">
                   <div className="w-5 h-4 border-2 border-current rounded-sm relative">
                      <div className="absolute top-1/2 left-1 server-w-1 h-1 bg-current" />
                   </div>
                   <div className="w-4 h-6 border-b-2 border-current relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-4 border-2 border-current rounded-t-full" />
                   </div>
                </div>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white opacity-40 rounded-full z-30" />
          </div>
          
          {/* Metadata Overlay - Subtle */}
          <div className="mt-8 flex gap-2">
            <Badge className="bg-white/10 text-white border-white/10 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
              {template.category}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-white/40 text-[9px] uppercase px-3 py-1 rounded-full">
              {template.language}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

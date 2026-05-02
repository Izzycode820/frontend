'use client';

import { WhatsAppSidebar } from '@/components/workspace/store/whatsapp/ui/WhatsAppSidebar';

export default function WhatsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
       <WhatsAppSidebar />
       <main className="flex-1">
          {children}
       </main>
    </div>
  );
}

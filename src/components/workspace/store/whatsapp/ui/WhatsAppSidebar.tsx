'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Zap
} from 'lucide-react';

import { useTranslations } from 'next-intl';

const whatsappNavItems = [
  {
    id: 'overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'inbox',
    href: '/inbox',
    icon: MessageSquare,
  },
  {
    id: 'templates',
    href: '/templates',
    icon: FileText,
  },
  {
    id: 'api_control',
    href: '/api_control',
    icon: Zap,
  },
];

export function WhatsAppSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const t = useTranslations('WhatsAppNav');
  const workspaceId = params.workspace_id as string;
  const baseUrl = `/workspace/${workspaceId}/store/whatsapp`;

  return (
    <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-20">
      <nav className="flex items-center gap-1 p-1 max-w-screen-2xl mx-auto">
        {whatsappNavItems.map((item) => {
          const href = `${baseUrl}${item.href}`;
          // Match exactly or start with for deeper levels
          const isActive = pathname === href || (item.href !== '/overview' && pathname.startsWith(href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "animate-pulse")} />
              <span className="font-heading tracking-tight">{t(`items.${item.id}.label` as any)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

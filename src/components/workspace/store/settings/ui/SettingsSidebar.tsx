'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Globe,
  Truck,
  CreditCard,
  Bell,
  Users,
  Settings,
  Receipt,
  Crown,
  Bot
} from 'lucide-react';

import { useTranslations } from 'next-intl';

const settingsNavItems = [
  {
    id: 'general',
    href: '/general',
    icon: Settings,
  },
  {
    id: 'plan',
    href: '/plan',
    icon: Crown,
  },
  {
    id: 'billing',
    href: '/billing',
    icon: Receipt,
  },
  {
    id: 'domains',
    href: '/domains',
    icon: Globe,
  },
  {
    id: 'shipping',
    href: '/shipping',
    icon: Truck,
  },
  {
    id: 'payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    id: 'notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    id: 'staff',
    href: '/staff',
    icon: Users,
  },
  {
    id: 'workman',
    href: '/workman',
    icon: Bot,
  },
];

export function SettingsSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const t = useTranslations('SettingsNav');
  const workspaceId = params.workspace_id as string;
  const baseUrl = `/workspace/${workspaceId}/store/settings`;

  return (
    <aside className="w-48 flex-shrink-0">
      <nav className="space-y-1">
        {settingsNavItems.map((item) => {
          const href = `${baseUrl}${item.href}`;
          const isActive = pathname.startsWith(href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                'hover:bg-muted',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(`items.${item.id}.label` as any)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

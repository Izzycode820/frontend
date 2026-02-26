'use client';

import { useRouter } from 'next/navigation';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/shadcn-ui/dropdown-menu';
import { Button } from '@/components/shadcn-ui/button';
import { IconLanguage } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

export function LanguageSelector() {
    const router = useRouter();
    const currentLocale = useLocale();
    const t = useTranslations('General');

    const switchLocale = (locale: string) => {
        // Set the cookie (next-intl/server will use this)
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
        // Refresh to apply the new locale
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 px-3 gap-2 flex items-center hover:bg-white/10 text-inherit">
                    <IconLanguage className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('language')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem 
                    onClick={() => switchLocale('en')}
                    className={currentLocale === 'en' ? 'bg-accent' : ''}
                >
                    English
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => switchLocale('fr')}
                    className={currentLocale === 'fr' ? 'bg-accent' : ''}
                >
                    Français
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

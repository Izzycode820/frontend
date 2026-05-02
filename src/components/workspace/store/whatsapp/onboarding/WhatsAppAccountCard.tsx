'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Smartphone, 
  Database,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Shadcn UI
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Badge } from '@/components/shadcn-ui/badge';

interface WhatsAppAccountCardProps {
  account: {
    id: string;
    wabaId: string;
    phoneNumberId: string;
    isActive: boolean;
    name?: string;
    displayPhoneNumber?: string;
  };
  onDisconnect: () => void;
}

export function WhatsAppAccountCard({ account, onDisconnect }: WhatsAppAccountCardProps) {
  const t = useTranslations('WhatsAppAccount');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card className="overflow-hidden border-none shadow-xl bg-background/40 backdrop-blur-md">
        <div className="h-2 bg-primary" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold font-heading">{account.name || t('title')}</CardTitle>
                <CardDescription>{account.displayPhoneNumber || account.phoneNumberId}</CardDescription>
              </div>
            </div>
            <Badge variant={account.isActive ? "default" : "secondary"} className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
              account.isActive ? "bg-green-500/10 text-green-500 hover:bg-green-500/10 border-green-500/50" : ""
            )}>
              {account.isActive ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('verified')}
                </span>
              ) : t('pending')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-muted flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('waba_id')}</span>
              <code className="text-sm font-mono truncate">{account.wabaId}</code>
            </div>
            <div className="p-4 rounded-xl bg-muted/30 border border-muted flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('phone_id')}</span>
              <code className="text-sm font-mono truncate">{account.phoneNumberId}</code>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 flex gap-3">
             <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
             <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
               {t('api_info')}
             </p>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t justify-between py-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open('https://business.facebook.com/', '_blank')}>
            <ExternalLink className="h-4 w-4" />
            {t('manage_meta')}
          </Button>
          
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2" onClick={onDisconnect}>
            <Trash2 className="h-4 w-4" />
            {t('disconnect')}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="p-6 rounded-2xl bg-background/40 border border-border/50 backdrop-blur-sm space-y-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <Database className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm">{t('cards.brain_title')}</h4>
            <p className="text-xs text-muted-foreground">{t('cards.brain_description')}</p>
         </div>
         <div className="p-6 rounded-2xl bg-background/40 border border-border/50 backdrop-blur-sm space-y-2 opacity-50">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
               <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h4 className="font-bold text-sm">{t('cards.template_title')}</h4>
            <p className="text-xs text-muted-foreground">{t('cards.template_description')}</p>
         </div>
         <div className="p-6 rounded-2xl bg-background/40 border border-border/50 backdrop-blur-sm space-y-2 opacity-50">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
               <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <h4 className="font-bold text-sm">{t('cards.limits_title')}</h4>
            <p className="text-xs text-muted-foreground">{t('cards.limits_description')}</p>
         </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/shadcn-ui/dialog';
import { Button } from '@/components/shadcn-ui/button';
import { Label } from '@/components/shadcn-ui/label';
import { Switch } from '@/components/shadcn-ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn-ui/select';
import { Slider } from '@/components/shadcn-ui/slider';
import { Bot, Sparkles, Zap, Brain, ExternalLink } from 'lucide-react';
import { WorkmanWorkmanSettingsLlmProviderChoices } from '@/types/workspace/store/graphql-base';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface WorkmanQuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    llmProvider: string;
    autoReplyEnabled: boolean;
    minConfidence: number;
  } | null;
  onUpdate: (values: {
    llmProvider?: string;
    autoReplyEnabled?: boolean;
    minConfidence?: number;
  }) => Promise<void>;
  isUpdating: boolean;
}

export function WorkmanQuickSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdate,
  isUpdating
}: WorkmanQuickSettingsModalProps) {
  const t = useTranslations('Workman');
  const params = useParams();
  const workspaceId = params.workspace_id as string;

  if (!settings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-primary/10 shadow-2xl backdrop-blur-xl bg-background/95">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <DialogTitle className="text-xl font-heading font-bold">{t('quickSettings.title')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('quickSettings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 1. Master Auto-Reply Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 gap-4">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-bold flex items-center gap-2">
                <Zap className="size-3.5 text-primary" />
                {t('engine.autoReply')}
              </Label>
              <span className="text-[10px] text-muted-foreground italic">
                {settings.autoReplyEnabled ? t('engine.autoReplyDesc') : t('tabs.persona')}
              </span>
            </div>
            <Switch 
              checked={settings.autoReplyEnabled} 
              disabled={isUpdating}
              onCheckedChange={(checked) => onUpdate({ autoReplyEnabled: checked })}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* 2. LLM Provider Selection */}
          <div className="grid gap-2 pr-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t('engine.provider')}</Label>
            <Select 
              value={settings.llmProvider} 
              disabled={isUpdating}
              onValueChange={(val) => onUpdate({ llmProvider: val })}
            >
              <SelectTrigger className="w-full rounded-xl border-primary/10 focus:ring-primary/20 bg-background/50">
                <SelectValue placeholder={t('engine.provider')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-primary/10">
                <SelectItem value={WorkmanWorkmanSettingsLlmProviderChoices.Gemini} className="focus:bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-[#4285F4]" />
                    <span>{t('engine.gemini')}</span>
                  </div>
                </SelectItem>
                <SelectItem value={WorkmanWorkmanSettingsLlmProviderChoices.Deepseek} className="focus:bg-primary/5">
                   <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-[#6B46C1]" />
                    <span>{t('engine.deepseek')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Confidence Threshold */}
          <div className="grid gap-4 pr-2">
            <div className="flex items-center justify-between ml-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('quickSettings.confidence')}</Label>
              <span className="text-xs font-mono font-bold text-primary">{Math.round(settings.minConfidence * 100)}%</span>
            </div>
            <Slider 
              value={[settings.minConfidence]} 
              min={0} 
              max={1} 
              step={0.05} 
              disabled={isUpdating}
              onValueCommit={([val]) => onUpdate({ minConfidence: val })}
              className="py-2"
            />
            <p className="text-[10px] text-muted-foreground italic ml-1">
              {settings.autoReplyEnabled ? t('quickSettings.confidenceDesc') : t('quickSettings.confidenceDescManual')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-primary/5">
          <Link 
            href={`/workspace/${workspaceId}/store/settings/workman`}
            className="flex-1"
            onClick={onClose}
          >
            <Button variant="outline" className="w-full gap-2 rounded-xl text-xs hover:bg-primary/5 border-primary/10">
              <Brain className="size-3.5" />
              {t('quickSettings.fullConfig')}
              <ExternalLink className="size-3" />
            </Button>
          </Link>
          <Button onClick={onClose} className="rounded-xl px-8 shadow-md">{t('quickSettings.done')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

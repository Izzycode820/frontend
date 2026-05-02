'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetWorkmanSettingsDocument } from '@/services/graphql/admin-store/queries/workman/__generated__/WorkmanSettings.generated';
import { WorkmanUpdateSettingsDocument } from '@/services/graphql/admin-store/mutations/workman/__generated__/WorkmanUpdateSettings.generated';
import { WorkmanUpdateStoreMemoDocument } from '@/services/graphql/admin-store/mutations/workman/__generated__/WorkmanUpdateStoreMemo.generated';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Switch } from '@/components/shadcn-ui/switch';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/shadcn-ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shadcn-ui/select';
import { Slider } from '@/components/shadcn-ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { 
  WorkmanWorkmanSettingsLlmProviderChoices,
  WorkmanWorkmanSettingsNewCustomerHandlerChoices
} from '@/types/workspace/store/graphql-base';
import { toast } from 'sonner';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Languages,
  Save,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

export function WorkmanFullSettings() {
  const t = useTranslations('Workman');
  const { data, loading, refetch } = useQuery(GetWorkmanSettingsDocument);
  const [updateSettings, { loading: isUpdating }] = useMutation(WorkmanUpdateSettingsDocument);
  const [updateMemo, { loading: isUpdatingMemo }] = useMutation(WorkmanUpdateStoreMemoDocument);

  const [memoText, setMemoText] = useState('');

  const settings = data?.workmanSettings;

  const handleUpdate = async (variables: any) => {
    try {
      await updateSettings({
        variables,
      });
      toast.success(t('messages.success'));
      refetch();
    } catch (e) {
      toast.error(t('messages.error'));
    }
  };

  const handleUpdateMemo = async () => {
    if (!memoText) return;
    try {
      await updateMemo({
        variables: { memoContent: memoText },
      });
      toast.success(t('messages.syncSuccess'));
      setMemoText('');
    } catch (e) {
      toast.error(t('messages.syncError'));
    }
  };

  if (loading) return <div>{t('loading')}...</div>;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
            <Brain className="size-6" />
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {t('description')}
        </p>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[480px] mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="brain" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.brain')}</TabsTrigger>
          <TabsTrigger value="persona" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.persona')}</TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.schedule')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engine Config */}
            <Card className="rounded-3xl border-primary/10 shadow-sm overflow-hidden bg-card/50">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="size-5 text-primary" />
                  {t('engine.title')}
                </CardTitle>
                <CardDescription>{t('engine.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl border bg-background/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">{t('engine.autoReply')}</Label>
                    <p className="text-[10px] text-muted-foreground">{t('engine.autoReplyDesc')}</p>
                  </div>
                  <Switch 
                    checked={settings?.autoReplyEnabled} 
                    onCheckedChange={(checked) => handleUpdate({ autoReplyEnabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('engine.provider')}</Label>
                  <Select 
                    value={settings?.llmProvider} 
                    onValueChange={(val) => handleUpdate({ llmProvider: val })}
                  >
                    <SelectTrigger className="rounded-xl border-primary/10">
                      <SelectValue placeholder={t('engine.provider')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={WorkmanWorkmanSettingsLlmProviderChoices.Gemini}>{t('engine.gemini')}</SelectItem>
                      <SelectItem value={WorkmanWorkmanSettingsLlmProviderChoices.Deepseek}>{t('engine.deepseek')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('engine.newCustomer')}</Label>
                  <Select 
                    value={settings?.newCustomerHandler} 
                    onValueChange={(val) => handleUpdate({ newCustomerHandler: val })}
                  >
                    <SelectTrigger className="rounded-xl border-primary/10">
                      <SelectValue placeholder={t('engine.newCustomer')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value={WorkmanWorkmanSettingsNewCustomerHandlerChoices.Ai}>{t('engine.ai')}</SelectItem>
                      <SelectItem value={WorkmanWorkmanSettingsNewCustomerHandlerChoices.Merchant}>{t('engine.merchant')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground ml-1">{t('engine.newCustomerDesc')}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground">{t('engine.confidence')}</Label>
                    <span className="text-xs font-mono font-bold text-primary">{Math.round((settings?.minConfidence || 0) * 100)}%</span>
                  </div>
                  <Slider 
                    value={[settings?.minConfidence || 0]} 
                    min={0} 
                    max={1} 
                    step={0.05} 
                    onValueCommit={([val]) => handleUpdate({ minConfidence: val })}
                    className="py-1"
                  />
                  <p className="text-[10px] text-muted-foreground italic ml-1">{t('engine.confidenceDesc')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Language Config */}
            <Card className="rounded-3xl border-primary/10 shadow-sm overflow-hidden bg-card/50">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Languages className="size-5 text-primary" />
                  {t('localization.title')}
                </CardTitle>
                <CardDescription>{t('localization.description')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('localization.primaryLanguage')}</Label>
                  <Input 
                    value={settings?.primaryLanguage} 
                    onChange={(e) => handleUpdate({ primaryLanguage: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border bg-background/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">{t('localization.autoAdapt')}</Label>
                    <p className="text-[10px] text-muted-foreground">{t('localization.autoAdaptDesc')}</p>
                  </div>
                  <Switch 
                    checked={settings?.autoAdaptLanguage} 
                    onCheckedChange={(checked) => handleUpdate({ autoAdaptLanguage: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('localization.supportedLanguages')}</Label>
                  <Input 
                    value={Array.isArray(settings?.supportedLanguages) ? settings.supportedLanguages.join(', ') : settings?.supportedLanguages} 
                    onChange={(e) => handleUpdate({ supportedLanguages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="e.g. en, fr, es"
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brain" className="space-y-6">
           <Card className="rounded-3xl border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="size-5 text-primary" />
                      {t('brain.title')}
                    </CardTitle>
                    <CardDescription>{t('brain.description')}</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-xl gap-2 h-9" 
                    onClick={handleUpdateMemo}
                    disabled={isUpdatingMemo || !memoText}
                  >
                    <RefreshCw className={isUpdatingMemo ? "size-3.5 animate-spin" : "size-3.5"} />
                    {t('brain.sync')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea 
                  placeholder={t('brain.placeholder')}
                  className="min-h-[200px] rounded-2xl border-primary/5 focus-visible:ring-primary/20 bg-muted/30"
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                />

                <div className="mt-6 space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('brain.config')}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'catalogue.md', label: 'brain.catalogue' },
                      { key: 'store_memo.md', label: 'brain.memo' },
                      { key: 'customer_memory.md', label: 'brain.memory' }
                    ].map((config) => (
                      <div key={config.key} className="flex items-center justify-between p-3 rounded-xl border bg-background/50">
                        <Label className="text-xs font-medium cursor-pointer" htmlFor={`brain-${config.key}`}>{t(config.label)}</Label>
                        <Switch 
                          id={`brain-${config.key}`}
                          checked={settings?.brainConfig?.[config.key] || false} 
                          onCheckedChange={(checked) => {
                            const newConfig = { ...settings?.brainConfig, [config.key]: checked };
                            handleUpdate({ brainConfig: newConfig });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 py-3 text-[10px] text-muted-foreground italic flex items-center gap-2">
                <ShieldCheck className="size-3 text-green-500" />
                {t('brain.footer')}
              </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="persona" className="space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['friendly', 'closer', 'advisor', 'customer_service', 'analyser', 'educationer'].map((p) => (
                <Card key={p} className={cn(
                  "rounded-2xl border-primary/10 transition-all cursor-pointer hover:shadow-md",
                  settings?.personas?.[p] ? "bg-primary/[0.03] ring-1 ring-primary/20" : "bg-card/50 grayscale opacity-60"
                )} onClick={() => {
                  const newPersonas = { ...settings?.personas, [p]: !settings?.personas?.[p] };
                  handleUpdate({ personas: newPersonas });
                }}>
                  <CardContent className="p-6 flex flex-col items-center gap-3">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare className="size-6" />
                    </div>
                    <span className="font-bold capitalize">{t(`personas.${p}`)}</span>
                  </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-6">
          <Card className="rounded-3xl border-primary/10 shadow-sm overflow-hidden bg-card/50">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="size-5 text-primary" />
                {t('schedule.title')}
              </CardTitle>
              <CardDescription>{t('schedule.description')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                // Ensure dailyHours is an array
                const rawHours = settings?.operatingHours?.[day] || [];
                const dailyHours = Array.isArray(rawHours) ? rawHours : [];
                const isOpen = dailyHours.length > 0;
                
                return (
                  <div key={day} className="flex flex-col gap-3 p-4 rounded-2xl border bg-background/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "size-2 rounded-full",
                           isOpen ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/30"
                         )} />
                         <span className="font-bold text-sm w-24">{t(`days.${day}`)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-2">
                          {isOpen ? t('schedule.active') : t('schedule.offline')}
                        </span>
                        <Switch 
                          checked={isOpen}
                          onCheckedChange={(checked) => {
                            const newHours = { ...settings?.operatingHours };
                            if (checked) {
                              newHours[day] = [{ start: "09:00", end: "18:00" }];
                            } else {
                              newHours[day] = [];
                            }
                            handleUpdate({ operatingHours: newHours });
                          }}
                        />
                      </div>
                    </div>
                    
                    {isOpen && dailyHours.map((slot: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 pl-5">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex flex-col gap-1 w-full">
                            <Label className="text-[10px] text-muted-foreground uppercase px-1">{t('schedule.start')}</Label>
                            <Input 
                              type="time" 
                              value={slot.start}
                              className="h-9 rounded-lg bg-background/50 border-primary/5"
                              onChange={(e) => {
                                const newHours = JSON.parse(JSON.stringify(settings?.operatingHours || {}));
                                newHours[day][index].start = e.target.value;
                                handleUpdate({ operatingHours: newHours });
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            <Label className="text-[10px] text-muted-foreground uppercase px-1">{t('schedule.end')}</Label>
                            <Input 
                              type="time" 
                              value={slot.end}
                              className="h-9 rounded-lg bg-background/50 border-primary/5"
                              onChange={(e) => {
                                const newHours = JSON.parse(JSON.stringify(settings?.operatingHours || {}));
                                newHours[day][index].end = e.target.value;
                                handleUpdate({ operatingHours: newHours });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

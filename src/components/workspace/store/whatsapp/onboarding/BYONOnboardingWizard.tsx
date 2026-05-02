'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  AlertCircle, 
  HelpCircle, 
  Info, 
  Facebook, 
  MessageSquare, 
  PhoneCall, 
  Loader2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client/react';
import { cn } from '@/lib/utils';
import { loadFacebookSDK, initFacebookSDK, launchWhatsAppSignup } from '@/lib/facebook-sdk';

// Shadcn UI
import { Button } from '@/components/shadcn-ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';

// GraphQL
import { GetWhatsAppConfigDocument } from '@/services/graphql/admin-store/queries/whatsapp/__generated__/GetWhatsAppConfig.generated';
import { ConnectWhatsAppAccountDocument } from '@/services/graphql/admin-store/mutations/whatsapp/__generated__/ConnectWhatsAppAccount.generated';
import { RequestWhatsAppVerificationDocument } from '@/services/graphql/admin-store/mutations/whatsapp/__generated__/RequestWhatsAppVerification.generated';
import { VerifyWhatsAppAccountDocument } from '@/services/graphql/admin-store/mutations/whatsapp/__generated__/VerifyWhatsAppAccount.generated';

type OnboardingStep = 'checklist' | 'connect' | 'method' | 'verify';

interface BYONOnboardingWizardProps {
  onComplete: (account: any) => void;
}

export function BYONOnboardingWizard({ onComplete }: BYONOnboardingWizardProps) {
  const t = useTranslations('WhatsAppOnboarding');
  const [step, setStep] = useState<OnboardingStep>('checklist');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Checklist State
  const [checklist, setChecklist] = useState({
    deleteAccount: false,
    facebookReady: false,
    codeReady: false,
  });

  // Account State (from Meta)
  const [account, setAccount] = useState<{ id: string; phoneNumberId: string } | null>(null);
  const [verifyMethod, setVerifyMethod] = useState<'SMS' | 'VOICE'>('SMS');
  
  // OTP State
  const { data: configData } = useQuery(GetWhatsAppConfigDocument);
  const [appId, setAppId] = useState<string | null>(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);

  useEffect(() => {
    if (configData?.marketingWhatsappConfig?.appId) {
      setAppId(configData.marketingWhatsappConfig.appId);
    }
  }, [configData]);

  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize FB SDK when appId is available
  useEffect(() => {
    if (appId && !sdkInitialized) {
      loadFacebookSDK().then(() => {
        initFacebookSDK(appId);
        setSdkInitialized(true);
        console.log("Meta SDK Initialized with App ID:", appId);
      });
    }
  }, [appId, sdkInitialized]);

  // Mutations
  const [connectAccount] = useMutation(ConnectWhatsAppAccountDocument);
  const [requestVerification] = useMutation(RequestWhatsAppVerificationDocument);
  const [verifyAccount] = useMutation(VerifyWhatsAppAccountDocument);

  const canProceedChecklist = checklist.deleteAccount && checklist.facebookReady && checklist.codeReady;

  // --- Handlers ---

  const handleConnectWithMeta = async () => {
    setBusy(true);
    setError(null);

    if (!appId) {
      setError(t('errors.connect_failed'));
      setBusy(false);
      return;
    }

    try {
      const authResponse = await launchWhatsAppSignup();
      console.log("Meta Auth Response:", authResponse);

      const accessToken = authResponse.accessToken;
      
      // Attempt to get IDs from the response or via API
      let wabaId = authResponse.waba_id;
      let phoneNumberId = authResponse.phone_number_id;

      if (!wabaId || !phoneNumberId) {
        // Fallback: Query accounts for this user
        const fbApi = (path: string) => new Promise<any>((res) => window.FB.api(path, res));
        const accountsRes = await fbApi('/me/whatsapp_business_accounts');
        
        if (accountsRes.data && accountsRes.data.length > 0) {
          const firstAccount = accountsRes.data[0];
          wabaId = firstAccount.id;
          
          const phonesRes = await fbApi(`/${wabaId}/phone_numbers`);
          if (phonesRes.data && phonesRes.data.length > 0) {
             phoneNumberId = phonesRes.data[0].id;
          }
        }
      }

      if (!wabaId || !phoneNumberId) {
        setError(t('errors.no_account'));
        return;
      }

      const { data } = await connectAccount({
        variables: {
          wabaId: wabaId,
          phoneNumberId: phoneNumberId,
          accessToken: accessToken,
          name: "WhatsApp Account",
          displayPhoneNumber: "", // Will be fetched by backend/verification
          isActive: false
        }
      });

      if (data?.connectWhatsappAccount?.success && data.connectWhatsappAccount.account) {
        setAccount({
          id: data.connectWhatsappAccount.account.id,
          phoneNumberId: data.connectWhatsappAccount.account.phoneNumberId
        });
        setStep('method');
      } else {
        setError(data?.connectWhatsappAccount?.error || t('errors.connect_failed'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.connect_failed'));
    } finally {
      setBusy(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!account) return;
    setBusy(true);
    setError(null);
    try {
      const { data } = await requestVerification({
        variables: {
          accountId: account.id,
          method: verifyMethod,
        }
      });

      if (data?.requestWhatsappVerification?.success) {
        setStep('verify');
      } else {
        setError(data?.requestWhatsappVerification?.error || t('errors.connect_failed'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!account) return;
    const code = otpValues.join('');
    if (code.length !== 6) return;

    setBusy(true);
    setError(null);
    try {
      const { data } = await verifyAccount({
        variables: {
          accountId: account.id,
          code: code
        }
      });

      if (data?.verifyWhatsappAccount?.success) {
        onComplete(account);
      } else {
        setError(data?.verifyWhatsappAccount?.error || t('errors.verify_failed'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // --- OTP Logic ---
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // --- Render Steps ---

  const renderStepChecklist = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{t('checklist.warning')}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 flex gap-3">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-blue-900 dark:text-blue-100">{t('checklist.learning')}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border flex gap-3 italic">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">{t('checklist.note')}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => setChecklist(c => ({...c, deleteAccount: !c.deleteAccount}))}>
          <Checkbox id="delete" checked={checklist.deleteAccount} className="mt-1" />
          <Label htmlFor="delete" className="text-sm cursor-pointer group-hover:text-foreground">{t('checklist.item_delete')}</Label>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => setChecklist(c => ({...c, facebookReady: !c.facebookReady}))}>
          <Checkbox id="facebook" checked={checklist.facebookReady} className="mt-1" />
          <Label htmlFor="facebook" className="text-sm cursor-pointer group-hover:text-foreground">{t('checklist.item_facebook')}</Label>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => setChecklist(c => ({...c, codeReady: !checklist.codeReady}))}>
          <Checkbox id="ready" checked={checklist.codeReady} className="mt-1" />
          <Label htmlFor="ready" className="text-sm cursor-pointer group-hover:text-foreground">{t('checklist.item_ready')}</Label>
        </div>
      </div>
      
      <Button 
        className="w-full h-12 text-base font-semibold" 
        onClick={() => setStep('connect')}
        disabled={!canProceedChecklist}
      >
        {t('steps.connect')}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderStepConnect = () => (
    <div className="flex flex-col items-center justify-center py-6 space-y-8">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full" />
        <div className="relative h-20 w-20 bg-background border-2 border-primary rounded-3xl flex items-center justify-center shadow-2xl">
          <Facebook className="h-10 w-10 text-primary" fill="currentColor" />
        </div>
      </div>
      
      <div className="text-center space-y-2 max-w-xs">
        <h3 className="text-xl font-bold font-heading">{t('steps.link')}</h3>
        <p className="text-sm text-muted-foreground">{t('steps.link_description')}</p>
      </div>

      <div className="w-full space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        
        <Button 
          className="w-full h-12 py-6 bg-[#0668E1] hover:bg-[#0668E1]/90 text-white font-bold gap-2 text-lg rounded-xl shadow-lg shadow-blue-500/20"
          onClick={handleConnectWithMeta}
          disabled={busy || !sdkInitialized}
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Facebook fill="currentColor" className="h-6 w-6" />}
          {sdkInitialized ? t('steps.continue_facebook') : "Initializing SDK..."}
        </Button>
        
        <Button variant="ghost" className="w-full" onClick={() => setStep('checklist')} disabled={busy}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('steps.back')}
        </Button>
      </div>
    </div>
  );

  const renderStepMethod = () => (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold font-heading">{t('verify.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('verify.description')}</p>
      </div>

      <RadioGroup value={verifyMethod} onValueChange={(v) => setVerifyMethod(v as any)} className="grid grid-cols-1 gap-4">
        <Label
          htmlFor="sms"
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
            verifyMethod === 'SMS' ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">{t('verify.sms')}</p>
              <p className="text-xs text-muted-foreground">{t('verify.sms_description')}</p>
            </div>
          </div>
          <RadioGroupItem value="SMS" id="sms" />
        </Label>
        
        <Label
          htmlFor="voice"
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
            verifyMethod === 'VOICE' ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
          )}
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PhoneCall className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold">{t('verify.voice')}</p>
              <p className="text-xs text-muted-foreground">{t('verify.voice_description')}</p>
            </div>
          </div>
          <RadioGroupItem value="VOICE" id="voice" />
        </Label>
      </RadioGroup>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <Button className="w-full h-12 text-base font-semibold" onClick={handleRequestVerification} disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {t('verify.request_code')}
      </Button>
    </div>
  );

  const renderStepVerify = () => (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold font-heading">{t('verify.enter_code')}</h3>
        <p className="text-sm text-muted-foreground">{t('verify.code_sent_to', { digits: account?.phoneNumberId.slice(-4) || '....' })}</p>
      </div>

      <div className="flex gap-2 sm:gap-4 justify-center py-2">
        {otpValues.map((value, index) => (
          <Input
            key={index}
            ref={(el) => { otpRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            disabled={busy}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold p-0 bg-muted/30 focus-visible:ring-primary border-2"
          />
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Button 
          className="w-full h-12 text-base font-semibold" 
          onClick={handleVerifyOtp} 
          disabled={busy || otpValues.some(v => !v)}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          {t('verify.verifying')}
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground" 
          onClick={() => setStep('method')}
          disabled={busy}
        >
          {t('verify.change_method')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="border-none shadow-none sm:shadow-sm sm:border bg-background/60 backdrop-blur-md">
        <CardHeader className="pb-4 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-2 sm:hidden">
             {step !== 'checklist' && (
               <Button variant="ghost" size="icon" onClick={() => {
                 if(step === 'verify') setStep('method');
                 else if(step === 'method') setStep('connect');
                 else if(step === 'connect') setStep('checklist');
               }}>
                 <ArrowLeft className="h-4 w-4" />
               </Button>
             )}
          </div>
          <CardTitle className="text-2xl font-bold font-heading tracking-tight">{t('title')}</CardTitle>
          <CardDescription className="text-base">{t('description')}</CardDescription>
        </CardHeader>
        
        {/* Progress Bar */}
        <div className="px-6 pb-4">
           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
              <div className={cn("h-full transition-all duration-300 rounded-full", step === 'checklist' ? "w-1/4 bg-primary" : "w-1/4 bg-primary/40")} />
              <div className={cn("h-full transition-all duration-300 rounded-full", step === 'connect' ? "w-1/4 bg-primary" : step !== 'checklist' ? "w-1/4 bg-primary/40" : "w-0 bg-transparent")} />
              <div className={cn("h-full transition-all duration-300 rounded-full", step === 'method' ? "w-1/4 bg-primary" : (step === 'verify') ? "w-1/4 bg-primary/40" : "w-0 bg-transparent")} />
              <div className={cn("h-full transition-all duration-300 rounded-full", step === 'verify' ? "w-1/4 bg-primary" : "w-0 bg-transparent")} />
           </div>
        </div>

        <CardContent className="pt-2">
           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.2 }}
             >
                {step === 'checklist' && renderStepChecklist()}
                {step === 'connect' && renderStepConnect()}
                {step === 'method' && renderStepMethod()}
                {step === 'verify' && renderStepVerify()}
             </motion.div>
           </AnimatePresence>
        </CardContent>
      </Card>
      
      <p className="text-center text-[10px] text-muted-foreground mt-6 px-6 leading-relaxed">
        {t('footer_terms')}
      </p>
    </div>
  );
}

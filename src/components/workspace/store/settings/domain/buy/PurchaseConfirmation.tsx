'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PurchaseDomainDocument } from '@/services/graphql/domains/mutations/purchases/__generated__/purchaseDomain.generated';
import { PrepareDomainCheckoutDocument } from '@/services/graphql/domains/mutations/purchases/__generated__/prepareDomainCheckout.generated';
import { GetPurchaseStatusDocument } from '@/services/graphql/domains/queries/purchases/__generated__/getPurchaseStatus.generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Switch } from '@/components/shadcn-ui/switch';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Globe, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseConfirmationProps {
  domain: string;
  priceUsd?: number;
}

export function PurchaseConfirmation({ domain }: PurchaseConfirmationProps) {
  const router = useRouter();
  const t = useTranslations('Domains');
  const tGen = useTranslations('General');
  const params = useParams();
  const workspaceId = params.workspace_id as string;

  const [autoRenew, setAutoRenew] = useState(true);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    storeName: '',
    phone: '',
    faxNumber: '',
    country: 'Cameroon',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
  });

  // Prepare checkout mutation (to get authoritative pricing)
  const [prepareCheckout, { data: prepareData, loading: prepareLoading, error: prepareError }] = useMutation(PrepareDomainCheckoutDocument);

  // Purchase domain mutation
  const [purchaseDomain, { loading: purchaseLoading }] = useMutation(PurchaseDomainDocument);

  // Poll purchase status
  const { data: statusData } = useQuery(GetPurchaseStatusDocument, {
    variables: { purchaseId: pollingId || '' },
    skip: !pollingId,
    pollInterval: pollingId ? 2000 : 0, // Poll every 2 seconds only when pollingId is set
  });

  // Fetch pricing on mount
  React.useEffect(() => {
    if (domain && workspaceId) {
      prepareCheckout({
        variables: {
          domain,
          workspaceId
        }
      });
    }
  }, [domain, workspaceId, prepareCheckout]);

  // Handle polling completion
  React.useEffect(() => {
    if (statusData?.purchaseStatus) {
      const status = statusData.purchaseStatus.paymentStatus;
      if (status === 'COMPLETED') {
        toast.success(t('purchaseSuccess'));
        router.push(`/workspace/${workspaceId}/store/settings/domains`);
        setPollingId(null);
      } else if (status === 'FAILED') {
        toast.error(statusData.purchaseStatus.errorMessage || t('purchaseFailed'));
        setPollingId(null);
      }
    }
  }, [statusData, router, workspaceId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prepareData?.prepareDomainCheckout?.success) {
      toast.error(t('verifyPricingError'));
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error(t('fillRequired'));
      return;
    }

    try {
      const { data } = await purchaseDomain({
        variables: {
          workspaceId,
          domain,
          registrationPeriodYears: 1,
          phone: formData.phone,
          address: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}`,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      });

      if (data?.purchaseDomain?.success && data.purchaseDomain.purchase?.id) {
        setPollingId(data.purchaseDomain.purchase.id);
        toast.message(t('paymentInitiated'), {
          description: t('paymentDescription'),
          duration: 10000,
        });
      } else {
        toast.error(data?.purchaseDomain?.error || t('failedToInitiate'));
      }
    } catch (err: any) {
      toast.error(err.message || t('verificationFailed'));
      console.error('Purchase domain error:', err);
    }
  };

  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  // Loading state
  if (prepareLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground animate-pulse">{t('loadingPricing')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (prepareError || (prepareData?.prepareDomainCheckout && !prepareData.prepareDomainCheckout.success)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium text-red-900">{t('unableToLoad')}</h3>
            <p className="mt-2 text-sm text-red-700">
              {prepareData?.prepareDomainCheckout?.error || prepareError?.message || tGen('error')}
            </p>
            <Button
              variant="outline"
              className="mt-4 border-red-200 bg-white text-red-900 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              {tGen('tryAgain')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pricing = prepareData?.prepareDomainCheckout;
  const priceFcfa = pricing?.priceFcfa || 0;
  const priceUsd = pricing?.priceUsd || 0;

  return (
    <div className="space-y-8 pb-10 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/workspace/${workspaceId}/store/settings/domains/buy`)}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Globe className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-xl sm:text-2xl font-bold">{t('buyNew')}</h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* Domain Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{domain}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Auto-renew switch moved inside for better hierarchy */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="auto-renew" className="text-base">
                  {t('autoRenew')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your domain will automatically renew annually.
                </p>
              </div>
              <Switch
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>

            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                {t.rich('whoisPrivacyDesc', {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('contactInfo')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('contactInfoDesc')}
            </p>
          </CardHeader>
          <CardContent>
            <form id="purchase-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
              </div>

              {/* Email and Store Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeName">{t('storeName')}</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
              </div>

              {/* Phone and Fax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneLabel')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g. 677123456"
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    {t('phoneHint')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faxNumber">{t('faxNumber')}</Label>
                  <Input
                    id="faxNumber"
                    type="tel"
                    value={formData.faxNumber}
                    onChange={(e) => handleInputChange('faxNumber', e.target.value)}
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">{t('country')}</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                    disabled={purchaseLoading || !!pollingId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cameroon">Cameroon</SelectItem>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('city')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">{t('address')}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">{t('apartment')}</Label>
                  <Input
                    id="apartment"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
              </div>

              {/* State and Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state">{t('state')}</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t('postalCode')}</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    required
                    disabled={purchaseLoading || !!pollingId}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Purchase Summary - Now a wide card in the stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-b">
              {/* Left Side: Order items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{t('today')}</p>
                    <p className="text-muted-foreground">{t('domainPurchase')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base">{priceFcfa.toLocaleString()} XAF</p>
                    <p className="text-xs text-muted-foreground">(${priceUsd.toFixed(2)} USD)</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold">
                      {renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-muted-foreground">{t('annualRenewal')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base text-muted-foreground">{priceFcfa.toLocaleString()} XAF</p>
                    <p className="text-xs text-muted-foreground">Every year</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Total and Payment */}
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/40 border">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-lg">{t('amountDue')}</p>
                    <div className="text-right">
                      <p className="font-extrabold text-2xl">{priceFcfa.toLocaleString()} XAF</p>
                      <p className="text-xs text-muted-foreground font-medium">(${priceUsd.toFixed(2)} USD)</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Due {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <Alert className="bg-emerald-50 border-emerald-200">
                  <div className="text-sm text-emerald-900 font-medium">
                    {t('momoPaymentDesc', { amount: priceFcfa.toLocaleString() })}
                  </div>
                </Alert>
              </div>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-900 leading-normal">
                {t.rich('nonRefundable', {
                  strong: (chunks) => <strong className="font-bold">{chunks}</strong>
                })}
              </AlertDescription>
            </Alert>

            {/* Final Action */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                form="purchase-form"
                disabled={purchaseLoading || !!pollingId}
                size="lg"
                className="w-full h-14 text-lg font-bold bg-black hover:bg-black/90 text-white transition-all shadow-lg active:scale-[0.98]"
              >
                {pollingId ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-5 w-5" />
                    {t('confirmingPayment')}
                  </>
                ) : purchaseLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-5 w-5" />
                    {t('processing')}
                  </>
                ) : (
                  t('payNow')
                )}
              </Button>
              
              {pollingId && (
                <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-medium animate-pulse">
                  <Info className="h-4 w-4" />
                  {t('checkPhoneReview')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

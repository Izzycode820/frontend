'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { PurchaseDomainDocument } from '@/services/graphql/domains/mutations/purchases/__generated__/purchaseDomain.generated';
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
import { Globe, Info } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseConfirmationProps {
  domain: string;
  priceUsd?: number;
}

export function PurchaseConfirmation({ domain, priceUsd = 16.00 }: PurchaseConfirmationProps) {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspace_id as string;

  const [autoRenew, setAutoRenew] = useState(true);
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

  const [purchaseDomain, { loading }] = useMutation(PurchaseDomainDocument);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
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

      if (data?.purchaseDomain?.success) {
        toast.success('Domain purchase initiated');
        router.push(`/workspace/${workspaceId}/store/settings/domains`);
      } else {
        toast.error(data?.purchaseDomain?.error || 'Failed to purchase domain');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to purchase domain');
      console.error('Purchase domain error:', err);
    }
  };

  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  const priceFcfa = (priceUsd * 600).toFixed(2); // Approximate conversion

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Buy new domain</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{domain}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-renew */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-renew" className="text-sm font-normal">
                  Auto-renew every year
                </Label>
                <Switch
                  id="auto-renew"
                  checked={autoRenew}
                  onCheckedChange={setAutoRenew}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This information will be submitted to Huzilerz's domain registration provider.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email and Store Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store name</Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone and Fax */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+237"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faxNumber">Fax number (Optional)</Label>
                    <Input
                      id="faxNumber"
                      type="tel"
                      value={formData.faxNumber}
                      onChange={(e) => handleInputChange('faxNumber', e.target.value)}
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country/region</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
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

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                {/* Apartment */}
                <div className="space-y-2">
                  <Label htmlFor="apartment">Apartment, suite, etc</Label>
                  <Input
                    id="apartment"
                    value={formData.apartment}
                    onChange={(e) => handleInputChange('apartment', e.target.value)}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>

                {/* State and Postal Code (if needed, add grid) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* WHOIS Privacy */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>WHOIS privacy:</strong> This domain includes WHOIS Privacy. Your contact
                    information won't be displayed in public domain registration records.
                  </AlertDescription>
                </Alert>
              </form>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment method</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Payment via Mobile Money (MTN/Orange). Instructions will be provided after confirmation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Today */}
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">Today</p>
                  <p className="text-muted-foreground">Domain purchase</p>
                </div>
                <p className="font-medium">${priceUsd.toFixed(2)} USD</p>
              </div>

              {/* Next Renewal */}
              <div className="flex justify-between text-sm pb-4 border-b">
                <div>
                  <p className="font-medium">
                    {renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-muted-foreground">Annual renewal</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${priceUsd.toFixed(2)} USD</p>
                  <p className="text-xs text-muted-foreground">Every year</p>
                </div>
              </div>

              {/* Amount Due */}
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">Amount due</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${priceUsd.toFixed(2)} USD</p>
                  <p className="text-xs text-muted-foreground">plus applicable taxes</p>
                </div>
              </div>

              {/* Buy Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-black hover:bg-black/90 text-white"
              >
                {loading ? 'Processing...' : 'Buy domain'}
              </Button>

              {/* Warning */}
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-900">
                  This is a <strong>non-refundable purchase</strong> and will be charged immediately.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

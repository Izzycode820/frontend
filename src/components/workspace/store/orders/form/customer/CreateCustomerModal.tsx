import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn-ui/dialog';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Separator } from '@/components/shadcn-ui/separator';
import { useMutation } from '@apollo/client/react';
import { CreateCustomerDocument } from '@/services/graphql/admin-store/mutations/customers/__generated__/CreateCustomer.generated';
import { toast } from 'sonner';
import type { CreateCustomerModalProps, CustomerFormData } from './types';

const CAMEROON_REGIONS = [
  { value: 'centre', label: 'Centre' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'west', label: 'West' },
  { value: 'northwest', label: 'Northwest' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'adamawa', label: 'Adamawa' },
  { value: 'east', label: 'East' },
  { value: 'far_north', label: 'Far North' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
] as const;
export function CreateCustomerModal({
  open,
  onOpenChange,
  onCustomerCreated,
}: CreateCustomerModalProps) {
  const t = useTranslations('Orders.form.customer');
  const commonT = useTranslations('Orders.form');
  
  const CUSTOMER_TYPES = [
    { value: 'individual', label: t('types.individual') },
    { value: 'business', label: t('types.business') },
  ] as const;

  const CAMEROON_REGIONS_LOCALIZED = [
    { value: 'centre', label: useTranslations('Orders.filters.regions')('centre') },
    { value: 'littoral', label: useTranslations('Orders.filters.regions')('littoral') },
    { value: 'west', label: useTranslations('Orders.filters.regions')('west') },
    { value: 'northwest', label: useTranslations('Orders.filters.regions')('northwest') },
    { value: 'southwest', label: useTranslations('Orders.filters.regions')('southwest') },
    { value: 'adamawa', label: useTranslations('Orders.filters.regions')('adamawa') },
    { value: 'east', label: useTranslations('Orders.filters.regions')('east') },
    { value: 'far_north', label: useTranslations('Orders.filters.regions')('far_north') },
    { value: 'north', label: useTranslations('Orders.filters.regions')('north') },
    { value: 'south', label: useTranslations('Orders.filters.regions')('south') },
  ];

  const CAMEROON_PHONE_REGEX = /^\+237[0-9]{9}$/;
  const validateCameroonPhone = (phone: string) => CAMEROON_PHONE_REGEX.test(phone);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    defaultValues: {
      phone: '+237',
      name: '',
      email: '',
      customerType: 'individual',
      city: '',
      region: '',
      address: '',
      tags: '',
      smsNotifications: true,
      whatsappNotifications: true,
    },
  });

  const region = watch('region');
  const customerType = watch('customerType');
  const smsNotifications = watch('smsNotifications');
  const whatsappNotifications = watch('whatsappNotifications');

  const [createCustomer, { loading }] = useMutation(CreateCustomerDocument, {
    onCompleted: (data) => {
      if (data.createCustomer?.success && data.createCustomer?.customer) {
        toast.success(commonT('messages.successCreateCustomer', { name: data.createCustomer.customer.name }));
        onCustomerCreated(data.createCustomer.customer.id);
        onOpenChange(false);
        reset();
      } else {
        toast.error(data.createCustomer?.error || commonT('messages.errorCreateCustomer'));
      }
    },
    onError: (error) => {
      toast.error(error.message || commonT('messages.errorUnexpected'));
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    // Validate phone
    if (!validateCameroonPhone(data.phone)) {
      toast.error(t('errors.phoneFormat'));
      return;
    }

    // Parse tags if provided
    const tagsArray = data.tags
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    await createCustomer({
      variables: {
        customerData: {
          phone: data.phone,
          name: data.name,
          email: data.email || undefined,
          customerType: data.customerType || 'individual',
          city: data.city || undefined,
          region: data.region || undefined,
          address: data.address || undefined,
          tags: tagsArray.length > 0 ? JSON.stringify(tagsArray) : undefined,
          smsNotifications: data.smsNotifications ?? true,
          whatsappNotifications: data.whatsappNotifications ?? true,
        },
      },
    });
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createModal.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('fields.basic')}</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t('fields.phone')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone', {
                    required: t('errors.phoneRequired'),
                    validate: (value) =>
                      validateCameroonPhone(value) ||
                      t('errors.phoneFormat'),
                  })}
                  placeholder="+237 670 123 456"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('fields.fullName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name', {
                    required: t('errors.nameRequired'),
                    minLength: {
                      value: 2,
                      message: t('errors.nameMinLength'),
                    },
                  })}
                  placeholder="John Doe"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('errors.emailFormat'),
                    },
                  })}
                  placeholder="john.doe@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Customer Type */}
              <div className="space-y-2">
                <Label htmlFor="customerType">{t('fields.type')}</Label>
                <Select
                  value={customerType || 'individual'}
                  onValueChange={(value) => setValue('customerType', value)}
                >
                  <SelectTrigger id="customerType">
                    <SelectValue placeholder={commonT('placeholders.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('fields.location')}</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">{t('fields.city')}</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Douala"
                />
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region">{t('fields.region')}</Label>
                <Select
                  value={region || ''}
                  onValueChange={(value) => setValue('region', value)}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder={commonT('placeholders.selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_REGIONS_LOCALIZED.map((reg) => (
                      <SelectItem key={reg.value} value={reg.value}>
                        {reg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('fields.address')}</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder={commonT('placeholders.enterAddress')}
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('fields.additional')}</h3>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">{t('fields.tags')}</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="VIP, Wholesale, Returning (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                {commonT('placeholders.tagsHint')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('fields.notifications')}</h3>

            <div className="space-y-3">
              {/* SMS Notifications */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  checked={smsNotifications}
                  onCheckedChange={(checked) =>
                    setValue('smsNotifications', checked as boolean)
                  }
                />
                <Label
                  htmlFor="smsNotifications"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('fields.sms')}
                </Label>
              </div>

              {/* WhatsApp Notifications */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsappNotifications"
                  checked={whatsappNotifications}
                  onCheckedChange={(checked) =>
                    setValue('whatsappNotifications', checked as boolean)
                  }
                />
                <Label
                  htmlFor="whatsappNotifications"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('fields.whatsapp')}
                </Label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              {commonT('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? commonT('actions.creating') : commonT('actions.addCustomer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

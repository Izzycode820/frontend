'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Textarea } from '@/components/shadcn-ui/textarea';
import { Button } from '@/components/shadcn-ui/button';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { GetStoreProfileDocument } from '@/services/graphql/admin-store/queries/settings/__generated__/GetStoreProfile.generated';
import { UpdateStoreProfileDocument } from '@/services/graphql/admin-store/mutations/settings/__generated__/UpdateStoreProfile.generated';
import {
    IconBuilding,
    IconMail,
    IconBrandWhatsapp,
    IconPhone,
    IconInfoCircle,
    IconDeviceFloppy,
    IconLoader2,
    IconArrowLeft,
    IconPalette,
    IconWorld,
    IconMapPin,
    IconHash,
    IconRuler2,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { ColorPicker } from './ColorPicker';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/shadcn-ui/select';
import { Checkbox } from '@/components/shadcn-ui/checkbox';

const COUNTRY_CODES = [
    { code: '+237', label: 'CM (+237)' },
    { code: '+236', label: 'CF (+236)' },
    { code: '+235', label: 'TD (+235)' },
    { code: '+240', label: 'GQ (+240)' },
    { code: '+241', label: 'GA (+241)' },
    { code: '+242', label: 'CG (+242)' },
    { code: '+234', label: 'NG (+234)' },
    { code: '+90', label: 'TR (+90)' },
];

export function GeneralSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const t = useTranslations('General');

    // Form state
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [storeEmail, setStoreEmail] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneCode, setPhoneCode] = useState('+237');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [whatsappCode, setWhatsappCode] = useState('+237');
    
    // Branding
    const [primaryColor, setPrimaryColor] = useState('');
    const [secondaryColor, setSecondaryColor] = useState('');
    const [accentColor, setAccentColor] = useState('');
    
    // Intl
    const [currency, setCurrency] = useState('XAF');
    const [defaultLocale, setDefaultLocale] = useState('en');
    const [supportedLocales, setSupportedLocales] = useState<string[]>([]);
    const [timezone, setTimezone] = useState('Africa/Douala');

    // Order Customization
    const [orderPrefix, setOrderPrefix] = useState('');
    const [orderSuffix, setOrderSuffix] = useState('');

    // Units
    const [weightUnit, setWeightUnit] = useState('kg');
    const [dimensionUnit, setDimensionUnit] = useState('cm');

    // Business Info
    const [legalName, setLegalName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Cameroon');

    const [isDirty, setIsDirty] = useState(false);

    // Query store profile
    const { data, loading, error } = useQuery(GetStoreProfileDocument);

    // Mutation
    const [updateProfile, { loading: saving }] = useMutation(UpdateStoreProfileDocument);

    // Populate form when data loads (strip +237 prefix for display)
    useEffect(() => {
        if (data?.storeProfile) {
            const profile = data.storeProfile;
            setStoreName(profile.storeName || '');
            setStoreDescription(profile.storeDescription || '');
            setStoreEmail(profile.storeEmail || '');
            setSupportEmail(profile.supportEmail || '');
            // Safe parsing of numbers into Code + Value
            const parsePhone = (full: string | null | undefined, defaultCode = '+237') => {
                if (!full) return { code: defaultCode, number: '' };
                const found = COUNTRY_CODES.find(c => full.startsWith(c.code));
                if (found) {
                    return { code: found.code, number: full.substring(found.code.length).trim() };
                }
                return { code: defaultCode, number: full.trim() }; 
            };

            const parsedPhone = parsePhone(profile.phoneNumber);
            setPhoneCode(parsedPhone.code);
            setPhoneNumber(parsedPhone.number);

            const parsedWhatsApp = parsePhone(profile.whatsappNumber);
            setWhatsappCode(parsedWhatsApp.code);
            setWhatsappNumber(parsedWhatsApp.number);
            
            // Branding
            setPrimaryColor(profile.primaryColor || '');
            setSecondaryColor(profile.secondaryColor || '');
            setAccentColor(profile.accentColor || '');

            // Intl
            setCurrency(profile.currency || 'XAF');
            setDefaultLocale(profile.defaultLocale || 'en');
            
            // Robust locale handling
            let locales = profile.supportedLocales || [];
            if (typeof locales === 'string') {
                try {
                    locales = JSON.parse(locales);
                } catch {
                    locales = [];
                }
            }
            setSupportedLocales(Array.isArray(locales) ? locales : []);
            
            setTimezone(profile.timezone || 'Africa/Douala');

            // Order
            setOrderPrefix(profile.orderPrefix || '');
            setOrderSuffix(profile.orderSuffix || '');

            // Units
            setWeightUnit(profile.weightUnit || 'kg');
            setDimensionUnit(profile.dimensionUnit || 'cm');

            // Business
            setLegalName(profile.legalName || '');
            setAddressLine1(profile.addressLine1 || '');
            setAddressLine2(profile.addressLine2 || '');
            setCity(profile.city || '');
            setState(profile.state || '');
            setPostalCode(profile.postalCode || '');
            setCountry(profile.country || 'Cameroon');
        }
    }, [data]);

    // Track changes
    const handleChange = (setter: (value: string) => void) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setter(e.target.value);
        setIsDirty(true);
    };

    // Safe builder function before saving
    const buildFullPhone = (code: string, number: string): string | null => {
        if (!number || !number.trim()) return null;
        // if user magically pasted +237 ... strip code overlaps dynamically just in case
        let cleanNumber = number.trim().replace(/^0+/, ''); // strip leading zeros
        if (cleanNumber.startsWith(code)) {
            cleanNumber = cleanNumber.substring(code.length).trim();
        } else if (cleanNumber.startsWith('+')) {
            // They pasted a full international string, just trust it directly bypass code
            return cleanNumber;
        }
        return `${code}${cleanNumber}`;
    };

    // Save handler
    const handleSave = async () => {
        try {
            const result = await updateProfile({
                variables: {
                    input: {
                        storeName: storeName || null,
                        storeDescription: storeDescription || null,
                        storeEmail: storeEmail || null,
                        supportEmail: supportEmail || null,
                        phoneNumber: buildFullPhone(phoneCode, phoneNumber),
                        whatsappNumber: buildFullPhone(whatsappCode, whatsappNumber),
                        primaryColor: primaryColor || null,
                        secondaryColor: secondaryColor || null,
                        accentColor: accentColor || null,
                        currency: currency,
                        defaultLocale: defaultLocale,
                        supportedLocales: supportedLocales,
                        timezone: timezone,
                        orderPrefix: orderPrefix || null,
                        orderSuffix: orderSuffix || null,
                        weightUnit: weightUnit?.toLowerCase(),
                        dimensionUnit: dimensionUnit?.toLowerCase(),
                        legalName: legalName || null,
                        addressLine1: addressLine1 || null,
                        addressLine2: addressLine2 || null,
                        city: city || null,
                        state: state || null,
                        postalCode: postalCode || null,
                        country: country || null,
                    },
                },
            });

            if (result.data?.updateStoreProfile?.success) {
                toast.success(t('settingsSaved'), {
                    description: t('settingsSavedDesc'),
                });
                setIsDirty(false);
            } else {
                toast.error(t('error'), {
                    description: result.data?.updateStoreProfile?.error || t('failedToSaveGeneric'),
                });
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            toast.error(t('error'), {
                description: t('failedToSave'),
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-80 w-full max-w-[1000px] mx-auto" />
                <Skeleton className="h-64 w-full max-w-[1000px] mx-auto" />
                <Skeleton className="h-48 w-full max-w-[1000px] mx-auto" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-[1000px] mx-auto px-6">
                <Alert variant="destructive">
                    <div className="font-semibold">{t('errorLoading')}</div>
                    <div className="text-sm">{error.message}</div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6 pb-10">
            {/* Store Identity Card */}
            <div className="w-full">
                <div className="flex items-center gap-2 mb-4 md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/workspace/${params.workspace_id}/store/settings`)}>
                        <IconArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold">{t('title')}</h1>
                </div>

                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconBuilding className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('storeIdentity')}</h2>
                    </div>

                    <div className="space-y-5">
                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="storeName" className="text-sm font-medium">
                                {t('storeName')}
                            </Label>
                            <Input
                                id="storeName"
                                type="text"
                                value={storeName}
                                onChange={handleChange(setStoreName)}
                                maxLength={255}
                                placeholder={t('storeNamePlaceholder')}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('charUsed', { count: storeName.length, total: 255 })}
                            </p>
                        </div>

                        {/* Store Description */}
                        <div className="space-y-2">
                            <Label htmlFor="storeDescription" className="text-sm font-medium">
                                {t('storeDescription')}
                            </Label>
                            <Textarea
                                id="storeDescription"
                                value={storeDescription}
                                onChange={handleChange(setStoreDescription)}
                                maxLength={500}
                                rows={4}
                                placeholder={t('storeDescriptionPlaceholder')}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('charUsed', { count: storeDescription.length, total: 500 })}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Contact Information Card */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconMail className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('contactInfo')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Store Email */}
                        <div className="space-y-2">
                            <Label htmlFor="storeEmail" className="text-sm font-medium">
                                {t('storeEmail')}
                            </Label>
                            <Input
                                id="storeEmail"
                                type="email"
                                value={storeEmail}
                                onChange={handleChange(setStoreEmail)}
                                placeholder="store@example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('storeEmailHint')}
                            </p>
                        </div>

                        {/* Support Email */}
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail" className="text-sm font-medium">
                                {t('supportEmail')}
                            </Label>
                            <Input
                                id="supportEmail"
                                type="email"
                                value={supportEmail}
                                onChange={handleChange(setSupportEmail)}
                                placeholder="support@example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('supportEmailHint')}
                            </p>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-sm font-medium">
                                {t('phoneNumber')}
                            </Label>
                            <div className="flex">
                                <Select value={phoneCode} onValueChange={(v) => { setPhoneCode(v); setIsDirty(true); }}>
                                    <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 bg-muted/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRY_CODES.map(c => (
                                            <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={handleChange(setPhoneNumber)}
                                    placeholder="612 34 56 78"
                                    className="rounded-l-none"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('phoneHint')}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* WhatsApp Settings Card - Relocated to 3rd position */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconBrandWhatsapp className="w-5 h-5 text-green-600" />
                        <h2 className="text-base font-semibold">{t('whatsappCheckout')}</h2>
                        <IconInfoCircle className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <Alert className="bg-green-500/10 border-green-500/20 mb-5">
                        <IconBrandWhatsapp className="h-4 w-4 text-green-600" />
                        <AlertDescription className="ml-2 text-sm text-green-900 dark:text-green-300">
                            {t('whatsappAlert')}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="whatsappNumber" className="text-sm font-medium">
                            {t('whatsappNumber')}
                        </Label>
                        <div className="flex max-w-md">
                                <Select value={whatsappCode} onValueChange={(v) => { setWhatsappCode(v); setIsDirty(true); }}>
                                    <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 bg-muted/30">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRY_CODES.map(c => (
                                            <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            <Input
                                id="whatsappNumber"
                                type="tel"
                                value={whatsappNumber}
                                onChange={handleChange(setWhatsappNumber)}
                                placeholder="612 34 56 78"
                                className="rounded-l-none"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('whatsappHint')}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Branding Card with Professional Color Pickers */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconPalette className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('branding')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary Color */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('primaryColor')}</Label>
                            <ColorPicker 
                                value={primaryColor} 
                                onChange={(c) => { setPrimaryColor(c); setIsDirty(true); }}
                                placeholder="#000000"
                            />
                            <p className="text-[10px] text-muted-foreground">{t('primaryColorHint')}</p>
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('secondaryColor')}</Label>
                            <ColorPicker 
                                value={secondaryColor} 
                                onChange={(c) => { setSecondaryColor(c); setIsDirty(true); }}
                                placeholder="#FFFFFF"
                            />
                            <p className="text-[10px] text-muted-foreground">{t('secondaryColorHint')}</p>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('accentColor')}</Label>
                            <ColorPicker 
                                value={accentColor} 
                                onChange={(c) => { setAccentColor(c); setIsDirty(true); }}
                                placeholder="#33CCFF"
                            />
                            <p className="text-[10px] text-muted-foreground">{t('accentColorHint')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Internationalization Card */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconWorld className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('intl')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Currency */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('currency')}</Label>
                            <Select value={currency} onValueChange={(v) => { setCurrency(v); setIsDirty(true); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="XAF">XAF - Central African Franc</SelectItem>
                                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{t('currencyHint')}</p>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Timezone</Label>
                            <Select value={timezone} onValueChange={(v) => { setTimezone(v); setIsDirty(true); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Africa/Douala">Douala (UTC+1)</SelectItem>
                                    <SelectItem value="Africa/Lagos">Lagos (UTC+1)</SelectItem>
                                    <SelectItem value="UTC">UTC</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{t('timezoneHint')}</p>
                        </div>

                        {/* Default Locale */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('defaultLocale')}</Label>
                            <Select value={defaultLocale} onValueChange={(v) => { setDefaultLocale(v); setIsDirty(true); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{t('localeHint')}</p>
                        </div>

                        {/* Supported Locales (Checkboxes) */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium">{t('supportedLocales')}</Label>
                            <div className="flex gap-6 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="lang-en" 
                                        checked={supportedLocales.includes('en')} 
                                        onCheckedChange={(checked) => {
                                            const newLocales = checked 
                                                ? [...supportedLocales, 'en'] 
                                                : supportedLocales.filter(l => l !== 'en');
                                            setSupportedLocales(newLocales);
                                            setIsDirty(true);
                                        }}
                                    />
                                    <Label htmlFor="lang-en" className="text-sm font-normal cursor-pointer">English</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="lang-fr" 
                                        checked={supportedLocales.includes('fr')} 
                                        onCheckedChange={(checked) => {
                                            const newLocales = checked 
                                                ? [...supportedLocales, 'fr'] 
                                                : supportedLocales.filter(l => l !== 'fr');
                                            setSupportedLocales(newLocales);
                                            setIsDirty(true);
                                        }}
                                    />
                                    <Label htmlFor="lang-fr" className="text-sm font-normal cursor-pointer">French</Label>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{t('supportedLocalesHint')}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Order Customization Card */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconHash className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('orderCustomization')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('orderPrefix')}</Label>
                                <Input value={orderPrefix} onChange={handleChange(setOrderPrefix)} placeholder="e.g. SNK-" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('orderSuffix')}</Label>
                                <Input value={orderSuffix} onChange={handleChange(setOrderSuffix)} placeholder="e.g. -CM" />
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 flex flex-col justify-center items-center border border-dashed">
                            <span className="text-xs text-muted-foreground mb-2">{t('orderPreview')}</span>
                            <span className="text-xl font-mono font-bold text-primary">
                                {orderPrefix}1024{orderSuffix}
                            </span>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">{t('orderCustomizationHint')}</p>
                </Card>
            </div>

            {/* Business Card */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconMapPin className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('businessInfo')}</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('legalName')}</Label>
                            <Input value={legalName} onChange={handleChange(setLegalName)} placeholder="Legal entity name" />
                            <p className="text-xs text-muted-foreground">{t('legalNameHint')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('addressLine1')}</Label>
                                <Input value={addressLine1} onChange={handleChange(setAddressLine1)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('addressLine2')}</Label>
                                <Input value={addressLine2} onChange={handleChange(setAddressLine2)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('city')}</Label>
                                <Input value={city} onChange={handleChange(setCity)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('state')}</Label>
                                <Input value={state} onChange={handleChange(setState)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('postalCode')}</Label>
                                <Input value={postalCode} onChange={handleChange(setPostalCode)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('country')}</Label>
                                <Input value={country} onChange={handleChange(setCountry)} />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Measurements Card */}
            <div className="w-full">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <IconRuler2 className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">{t('measurements')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('weightUnit')}</Label>
                            <Select value={weightUnit} onValueChange={(v) => { setWeightUnit(v); setIsDirty(true); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">kg - Kilograms</SelectItem>
                                    <SelectItem value="g">g - Grams</SelectItem>
                                    <SelectItem value="lb">lb - Pounds</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('dimensionUnit')}</Label>
                            <Select value={dimensionUnit} onValueChange={(v) => { setDimensionUnit(v); setIsDirty(true); }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cm">cm - Centimeters</SelectItem>
                                    <SelectItem value="m">m - Meters</SelectItem>
                                    <SelectItem value="in">in - Inches</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </div>


            {/* Save Button */}
            <div className="w-full pb-6">
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="gap-2"
                    >
                        {saving ? (
                            <>
                                <IconLoader2 className="w-4 h-4 animate-spin" />
                                {t('saving')}
                            </>
                        ) : (
                            <>
                                <IconDeviceFloppy className="w-4 h-4" />
                                {t('save')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

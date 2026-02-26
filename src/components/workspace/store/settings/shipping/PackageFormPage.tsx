'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn-ui/select';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { CreatePackageDocument } from '@/services/graphql/admin-store/mutations/shipping/__generated__/CreatePackage.generated';
import { UpdatePackageDocument } from '@/services/graphql/admin-store/mutations/shipping/__generated__/UpdatePackage.generated';
import { GetPackagesDocument } from '@/services/graphql/admin-store/queries/shipping/__generated__/GetPackages.generated';
import {
    IconArrowLeft,
    IconPlus,
    IconTrash,
    IconLoader2,
    IconPackage,
} from '@tabler/icons-react';

interface PackageFormPageProps {
    mode: 'create' | 'edit';
    packageId?: string;
}

interface RegionFee {
    region: string;
    fee: string;
}

/**
 * Package Form Page
 * 
 * Form for creating or editing shipping packages.
 * Handles region fees as dynamic list.
 */
export function PackageFormPage({ mode, packageId }: PackageFormPageProps) {
    const router = useRouter();
    const params = useParams();
    const t = useTranslations('Shipping');
    const tGen = useTranslations('General');
    const workspaceId = params.workspace_id as string;

    // Form state
    const [name, setName] = useState('');
    const [packageType, setPackageType] = useState('box');
    const [size, setSize] = useState('small');
    const [weight, setWeight] = useState('');
    const [method, setMethod] = useState('');
    const [regionFees, setRegionFees] = useState<RegionFee[]>([{ region: '', fee: '' }]);
    const [estimatedDays, setEstimatedDays] = useState('');
    const [useAsDefault, setUseAsDefault] = useState(false);
    const [isActive, setIsActive] = useState(true);

    // Query for existing package (edit mode)
    const { data: packagesData, loading: loadingPackage } = useQuery(GetPackagesDocument, {
        variables: { first: 100 },
        skip: mode === 'create',
    });

    // Mutations
    const [createPackage, { loading: creating }] = useMutation(CreatePackageDocument);
    const [updatePackage, { loading: updating }] = useMutation(UpdatePackageDocument);

    const isLoading = creating || updating;

    // Populate form for edit mode
    useEffect(() => {
        if (mode === 'edit' && packagesData?.packages?.edges && packageId) {
            const pkg = packagesData.packages.edges
                .map(e => e?.node)
                .find(n => n?.id === packageId);

            if (pkg) {
                setName(pkg.name || '');
                setPackageType(pkg.packageType?.toLowerCase() || 'box');
                setSize(pkg.size?.toLowerCase() || 'small');
                setWeight(pkg.weight ? String(pkg.weight) : '');
                setMethod(pkg.method || '');
                setEstimatedDays(pkg.estimatedDays || '');
                setUseAsDefault(pkg.useAsDefault || false);
                setIsActive(pkg.isActive ?? true);

                // Parse region fees (can be JSON string or object)
                let parsedFees: Record<string, number> = {};
                if (pkg.regionFees) {
                    if (typeof pkg.regionFees === 'string') {
                        try {
                            parsedFees = JSON.parse(pkg.regionFees);
                        } catch {
                            parsedFees = {};
                        }
                    } else if (typeof pkg.regionFees === 'object') {
                        parsedFees = pkg.regionFees;
                    }
                }

                const fees = Object.entries(parsedFees).map(([region, fee]) => ({
                    region,
                    fee: String(fee),
                }));
                if (fees.length > 0) {
                    setRegionFees(fees);
                }
            }
        }
    }, [mode, packagesData, packageId]);

    // Handle region fee changes
    const handleRegionFeeChange = (index: number, field: 'region' | 'fee', value: string) => {
        setRegionFees(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const addRegionFee = () => {
        setRegionFees(prev => [...prev, { region: '', fee: '' }]);
    };

    const removeRegionFee = (index: number) => {
        setRegionFees(prev => prev.filter((_, i) => i !== index));
    };

    // Navigate back
    const goBack = () => {
        router.push(`/workspace/${workspaceId}/store/settings/shipping`);
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!name.trim()) {
            toast.error(t('nameRequired'));
            return;
        }

        // Convert region fees to object
        const regionFeesObject: Record<string, number> = {};
        regionFees.forEach(({ region, fee }) => {
            if (region && fee) {
                regionFeesObject[region] = parseFloat(fee);
            }
        });

        const input = {
            name: name.trim(),
            packageType,
            size,
            weight: weight ? parseFloat(weight) : null,
            method: method.trim(),
            regionFees: JSON.stringify(regionFeesObject),
            estimatedDays: estimatedDays || '3-5',
            useAsDefault,
            isActive,
        };

        try {
            if (mode === 'create') {
                const result = await createPackage({
                    variables: { input },
                });

                if (result.data?.createPackage?.success) {
                    toast.success(t('createSuccess'));
                    goBack();
                } else {
                    toast.error(tGen('error'), {
                        description: result.data?.createPackage?.error || t('saveFailed'),
                    });
                }
            } else {
                const result = await updatePackage({
                    variables: { id: packageId!, input },
                });

                if (result.data?.updatePackage?.success) {
                    toast.success(t('updateSuccess'));
                    goBack();
                } else {
                    toast.error(tGen('error'), {
                        description: result.data?.updatePackage?.error || t('saveFailed'),
                    });
                }
            }
        } catch (err) {
            console.error('Save failed:', err);
            toast.error(tGen('error'), { description: t('saveFailed') });
        }
    };

    if (mode === 'edit' && loadingPackage) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-16 w-full max-w-[800px] mx-auto" />
                <Skeleton className="h-96 w-full max-w-[800px] mx-auto" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goBack}
                            className="-ml-2"
                        >
                            <IconArrowLeft className="h-5 w-5" />
                        </Button>
                        <IconPackage className="h-6 w-6 text-muted-foreground" />
                        <h1 className="text-2xl font-bold tracking-tight">
                            {mode === 'create' ? t('addPackageTitle') : t('editPackageTitle')}
                        </h1>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    {mode === 'create' ? t('addPackageDesc') : t('editPackageDesc')}
                </p>
            </div>

            {/* Form */}
            <div className="w-full">
                <form onSubmit={handleSubmit}>
                    <Card className="p-6">
                        <div className="space-y-6">
                            {/* Package Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('packageName')}</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('packageNamePlaceholder')}
                                    required
                                />
                            </div>

                            {/* Type and Size */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('type')}</Label>
                                    <Select value={packageType} onValueChange={setPackageType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="box">{t('box')}</SelectItem>
                                            <SelectItem value="envelope">{t('envelope')}</SelectItem>
                                            <SelectItem value="soft_package">{t('softPackage')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('size')}</Label>
                                    <Select value={size} onValueChange={setSize}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">{t('small')}</SelectItem>
                                            <SelectItem value="medium">{t('medium')}</SelectItem>
                                            <SelectItem value="large">{t('large')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Weight and Method */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight">{t('weight')}</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="method">{t('method')}</Label>
                                    <Input
                                        id="method"
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        placeholder={t('shippingMethodPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Region Fees */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>{t('regionFees')}</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addRegionFee}
                                        className="gap-1"
                                    >
                                        <IconPlus className="w-3 h-3" />
                                        {t('addRegion')}
                                    </Button>
                                </div>
                                {regionFees.map((rf, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-3 items-end">
                                        <div className="space-y-1">
                                            <Label className="text-xs">{t('regionLabel', { count: index + 1 })}</Label>
                                            <Input
                                                value={rf.region}
                                                onChange={(e) => handleRegionFeeChange(index, 'region', e.target.value)}
                                                placeholder="e.g., Yaounde, Douala"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs">{t('feeLabel')}</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={rf.fee}
                                                    onChange={(e) => handleRegionFeeChange(index, 'fee', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </div>
                                            {regionFees.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeRegionFee(index)}
                                                    className="text-destructive hover:text-destructive self-end"
                                                >
                                                    <IconTrash className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground">
                                    {t('regionFeesHint')}
                                </p>
                            </div>

                            {/* Estimated Days */}
                            <div className="space-y-2">
                                <Label htmlFor="estimatedDays">{t('estDaysLabel')}</Label>
                                <Input
                                    id="estimatedDays"
                                    value={estimatedDays}
                                    onChange={(e) => setEstimatedDays(e.target.value)}
                                    placeholder={t('estDaysPlaceholder')}
                                    required
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="useAsDefault"
                                        checked={useAsDefault}
                                        onCheckedChange={(checked) => setUseAsDefault(checked === true)}
                                    />
                                    <Label htmlFor="useAsDefault" className="text-sm">
                                        {t('useAsDefault')}
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(checked === true)}
                                    />
                                    <Label htmlFor="isActive" className="text-sm">
                                        {t('isPackageActive')}
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={goBack}>
                            {tGen('cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('saving')}
                                </>
                            ) : mode === 'create' ? (
                                t('createPackage')
                            ) : (
                                t('saveChanges')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

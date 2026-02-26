'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/shadcn-ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn-ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/shadcn-ui/popover';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { GetPackagesDocument } from '@/services/graphql/admin-store/queries/shipping/__generated__/GetPackages.generated';
import { DeletePackageDocument } from '@/services/graphql/admin-store/mutations/shipping/__generated__/DeletePackage.generated';
import {
    IconPackage,
    IconPlus,
    IconPencil,
    IconTrash,
    IconLoader2,
    IconCheck,
    IconMapPin,
    IconChevronDown,
    IconArrowLeft,
} from '@tabler/icons-react';

/**
 * Shipping Packages List Page
 * 
 * Displays all shipping packages in a table with edit/delete actions.
 * Links to add-package page for creating new packages.
 */
export function ShippingPackagesListPage() {
    const router = useRouter();
    const params = useParams();
    const t = useTranslations('Shipping');
    const tGen = useTranslations('General');
    const workspaceId = params.workspace_id as string;

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<{
        id: string;
        name: string;
    } | null>(null);

    // Query
    const { data, loading, error, refetch } = useQuery(GetPackagesDocument, {
        variables: { first: 50 },
    });

    // Delete mutation
    const [deletePackage, { loading: deleting }] = useMutation(DeletePackageDocument);

    // Navigate to add page
    const goToAddPage = () => {
        router.push(`/workspace/${workspaceId}/store/settings/shipping/add-package`);
    };

    // Navigate to edit page
    const goToEditPage = (packageId: string) => {
        router.push(`/workspace/${workspaceId}/store/settings/shipping/${packageId}/edit`);
    };

    // Handle delete
    const handleDelete = async () => {
        if (!selectedPackage) return;

        try {
            const result = await deletePackage({
                variables: { id: selectedPackage.id },
            });

            if (result.data?.deletePackage?.success) {
                toast.success(t('deleteSuccess'));
                setShowDeleteModal(false);
                setSelectedPackage(null);
                refetch();
            } else {
                toast.error(tGen('error'), {
                    description: result.data?.deletePackage?.error || t('deleteFailed'),
                });
            }
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error(tGen('error'), { description: t('deleteFailed') });
        }
    };

    // Parse region fees from JSON string
    const parseRegionFees = (regionFees: any): Record<string, number> => {
        if (!regionFees) return {};
        if (typeof regionFees === 'string') {
            try {
                return JSON.parse(regionFees);
            } catch {
                return {};
            }
        }
        if (typeof regionFees === 'object') return regionFees;
        return {};
    };

    // Region fees dropdown component
    const RegionFeesCell = ({ regionFees }: { regionFees: any }) => {
        const fees = parseRegionFees(regionFees);
        const entries = Object.entries(fees);

        if (entries.length === 0) {
            return <span className="text-muted-foreground">-</span>;
        }

        if (entries.length === 1) {
            return (
                <span className="text-sm">
                    {entries[0][0]}: {Number(entries[0][1]).toLocaleString()} FCFA
                </span>
            );
        }

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto py-1 px-2 gap-1">
                        <IconMapPin className="w-3 h-3" />
                        {t('regionsCount', { count: entries.length })}
                        <IconChevronDown className="w-3 h-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground px-2 py-1">{t('regionFeesDropdown')}</p>
                        {entries.map(([region, fee]) => (
                            <div
                                key={region}
                                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted"
                            >
                                <span className="text-sm font-medium">{region}</span>
                                <span className="text-sm text-muted-foreground">
                                    {Number(fee).toLocaleString()} FCFA
                                </span>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    // Format package type
    const formatPackageType = (type: string): string => {
        const types: Record<string, string> = {
            'BOX': t('box'),
            'ENVELOPE': t('envelope'),
            'SOFT_PACKAGE': t('softPackage'),
        };
        return types[type] || type;
    };

    // Format size
    const formatSize = (size: string): string => {
        const sizes: Record<string, string> = {
            'SMALL': t('small'),
            'MEDIUM': t('medium'),
            'LARGE': t('large'),
        };
        return sizes[size] || size;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24 w-full max-w-[1200px] mx-auto" />
                <Skeleton className="h-96 w-full max-w-[1200px] mx-auto" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-[1200px] mx-auto px-6">
                <Alert variant="destructive">
                    <div className="font-semibold">{tGen('errorLoading')}</div>
                    <div className="text-sm">{error.message}</div>
                </Alert>
            </div>
        );
    }

    const packages = data?.packages?.edges?.map(edge => edge?.node).filter(Boolean) || [];
    const totalCount = data?.packages?.totalCount || 0;

    return (
        <div className="space-y-8 pb-10 max-w-[1000px] mx-auto min-w-0 px-4 md:px-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/workspace/${workspaceId}/store/settings`)}
                            className="-ml-2"
                        >
                            <IconArrowLeft className="h-5 w-5" />
                        </Button>
                        <IconPackage className="h-6 w-6 text-muted-foreground" />
                        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
                    </div>
                    <Button onClick={goToAddPage} className="gap-2 hidden sm:flex">
                        <IconPlus className="w-4 h-4" />
                        {t('addPackage')}
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    {t('packagesConfigured', { count: totalCount })}
                </p>
            </div>

            {/* Mobile Add Button */}
            <Button onClick={goToAddPage} className="gap-2 w-full sm:hidden">
                <IconPlus className="w-4 h-4" />
                {t('addPackage')}
            </Button>

            {/* Best Practice Hint */}
            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 p-4 rounded-md text-sm flex gap-3">
                    <IconPackage className="w-5 h-5 flex-none" />
                    <div>
                        <strong>{t('bestPracticeTitle')}:</strong> {t('bestPracticeDesc')}
                    </div>
                </div>
            </div>

            {/* Packages Table */}
            {packages.length === 0 ? (
                <div className="w-full max-w-[1200px] mx-auto px-6">
                    <Card className="p-8">
                        <div className="text-center">
                            <IconPackage className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">{t('noPackages')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('noPackagesDesc')}
                            </p>
                            <Button onClick={goToAddPage} className="gap-2">
                                <IconPlus className="w-4 h-4" />
                                {t('addPackage')}
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('name')}</TableHead>
                                        <TableHead>{t('type')}</TableHead>
                                        <TableHead>{t('size')}</TableHead>
                                        <TableHead>{t('method')}</TableHead>
                                        <TableHead>{t('regionFees')}</TableHead>
                                        <TableHead>{t('estDays')}</TableHead>
                                        <TableHead>{t('products')}</TableHead>
                                        <TableHead>{t('status')}</TableHead>
                                        <TableHead className="w-[100px]">{t('actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages.map((pkg) => {
                                        if (!pkg) return null;
                                        return (
                                            <TableRow key={pkg.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{pkg.name}</span>
                                                        {pkg.useAsDefault && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {t('default')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatPackageType(pkg.packageType)}</TableCell>
                                                <TableCell>{formatSize(pkg.size)}</TableCell>
                                                <TableCell>{pkg.method || '-'}</TableCell>
                                                <TableCell><RegionFeesCell regionFees={pkg.regionFees} /></TableCell>
                                                <TableCell>{pkg.estimatedDays}</TableCell>
                                                <TableCell>{pkg.productCount || 0}</TableCell>
                                                <TableCell>
                                                    {pkg.isActive ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            <IconCheck className="w-3 h-3 mr-1" />
                                                            {t('active')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">{t('inactive')}</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => goToEditPage(pkg.id)}
                                                        >
                                                            <IconPencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedPackage({ id: pkg.id, name: pkg.name });
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteConfirm', { name: selectedPackage?.name || '' })}
                            {t('deleteWarning')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            {tGen('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? (
                                <>
                                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('deleting')}
                                </>
                            ) : (
                                t('delete')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

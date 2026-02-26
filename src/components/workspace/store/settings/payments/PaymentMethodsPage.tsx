'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card } from '@/components/shadcn-ui/card';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Button } from '@/components/shadcn-ui/button';
import { Switch } from '@/components/shadcn-ui/switch';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { GetPaymentMethodsDocument } from '@/services/graphql/admin-store/queries/payments/__generated__/GetPaymentMethods.generated';
import { AddPaymentMethodDocument } from '@/services/graphql/admin-store/mutations/payments/__generated__/AddPaymentMethod.generated';
import { TogglePaymentMethodDocument } from '@/services/graphql/admin-store/mutations/payments/__generated__/TogglePaymentMethod.generated';
import { UpdatePaymentMethodDocument } from '@/services/graphql/admin-store/mutations/payments/__generated__/UpdatePaymentMethod.generated';
import { RemovePaymentMethodDocument } from '@/services/graphql/admin-store/mutations/payments/__generated__/RemovePaymentMethod.generated';
import {
    IconCreditCard,
    IconPlus,
    IconPencil,
    IconTrash,
    IconExternalLink,
    IconLoader2,
    IconInfoCircle,
    IconArrowLeft,
} from '@tabler/icons-react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';

export function PaymentMethodsPage() {
    const router = useRouter();
    const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
    const t = useTranslations('Payments');
    const tGen = useTranslations('General');
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<{
        id: string;
        providerName: string;
        checkoutUrl: string | null;
    } | null>(null);

    // Form state
    const [checkoutUrl, setCheckoutUrl] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('fapshi');

    // Query
    const { data, loading, error, refetch } = useQuery(GetPaymentMethodsDocument);

    // Mutations
    const [addMethod, { loading: adding }] = useMutation(AddPaymentMethodDocument);
    const [toggleMethod, { loading: toggling }] = useMutation(TogglePaymentMethodDocument);
    const [updateMethod, { loading: updating }] = useMutation(UpdatePaymentMethodDocument);
    const [removeMethod, { loading: removing }] = useMutation(RemovePaymentMethodDocument);

    // Validate Fapshi URL
    const validateFapshiUrl = (url: string): boolean => {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' && url.toLowerCase().includes('fapshi.com');
        } catch {
            return false;
        }
    };

    // Handle add payment method
    const handleAdd = async () => {
        if (!validateFapshiUrl(checkoutUrl)) {
            toast.error(t('invalidUrl'), {
                description: t('invalidUrlDesc'),
            });
            return;
        }

        try {
            const result = await addMethod({
                variables: {
                    input: {
                        providerName: selectedProvider,
                        checkoutUrl: checkoutUrl,
                    },
                },
            });

            if (result.data?.addPaymentMethod?.success) {
                toast.success(t('addSuccess'), {
                    description: t('addSuccessDesc', { provider: 'fapshi' }),
                });
                setShowAddModal(false);
                setCheckoutUrl('');
                refetch();
            } else {
                toast.error(t('error'), {
                    description: result.data?.addPaymentMethod?.error || tGen('failedToSave'),
                });
            }
        } catch (err) {
            console.error('Add payment method failed:', err);
            toast.error(t('error'), {
                description: tGen('failedToSave'),
            });
        }
    };

    // Handle toggle
    const handleToggle = async (methodId: string, enabled: boolean) => {
        try {
            const result = await toggleMethod({
                variables: {
                    methodId,
                    enabled,
                },
            });

            if (result.data?.togglePaymentMethod?.success) {
                toast.success(enabled ? t('enabledSuccess') : t('disabledSuccess'));
                refetch();
            } else {
                toast.error(t('error'), {
                    description: result.data?.togglePaymentMethod?.error || tGen('failedToSave'),
                });
            }
        } catch (err) {
            console.error('Toggle failed:', err);
            toast.error(t('error'), { description: tGen('failedToSave') });
        }
    };

    // Handle update
    const handleUpdate = async () => {
        if (!selectedMethod) return;

        if (!validateFapshiUrl(checkoutUrl)) {
            toast.error(t('invalidUrl'), {
                description: t('invalidUrlDesc'),
            });
            return;
        }

        try {
            const result = await updateMethod({
                variables: {
                    methodId: selectedMethod.id,
                    input: {
                        checkoutUrl: checkoutUrl,
                    },
                },
            });

            if (result.data?.updatePaymentMethod?.success) {
                toast.success(t('updateSuccess'));
                setShowEditModal(false);
                setSelectedMethod(null);
                setCheckoutUrl('');
                refetch();
            } else {
                toast.error(t('error'), {
                    description: result.data?.updatePaymentMethod?.error || tGen('failedToSave'),
                });
            }
        } catch (err) {
            console.error('Update failed:', err);
            toast.error(t('error'), { description: tGen('failedToSave') });
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!selectedMethod) return;

        try {
            const result = await removeMethod({
                variables: {
                    methodId: selectedMethod.id,
                },
            });

            if (result.data?.removePaymentMethod?.success) {
                toast.success(t('removeSuccess'));
                setShowDeleteModal(false);
                setSelectedMethod(null);
                refetch();
            } else {
                toast.error(t('error'), {
                    description: result.data?.removePaymentMethod?.error || tGen('failedToSave'),
                });
            }
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error(t('error'), { description: tGen('failedToSave') });
        }
    };

    // Open edit modal
    const openEditModal = (method: { id: string; providerName: string; checkoutUrl: string | null }) => {
        setSelectedMethod(method);
        setCheckoutUrl(method.checkoutUrl || '');
        setShowEditModal(true);
    };

    // Open delete modal
    const openDeleteModal = (method: { id: string; providerName: string; checkoutUrl: string | null }) => {
        setSelectedMethod(method);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-48 w-full max-w-[1000px] mx-auto" />
                <Skeleton className="h-64 w-full max-w-[1000px] mx-auto" />
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

    const methods = data?.paymentMethods?.filter(Boolean) || [];
    const availableProviders = data?.availableProviders?.filter(Boolean) || [];
    const canAddFapshi = availableProviders.some(p => p?.provider === 'fapshi' && !p?.alreadyAdded);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="w-full max-w-[1000px] mx-auto px-4 md:px-6">
                <Card className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push(`/workspace/${currentWorkspace?.id}/store/settings`)}
                                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
                            >
                                <IconArrowLeft className="w-5 h-5" />
                            </button>
                            <IconCreditCard className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                            <div>
                                <h2 className="text-base font-semibold">{t('title')}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {t('description')}
                                </p>
                            </div>
                        </div>
                        {canAddFapshi && (
                            <Button onClick={() => setShowAddModal(true)} className="gap-2 w-full sm:w-auto">
                                <IconPlus className="w-4 h-4" />
                                {t('addFapshi')}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>

            {/* Payment Methods List */}
            {methods.length === 0 ? (
                <div className="w-full max-w-[1000px] mx-auto px-6">
                    <Card className="p-8">
                        <div className="text-center">
                            <IconCreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">{t('noMethods')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('noMethodsFapshiDesc')}
                            </p>
                            {canAddFapshi && (
                                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                                    <IconPlus className="w-4 h-4" />
                                    {t('addFapshi')}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            ) : (
                methods.map((method) => {
                    if (!method) return null;
                    return (
                        <div key={method.id} className="w-full max-w-[1000px] mx-auto px-4 md:px-6">
                            <Card className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconCreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold">{method.displayName || method.providerName}</h3>
                                                {method.verified && (
                                                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
                                                        {t('verified')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {t('momoDesc')}
                                            </p>
                                            {method.checkoutUrl && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] sm:max-w-[300px] truncate block">
                                                        {method.checkoutUrl}
                                                    </code>
                                                    <a
                                                        href={method.checkoutUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                                                    >
                                                        <IconExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            )}
                                            {method.totalTransactions > 0 && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {t('transactions', { count: method.totalTransactions, rate: method.successRate?.toFixed(1) || '0' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <Switch
                                            checked={method.enabled}
                                            onCheckedChange={(checked) => handleToggle(method.id, checked)}
                                            disabled={toggling}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(method)}
                                        >
                                            <IconPencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDeleteModal(method)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    );
                })
            )}

            {/* Info Card */}
            <div className="w-full max-w-[1000px] mx-auto px-4 md:px-6">
                <Alert className="bg-blue-500/10 border-blue-500/20">
                    <IconInfoCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="ml-2 text-sm text-blue-900 dark:text-blue-300">
                        {t.rich('redirectFapshiInfo', {
                            a: (chunks) => (
                                <a
                                    href="https://dashboard.fapshi.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline font-medium"
                                >
                                    {chunks}
                                </a>
                            )
                        })}
                    </AlertDescription>
                </Alert>
            </div>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('addFapshiTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('addFapshiDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="checkoutUrl">{t('fapshiUrl')}</Label>
                            <Input
                                id="checkoutUrl"
                                value={checkoutUrl}
                                onChange={(e) => setCheckoutUrl(e.target.value)}
                                placeholder="https://checkout.fapshi.com/pay/..."
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('fapshiHint')}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleAdd} disabled={adding || !checkoutUrl}>
                            {adding ? (
                                <>
                                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('adding')}
                                </>
                            ) : (
                                t('addFapshi')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('edit')}</DialogTitle>
                        <DialogDescription>
                            {t('addFapshiDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editCheckoutUrl">{t('fapshiUrl')}</Label>
                            <Input
                                id="editCheckoutUrl"
                                value={checkoutUrl}
                                onChange={(e) => setCheckoutUrl(e.target.value)}
                                placeholder="https://checkout.fapshi.com/pay/..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleUpdate} disabled={updating || !checkoutUrl}>
                            {updating ? (
                                <>
                                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('saving')}
                                </>
                            ) : (
                                t('save')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteMethodTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteMethodDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={removing}>
                            {removing ? (
                                <>
                                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('removing')}
                                </>
                            ) : (
                                t('remove')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

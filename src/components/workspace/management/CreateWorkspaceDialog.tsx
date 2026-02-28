"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconBuildingStore } from '@tabler/icons-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Shadcn/UI Components
import { Button } from '@/components/shadcn-ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn-ui/dialog'
import { Input } from '@/components/shadcn-ui/input'
import { Textarea } from '@/components/shadcn-ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/shadcn-ui/select"

// Hooks
import { useWorkspaceManagement } from '@/hooks/workspace/core/useWorkspaceManagement'

// Types and Schemas
// Types and Schemas
const createWorkspaceSchema = z.object({
    name: z
        .string()
        .min(1, 'Workspace name is required')
        .max(50, 'Workspace name must be less than 50 characters'),
    type: z.literal('store'),
    description: z
        .string()
        .max(200, 'Description must be less than 200 characters')
        .optional()
})

type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceDialogProps {
    readonly isOpen: boolean
    readonly onOpenChange: (open: boolean) => void
    readonly onWorkspaceCreate?: (workspace: unknown) => void
}

export function CreateWorkspaceDialog({
    isOpen,
    onOpenChange,
    onWorkspaceCreate
}: CreateWorkspaceDialogProps) {
    const router = useRouter()
    const t = useTranslations('Workspaces')
    const { createWorkspace, isCreating } = useWorkspaceManagement()
    const [errorCode, setErrorCode] = useState<string | null>(null)

    const form = useForm<CreateWorkspaceFormValues>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: '',
            type: 'store', // Hardcoded to store
            description: ''
        },
        mode: 'onBlur'
    })

    // Reset form when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                name: '',
                type: 'store',
                description: ''
            })
            setErrorCode(null)
        }
    }, [isOpen, form])

    const onSubmit = async (data: CreateWorkspaceFormValues) => {
        setErrorCode(null)
        try {
            const response = await createWorkspace({
                name: data.name.trim(),
                type: 'store',
                description: data.description?.trim() || undefined
            })

            toast.success(t('createDialog.success'))
            onOpenChange(false)

            if (onWorkspaceCreate) {
                onWorkspaceCreate(response)
            } else {
                router.refresh()
            }
        } catch (err: any) {
            let errorMessage = t('createDialog.errors.default')

            if (err && typeof err === 'object') {
                if ('detail' in err && typeof err.detail === 'string') {
                    errorMessage = err.detail
                    if (errorMessage.startsWith("['") && errorMessage.endsWith("']")) {
                        errorMessage = errorMessage.slice(2, -2)
                    }
                } else if ('error' in err && typeof err.error === 'string') {
                    errorMessage = err.error
                } else if ('message' in err && typeof err.message === 'string') {
                    errorMessage = err.message
                }
            } else if (err instanceof Error) {
                errorMessage = err.message
            }

            if (err.error_code === 'CREATION_IN_PROGRESS' || errorMessage.includes('Creation in progress')) {
                setErrorCode('CREATION_IN_PROGRESS')
                toast.warning(t('createDialog.errors.formationPending'), {
                    description: t('createDialog.errors.pleaseWait')
                })
            } else {
                toast.error(errorMessage)
            }

            console.error('Failed to create workspace:', err)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <IconBuildingStore className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <DialogTitle>{t('createDialog.title')}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t('createDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('createDialog.storeName')}
                            </label>
                            <Input
                                id="name"
                                placeholder={t('createDialog.storeNamePlaceholder')}
                                {...form.register('name')}
                                disabled={isCreating}
                                autoFocus
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('createDialog.description2')}
                            </label>
                            <Textarea
                                id="description"
                                placeholder={t('createDialog.descriptionPlaceholder')}
                                {...form.register('description')}
                                disabled={isCreating}
                                rows={3}
                                className="resize-none"
                            />
                            {form.formState.errors.description && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isCreating}
                        >
                            {t('createDialog.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating || !form.formState.isValid}
                            className={errorCode === 'CREATION_IN_PROGRESS' ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('createDialog.creating')}
                                </>
                            ) : (
                                t('createDialog.create')
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconBuildingStore, IconPencil, IconBriefcase } from '@tabler/icons-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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

            // Success
            toast.success('Store workspace created successfully!')
            onOpenChange(false)

            if (onWorkspaceCreate) {
                onWorkspaceCreate(response)
            } else {
                // Fallback navigation if no callback provided
                router.refresh()
            }
        } catch (err: any) {
            // Error handling
            // Error handling
            let errorMessage = 'Failed to create workspace. Please try again.'

            if (err && typeof err === 'object') {
                // Check if it's our structured error
                if ('detail' in err && typeof err.detail === 'string') {
                    errorMessage = err.detail
                    // Clean up Django's list string representation if present e.g. "['...']"
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

            // Handle specific error codes
            if (err.error_code === 'CREATION_IN_PROGRESS' || errorMessage.includes('Creation in progress')) {
                setErrorCode('CREATION_IN_PROGRESS')
                toast.warning('Formation pending', {
                    description: 'Please wait a moment while we set up your store.'
                })
            } else {
                toast.error(errorMessage)
            }

            console.error('Failed to create workspace:', err)
        }
    }

    // getTypeIcon function removed as it is no longer needed

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <IconBuildingStore className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <DialogTitle>Create New Store</DialogTitle>
                    </div>
                    <DialogDescription>
                        Set up a new workspace for your online store. You can manage products, orders, and customers from here.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        {/* Workspace Name */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Store Name
                            </label>
                            <Input
                                id="name"
                                placeholder="e.g. My Awesome Store"
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

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Description (Optional)
                            </label>
                            <Textarea
                                id="description"
                                placeholder="Briefly describe your store..."
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating || !form.formState.isValid}
                            className={errorCode === 'CREATION_IN_PROGRESS' ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Workspace'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

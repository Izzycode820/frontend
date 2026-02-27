/**
 * User Profile Management Component
 * Built with Shadcn/UI + React Hook Form + Zod validation
 * Handles profile updates with proper error handling
 */

'use client'

import React from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, User, Mail, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Shadcn/UI Components
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Switch } from '@/components/shadcn-ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/shadcn-ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn-ui/card'
import { Separator } from '@/components/shadcn-ui/separator'

// Hooks
import { useAuth } from '@/hooks/authentication/useAuth'

// Types
import type { ProfileUpdateRequest, UserProfile } from '@/types/authentication/user'

type ProfileFormValues = {
  first_name: string
  last_name: string
  username: string
  bio?: string
  security_notifications: boolean
}

export interface UserProfileProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export function UserProfile({
  onSuccess,
  onError,
  className = ''
}: UserProfileProps) {
  const t = useTranslations('Authentication.profile')
  const v = useTranslations('Authentication.validation')

  const { user, isLoading: authLoading, updateUser } = useAuth()
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [updateError, setUpdateError] = React.useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = React.useState(false)

  // Validation Schema
  const profileSchema = React.useMemo(() => z.object({
    first_name: z
      .string()
      .min(1, v('firstNameRequired'))
      .min(2, v('firstNameMin'))
      .max(30, v('firstNameMax')),
    last_name: z
      .string()
      .min(1, v('lastNameRequired'))
      .min(2, v('lastNameMin'))
      .max(30, v('lastNameMax')),
    username: z
      .string()
      .min(3, v('usernameMin'))
      .max(20, v('usernameMax'))
      .regex(/^[a-zA-Z0-9_-]+$/, v('usernameInvalid')),
    bio: z
      .string()
      .max(500, v('bioMax'))
      .optional(),
    security_notifications: z.boolean()
  }) satisfies z.ZodType<Partial<ProfileFormValues>>, [v])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      bio: '',
      security_notifications: true
    }
  })

  // Update form when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        bio: user.bio || '',
        security_notifications: user.security_notifications ?? true
      })
    }
  }, [user, form])

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    if (!user) return

    try {
      setIsUpdating(true)
      setUpdateError(null)
      setUpdateSuccess(false)

      const updateRequest: ProfileUpdateRequest = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        username: values.username.trim(),
        bio: values.bio?.trim() || '',
        security_notifications: values.security_notifications
      }

      // Use the existing updateUser method from useAuth hook
      await updateUser(updateRequest)

      setUpdateSuccess(true)
      onSuccess?.()

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('failed')
      setUpdateError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">{t('loading')}</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{t('notFound')}</p>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{t('title')}</span>
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Success Message */}
              {updateSuccess && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('success')}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {updateError && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {updateError}
                  </p>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('basicInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('firstName')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isUpdating}
                            placeholder={t('firstNamePlaceholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('lastName')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isUpdating}
                            placeholder={t('lastNamePlaceholder')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('username')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isUpdating}
                          placeholder={t('usernamePlaceholder')}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('usernameDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bio')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={isUpdating}
                          placeholder={t('bioPlaceholder')}
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription>
                        {t('bioDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Account Information (Read-only) */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">{t('accountInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('email')}</Label>
                    <Input
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('emailDesc')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('memberSince')}</Label>
                    <Input
                      value={new Date(user.created_at).toLocaleDateString()}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.email_verified ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      {user.email_verified ? t('emailVerified') : t('emailNotVerified')}
                    </span>
                  </div>

                  {user.two_factor_enabled && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm">{t('twoFactorEnabled')}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Security Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">{t('securityPrefs')}</h3>

                <FormField
                  control={form.control}
                  name="security_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t('securityNotifications')}
                        </FormLabel>
                        <FormDescription>
                          {t('securityNotificationsDesc')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isUpdating}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('submit')}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
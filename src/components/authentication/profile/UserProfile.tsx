'use client'

import React from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, User, Mail, Shield, UserCircle, Key, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Link from 'next/link'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'

// Hooks
import { useAuth } from '@/hooks/authentication/useAuth'

// Types
import type { ProfileUpdateRequest } from '@/types/authentication/user'

type ProfileFormValues = {
  first_name: string
  last_name: string
  username: string
  bio?: string
  security_notifications: boolean
}

export interface UserProfileProps {
  className?: string
}

export function UserProfile({
  className = ''
}: UserProfileProps) {
  const t = useTranslations('Authentication.profile')
  const v = useTranslations('Authentication.validation')
  const ft = useTranslations('Authentication.forgotPassword')

  const { user, isLoading: authLoading, updateUser } = useAuth()
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('profile')

  // Validation Schema
  const profileSchema = React.useMemo(() => z.object({
    first_name: z
      .string()
      .min(1, v('emailRequired')) // fallback if names not in v
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
      const updateRequest: ProfileUpdateRequest = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        username: values.username.trim(),
        bio: values.bio?.trim() || '',
        security_notifications: values.security_notifications
      }

      await updateUser(updateRequest)
      toast.success(t('success'))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('failed')
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className={`max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-zinc-100 dark:bg-zinc-800/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm transition-all duration-200">
            <UserCircle className="h-4 w-4 mr-2" />
            {t('tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm transition-all duration-200">
            <Shield className="h-4 w-4 mr-2" />
            {t('tabs.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-500" />
                {t('basicInfo')}
              </CardTitle>
              <CardDescription>
                {t('sections.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('firstName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('firstNamePlaceholder')} {...field} disabled={isUpdating} className="bg-white/50 dark:bg-zinc-900/50" />
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
                            <Input placeholder={t('lastNamePlaceholder')} {...field} disabled={isUpdating} className="bg-white/50 dark:bg-zinc-900/50" />
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
                          <Input placeholder={t('usernamePlaceholder')} {...field} disabled={isUpdating} className="bg-white/50 dark:bg-zinc-900/50" />
                        </FormControl>
                        <FormDescription>{t('usernameDesc')}</FormDescription>
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
                            placeholder={t('bioPlaceholder')} 
                            className="min-h-[100px] bg-white/50 dark:bg-zinc-900/50"
                            {...field} 
                            disabled={isUpdating}
                          />
                        </FormControl>
                        <FormDescription>{t('bioDesc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">{t('securityPrefs')}</h3>
                    <FormField
                      control={form.control}
                      name="security_notifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white/30 dark:bg-zinc-900/30">
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

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8 transition-all duration-200">
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
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                {t('accountInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('email')}</p>
                  <p className="text-sm font-semibold">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{t('emailDesc')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('memberSince')}</p>
                  <p className="text-sm font-semibold">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <Card className="border-none bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-500" />
                {t('sections.security.title')}
              </CardTitle>
              <CardDescription>
                {t('sections.security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{ft('title')}</h3>
                  <p className="text-sm text-muted-foreground max-w-md">{ft('description')}</p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-lg shadow-indigo-500/20">
                  <Link href="/auth/forgot-password">
                    {ft('sendLink')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4 text-indigo-500" />
                    {t('sections.security.status')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{t('emailVerified')}</span>
                    </div>
                    {user.two_factor_enabled && (
                        <div className="flex items-center gap-3 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10">
                            <Shield className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">{t('twoFactorEnabled')}</span>
                        </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

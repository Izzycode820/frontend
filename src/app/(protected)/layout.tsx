/**
 * Protected Routes Layout - Clean Implementation
 * Server-side auth verification with Zustand stores
 * Removed Context Providers - using hooks pattern like auth layout
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: {
    template: '%s | HUZILERZ',
    default: 'HUZILERZ',
  },
  description: 'Manage your workspaces, subscriptions, and AI-powered tools',
}

async function verifyAuth() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')

  if (!refreshToken) {
    redirect('/auth/login')
  }

  return true
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifyAuth()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {children}
    </div>
  )
}

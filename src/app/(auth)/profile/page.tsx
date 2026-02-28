'use client'

/**
 * Platform-level User Profile Page
 * Accessible at huzilerz.com/profile
 * Extremely lightweight - delegates to UserProfile component
 */

import React from 'react'
import { UserProfile } from '@/components/authentication/profile/UserProfile'

export default function ProfilePage() {
  return (
    <main className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <UserProfile />
    </main>
  )
}

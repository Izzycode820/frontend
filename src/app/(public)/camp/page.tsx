/**
 * Landing Page - Clean Implementation
 * Modern coming soon page with proper shadcn/ui integration
 * Organized component structure
 */

import React from 'react'
import { Layout, ComingSoon } from '@/components/landing'

export default function LandingPage() {
  return (
    <Layout>
      <ComingSoon />
    </Layout>
  )
}
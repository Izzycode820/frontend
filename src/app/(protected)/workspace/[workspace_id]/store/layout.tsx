"use client"

import { ThemeWrapper } from "@/components/workspace/store/config/theme-wrapper"
import { StoreLayoutClient } from "@/components/workspace/store/config/store-layout-client"
import { ApolloProvider } from "@apollo/client/react"
import { adminStoreClient } from "@/services/graphql/clients"
import { MerchantChatProvider } from "@/components/workspace/store/dashboard/chat/MerchantChatContext"



import "@/app/(protected)/workspace/[workspace_id]/store/theme.css"

/**
 * Store Workspace Layout
 *
 * Industry Standard Pattern:
 * - ApolloProvider for GraphQL context
 * - ThemeWrapper for workspace theming
 * - StoreLayoutClient for universal layout
 * - All data from Zustand stores (auth + workspace context)
 */

import { SubscriptionLockoutModal } from "@/components/workspace/restricted/SubscriptionLockoutModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <ThemeWrapper>
        <SubscriptionLockoutModal />
        <StoreLayoutClient>
          {children}
        </StoreLayoutClient>
      </ThemeWrapper>


    </ApolloProvider>
  )
}

/**
 * Store Workspace Navigation Configuration
 * Store-specific navigation items for sidebar
 */

import {
  IconBuildingStore,
  IconChartBar,
  IconDashboard,
  IconPackage,
  IconShoppingCart,
  IconSettings,
  IconHelp,
  IconSearch,
  IconUsers,
  IconCreditCard,
  IconUpload,
  IconInfoCircle,
} from "@tabler/icons-react"

// Store navigation items
export const storeNavMain = [
  {
    title: "dashboard",
    url: "#",
    icon: IconDashboard,
  },
  {
    title: "products",
    url: "#",
    icon: IconPackage,
  },
  {
    title: "orders",
    url: "#",
    icon: IconShoppingCart,
  },
  {
    title: "analytics",
    url: "#",
    icon: IconChartBar,
  },
  {
    title: "customers",
    url: "#",
    icon: IconUsers,
  },
]

// Store document shortcuts
export const storeDocuments = [
  {
    name: "inventory",
    url: "#",
    icon: IconPackage,
  },
  {
    name: "transactions",
    url: "#",
    icon: IconCreditCard,
  },
  {
    name: "bulkUpload",
    url: "#",
    icon: IconUpload,
  },
]

// Store secondary navigation
export const storeNavSecondary = [
  {
    title: "settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "getHelp",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "themes",
    url: "#",
    icon: IconSettings,
  },
]

// Store workspace metadata
export const storeWorkspaceConfig = {
  name: "storeWorkspace",
  icon: IconBuildingStore,
  type: "store" as const,
}

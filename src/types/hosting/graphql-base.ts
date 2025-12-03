export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  DateTime: { input: string; output: string; }
  Decimal: { input: string; output: string; }
  JSONString: { input: any; output: any; }
}

/** Bandwidth usage details */
export interface BandwidthUsageType {
  __typename?: 'BandwidthUsageType';
  limitGb: Scalars['Float']['output'];
  percentage: Scalars['Float']['output'];
  remainingGb: Scalars['Float']['output'];
  usedGb: Scalars['Float']['output'];
}

/**
 * Change workspace subdomain (e.g., mystore.huzilerz.com)
 *
 * Free for all tiers - uses SubdomainService
 * Atomic update across WorkspaceInfrastructure and DeployedSite
 * Tracks subdomain history and enforces change limits (2 changes max)
 */
export interface ChangeSubdomain {
  __typename?: 'ChangeSubdomain';
  changesRemaining?: Maybe<Scalars['Int']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  liveUrl?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  newSubdomain?: Maybe<Scalars['String']['output']>;
  previewUrl?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
}

/**
 * Input for changing workspace subdomain
 *
 * Used by changeSubdomain mutation
 */
export interface ChangeSubdomainInput {
  /** New subdomain (e.g., 'mystore' for mystore.huzilerz.com) */
  subdomain: Scalars['String']['input'];
  /** Workspace to update */
  workspaceId: Scalars['ID']['input'];
}

/**
 * Connect externally-owned custom domain
 *
 * User must configure DNS records externally
 * System verifies DNS and provisions SSL (Shopify 2-step flow)
 */
export interface ConnectCustomDomain {
  __typename?: 'ConnectCustomDomain';
  dnsRecords?: Maybe<Scalars['JSONString']['output']>;
  domain?: Maybe<CustomDomainType>;
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  verificationInstructions?: Maybe<Scalars['String']['output']>;
}

/**
 * Input for connecting an externally-owned custom domain
 *
 * Used by connectCustomDomain mutation
 */
export interface ConnectCustomDomainInput {
  /** Domain to connect (must be owned externally) */
  domain: Scalars['String']['input'];
  /** Workspace to connect domain to */
  workspaceId: Scalars['ID']['input'];
}

/**
 * Custom domain detail view
 * Used for verification polling and DNS configuration display
 */
export interface CustomDomainDetailType extends Node {
  __typename?: 'CustomDomainDetailType';
  createdAt: Scalars['DateTime']['output'];
  dnsRecordsToAdd?: Maybe<Array<Maybe<DnsRecordType>>>;
  dnsRecordsToRemove?: Maybe<Array<Maybe<DnsRecordType>>>;
  dnsRecordsToUpdate?: Maybe<Array<Maybe<DnsRecordType>>>;
  dnsStatus: Scalars['String']['output'];
  /** Custom domain (e.g., shoppings.com or www.shoppings.com) */
  domain: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Domain registrar if purchased via platform */
  registrarName?: Maybe<WorkspaceHostingCustomDomainRegistrarNameChoices>;
  /** Whether SSL/TLS is enabled for this domain */
  sslEnabled: Scalars['Boolean']['output'];
  /** When SSL certificate was provisioned */
  sslProvisionedAt?: Maybe<Scalars['DateTime']['output']>;
  status: WorkspaceHostingCustomDomainStatusChoices;
  tlsStatus: Scalars['String']['output'];
  /** When domain ownership was verified */
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
}

/**
 * Base custom domain type
 * Used for mutation returns - simple fields only
 */
export interface CustomDomainType extends Node {
  __typename?: 'CustomDomainType';
  createdAt: Scalars['DateTime']['output'];
  /** Custom domain (e.g., shoppings.com or www.shoppings.com) */
  domain: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Whether SSL/TLS is enabled for this domain */
  sslEnabled: Scalars['Boolean']['output'];
  /** When SSL certificate was provisioned */
  sslProvisionedAt?: Maybe<Scalars['DateTime']['output']>;
  status: WorkspaceHostingCustomDomainStatusChoices;
  /** When domain ownership was verified */
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
}

/** Custom domains usage details */
export interface CustomDomainsUsageType {
  __typename?: 'CustomDomainsUsageType';
  count: Scalars['Int']['output'];
  limit: Scalars['Int']['output'];
}

/** DNS record for domain configuration */
export interface DnsRecordType {
  __typename?: 'DNSRecordType';
  action: Scalars['String']['output'];
  currentValue?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updateTo?: Maybe<Scalars['String']['output']>;
}

/**
 * Domain purchase status type for queries
 * Extended type with all tracking fields
 */
export interface DomainPurchaseStatusType extends Node {
  __typename?: 'DomainPurchaseStatusType';
  createdAt: Scalars['DateTime']['output'];
  /** Domain purchased (e.g., mystore.com) */
  domainName: Scalars['String']['output'];
  /** Error message if purchase failed */
  errorMessage: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  paymentStatus: WorkspaceHostingDomainPurchasePaymentStatusChoices;
  /** Price charged to customer in FCFA */
  priceFcfa: Scalars['Decimal']['output'];
  status: Scalars['String']['output'];
}

/**
 * Domain purchase type for mutations
 * Simple return type with essential fields
 */
export interface DomainPurchaseType extends Node {
  __typename?: 'DomainPurchaseType';
  createdAt: Scalars['DateTime']['output'];
  /** Domain purchased (e.g., mystore.com) */
  domainName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  paymentStatus: WorkspaceHostingDomainPurchasePaymentStatusChoices;
  /** Price charged to customer in FCFA */
  priceFcfa: Scalars['Decimal']['output'];
}

/**
 * Domain renewal status type for queries
 * Extended type with all tracking fields
 */
export interface DomainRenewalStatusType extends Node {
  __typename?: 'DomainRenewalStatusType';
  createdAt: Scalars['DateTime']['output'];
  domainName: Scalars['String']['output'];
  errorMessage: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** New expiry date after renewal */
  newExpiryDate?: Maybe<Scalars['DateTime']['output']>;
  paymentStatus?: Maybe<Scalars['String']['output']>;
  /** Domain expiry date before renewal */
  previousExpiryDate: Scalars['DateTime']['output'];
  /** Renewal price in FCFA (charged to customer) */
  renewalPriceFcfa: Scalars['Decimal']['output'];
  renewalStatus: WorkspaceHostingDomainRenewalRenewalStatusChoices;
  renewedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
}

/**
 * Domain renewal type for mutations
 * Simple return type with essential fields
 */
export interface DomainRenewalType extends Node {
  __typename?: 'DomainRenewalType';
  createdAt: Scalars['DateTime']['output'];
  domainName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCompleted?: Maybe<Scalars['Boolean']['output']>;
  isFailed?: Maybe<Scalars['Boolean']['output']>;
  isPendingPayment?: Maybe<Scalars['Boolean']['output']>;
  /** Renewal price in FCFA (charged to customer) */
  renewalPriceFcfa: Scalars['Decimal']['output'];
  renewalStatus: WorkspaceHostingDomainRenewalRenewalStatusChoices;
}

/** Complete domain search response with pagination */
export interface DomainSearchResponseType {
  __typename?: 'DomainSearchResponseType';
  available: Scalars['Boolean']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  query: Scalars['String']['output'];
  suggestions: Array<Maybe<DomainSearchResultType>>;
  total: Scalars['Int']['output'];
}

/** Domain search result item for buy domain flow */
export interface DomainSearchResultType {
  __typename?: 'DomainSearchResultType';
  available: Scalars['Boolean']['output'];
  category: Scalars['String']['output'];
  domain: Scalars['String']['output'];
  pricePerYear: Scalars['String']['output'];
  priceUsd: Scalars['Float']['output'];
}

/**
 * Unified domain type for main domains list
 * Represents both default subdomain and custom domains
 */
export interface DomainType {
  __typename?: 'DomainType';
  addedAt?: Maybe<Scalars['DateTime']['output']>;
  domain: Scalars['String']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  isPrimary: Scalars['Boolean']['output'];
  managedBy?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  subdomainChangesLimit?: Maybe<Scalars['Int']['output']>;
  subdomainChangesRemaining?: Maybe<Scalars['Int']['output']>;
  type: Scalars['String']['output'];
}

/**
 * Hosting environment resource quota tracker
 *
 * Workspace-scoped - only accessible to user who owns the hosting environment
 * Tracks resource limits and current usage per subscription tier
 */
export interface HostingEnvironmentType extends Node {
  __typename?: 'HostingEnvironmentType';
  activeSitesCount: Scalars['Int']['output'];
  bandwidthLimitGb: Scalars['Decimal']['output'];
  bandwidthUsagePercentage?: Maybe<Scalars['Float']['output']>;
  bandwidthUsedGb: Scalars['Decimal']['output'];
  canDeployNewSite?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customDomainsLimit: Scalars['Int']['output'];
  gracePeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isDeploymentAllowed?: Maybe<Scalars['Boolean']['output']>;
  lastUsageSync?: Maybe<Scalars['DateTime']['output']>;
  overageCost?: Maybe<OverageCostType>;
  sitesLimit: Scalars['Int']['output'];
  status: WorkspaceHostingHostingEnvironmentStatusChoices;
  storageLimitGb: Scalars['Decimal']['output'];
  storageUsagePercentage?: Maybe<Scalars['Float']['output']>;
  storageUsedGb: Scalars['Decimal']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usageHistory?: Maybe<UsageHistoryType>;
  usageSummary?: Maybe<UsageSummaryType>;
}


/**
 * Hosting environment resource quota tracker
 *
 * Workspace-scoped - only accessible to user who owns the hosting environment
 * Tracks resource limits and current usage per subscription tier
 */
export interface HostingEnvironmentTypeUsageHistoryArgs {
  days?: InputMaybe<Scalars['Int']['input']>;
}

/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain
 * - verifyCustomDomain: Manually trigger domain verification
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 */
export interface Mutation {
  __typename?: 'Mutation';
  /**
   * Change workspace subdomain (e.g., mystore.huzilerz.com)
   *
   * Free for all tiers - uses SubdomainService
   * Atomic update across WorkspaceInfrastructure and DeployedSite
   * Tracks subdomain history and enforces change limits (2 changes max)
   */
  changeSubdomain?: Maybe<ChangeSubdomain>;
  /**
   * Connect externally-owned custom domain
   *
   * User must configure DNS records externally
   * System verifies DNS and provisions SSL (Shopify 2-step flow)
   */
  connectCustomDomain?: Maybe<ConnectCustomDomain>;
  /**
   * Initiate domain purchase (Cameroon mobile money flow)
   *
   * Creates DomainPurchase record → User pays via MTN/Orange → Webhook completes purchase
   * Uses DomainPurchaseService.initiate_purchase()
   */
  purchaseDomain?: Maybe<PurchaseDomain>;
  /**
   * Initiate domain renewal (Cameroon mobile money flow)
   *
   * Creates DomainRenewal record → User pays via MTN/Orange → Webhook completes renewal
   * Uses DomainRenewalService.initiate_renewal()
   */
  renewDomain?: Maybe<RenewDomain>;
  /**
   * Manually trigger domain verification
   *
   * Use case: User configured DNS and wants immediate verification
   * (instead of waiting for 15-min auto-verification Celery task)
   */
  verifyCustomDomain?: Maybe<VerifyCustomDomain>;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain
 * - verifyCustomDomain: Manually trigger domain verification
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 */
export interface MutationChangeSubdomainArgs {
  input: ChangeSubdomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain
 * - verifyCustomDomain: Manually trigger domain verification
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 */
export interface MutationConnectCustomDomainArgs {
  input: ConnectCustomDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain
 * - verifyCustomDomain: Manually trigger domain verification
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 */
export interface MutationPurchaseDomainArgs {
  input: PurchaseDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain
 * - verifyCustomDomain: Manually trigger domain verification
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 */
export interface MutationRenewDomainArgs {
  input: RenewDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain
 * - verifyCustomDomain: Manually trigger domain verification
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 */
export interface MutationVerifyCustomDomainArgs {
  domainId: Scalars['ID']['input'];
}

/** An object with an ID */
export interface Node {
  /** The ID of the object */
  id: Scalars['ID']['output'];
}

/** Overage cost calculation for billing */
export interface OverageCostType {
  __typename?: 'OverageCostType';
  bandwidthOverageGb: Scalars['Float']['output'];
  storageOverageGb: Scalars['Float']['output'];
  totalOverageUsd: Scalars['Float']['output'];
}

/**
 * Initiate domain purchase (Cameroon mobile money flow)
 *
 * Creates DomainPurchase record → User pays via MTN/Orange → Webhook completes purchase
 * Uses DomainPurchaseService.initiate_purchase()
 */
export interface PurchaseDomain {
  __typename?: 'PurchaseDomain';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  paymentInstructions?: Maybe<Scalars['String']['output']>;
  purchase?: Maybe<DomainPurchaseType>;
  success?: Maybe<Scalars['Boolean']['output']>;
}

/**
 * Input for purchasing a domain
 *
 * Used by purchaseDomain mutation
 * Requires contact info for WHOIS registration (ICANN requirement)
 */
export interface PurchaseDomainInput {
  /** Street address */
  address: Scalars['String']['input'];
  /** City */
  city: Scalars['String']['input'];
  /** Country code (ISO 2-letter, default: CM for Cameroon) */
  country?: InputMaybe<Scalars['String']['input']>;
  /** Domain to purchase */
  domain: Scalars['String']['input'];
  /** Phone number (e.g., '+237670000000') */
  phone: Scalars['String']['input'];
  /** Postal/ZIP code */
  postalCode: Scalars['String']['input'];
  /** Registration period (1-10 years) */
  registrationPeriodYears?: InputMaybe<Scalars['Int']['input']>;
  /** State/Region */
  state: Scalars['String']['input'];
  /** Workspace to associate domain with */
  workspaceId: Scalars['ID']['input'];
}

/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface Query {
  __typename?: 'Query';
  /** Check if user can deploy new site based on limits */
  checkDeploymentEligibility?: Maybe<Scalars['JSONString']['output']>;
  /** Check if user can upload file based on storage limits */
  checkUploadEligibility?: Maybe<Scalars['JSONString']['output']>;
  /** Get custom domain with DNS/TLS status (for polling) */
  customDomain?: Maybe<CustomDomainDetailType>;
  /** Get all domains (default subdomain + custom domains) */
  domains?: Maybe<Array<Maybe<DomainType>>>;
  /** Get current user's hosting environment and resource quotas */
  myHostingEnvironment?: Maybe<HostingEnvironmentType>;
  /** Calculate current overage costs for billing */
  myOverageCost?: Maybe<OverageCostType>;
  /** Get usage history for analytics charts (default 30 days) */
  myUsageHistory?: Maybe<UsageHistoryType>;
  /** Get detailed usage logs (for debugging/support) */
  myUsageLogs?: Maybe<Array<Maybe<ResourceUsageLogType>>>;
  /** Get current usage summary with percentages (for dashboard) */
  myUsageSummary?: Maybe<UsageSummaryType>;
  /** Track domain purchase progress */
  purchaseStatus?: Maybe<DomainPurchaseStatusType>;
  /** Track domain renewal progress */
  renewalStatus?: Maybe<DomainRenewalStatusType>;
  /** Search domains with pagination */
  searchDomains?: Maybe<DomainSearchResponseType>;
  /** Check if subdomain is available */
  validateSubdomain?: Maybe<SubdomainValidationType>;
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryCheckUploadEligibilityArgs {
  fileSizeBytes: Scalars['Int']['input'];
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryCustomDomainArgs {
  domainId: Scalars['ID']['input'];
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryDomainsArgs {
  workspaceId: Scalars['ID']['input'];
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryMyUsageHistoryArgs {
  days?: InputMaybe<Scalars['Int']['input']>;
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryMyUsageLogsArgs {
  days?: InputMaybe<Scalars['Int']['input']>;
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryPurchaseStatusArgs {
  purchaseId: Scalars['ID']['input'];
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryRenewalStatusArgs {
  renewalId: Scalars['ID']['input'];
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QuerySearchDomainsArgs {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
}


/**
 * Hosting management queries (all require authentication)
 *
 * Domain Management (Clean - matches UI flows):
 * - domains: Get all domains for workspace (default + custom)
 * - validateSubdomain: Check subdomain availability (for change modal)
 * - customDomain: Get domain detail with DNS/TLS status (for polling)
 * - searchDomains: Search domains with pagination (for buy flow)
 * - purchaseStatus: Track purchase progress
 * - renewalStatus: Track renewal progress
 *
 * Resource Usage:
 * - myHostingEnvironment: Get resource quotas and limits
 * - myUsageSummary: Get current usage with percentages
 * - myUsageHistory: Get usage history for charts (30 days)
 * - myOverageCost: Calculate overage costs for billing
 * - myUsageLogs: Get detailed usage logs
 * - checkUploadEligibility: Pre-flight check for file uploads
 * - checkDeploymentEligibility: Pre-flight check for deployments
 */
export interface QueryValidateSubdomainArgs {
  subdomain: Scalars['String']['input'];
}

/**
 * Initiate domain renewal (Cameroon mobile money flow)
 *
 * Creates DomainRenewal record → User pays via MTN/Orange → Webhook completes renewal
 * Uses DomainRenewalService.initiate_renewal()
 */
export interface RenewDomain {
  __typename?: 'RenewDomain';
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  paymentInstructions?: Maybe<Scalars['String']['output']>;
  renewal?: Maybe<DomainRenewalType>;
  success?: Maybe<Scalars['Boolean']['output']>;
}

/**
 * Input for renewing a domain
 *
 * Used by renewDomain mutation
 */
export interface RenewDomainInput {
  /** CustomDomain ID to renew */
  domainId: Scalars['ID']['input'];
  /** Renewal period (1-10 years) */
  renewalPeriodYears?: InputMaybe<Scalars['Int']['input']>;
}

/**
 * Resource usage log entry
 *
 * Historical usage data for analytics and billing
 */
export interface ResourceUsageLogType extends Node {
  __typename?: 'ResourceUsageLogType';
  avgResponseTimeMs: Scalars['Int']['output'];
  bandwidthUsedGb: Scalars['Decimal']['output'];
  errorRatePercentage: Scalars['Decimal']['output'];
  estimatedCostUsd: Scalars['Decimal']['output'];
  hostingEnvironment: HostingEnvironmentType;
  id: Scalars['ID']['output'];
  recordedAt: Scalars['DateTime']['output'];
  requestsCount: Scalars['BigInt']['output'];
  storageUsedGb: Scalars['Decimal']['output'];
}

/** Sites usage details */
export interface SitesUsageType {
  __typename?: 'SitesUsageType';
  activeCount: Scalars['Int']['output'];
  limit: Scalars['Int']['output'];
  percentage: Scalars['Float']['output'];
  remaining: Scalars['Int']['output'];
}

/** Storage usage details */
export interface StorageUsageType {
  __typename?: 'StorageUsageType';
  limitGb: Scalars['Float']['output'];
  percentage: Scalars['Float']['output'];
  remainingGb: Scalars['Float']['output'];
  usedGb: Scalars['Float']['output'];
}

/** Subdomain availability validation result */
export interface SubdomainValidationType {
  __typename?: 'SubdomainValidationType';
  available: Scalars['Boolean']['output'];
  errors?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  fullDomain?: Maybe<Scalars['String']['output']>;
  subdomain?: Maybe<Scalars['String']['output']>;
}

/** Single data point in usage history */
export interface UsageDataPointType {
  __typename?: 'UsageDataPointType';
  avgResponseTimeMs?: Maybe<Scalars['Int']['output']>;
  bandwidthUsedGb: Scalars['Float']['output'];
  recordedAt: Scalars['DateTime']['output'];
  requestsCount?: Maybe<Scalars['Int']['output']>;
  storageUsedGb: Scalars['Float']['output'];
}

/** Usage history with time series data */
export interface UsageHistoryType {
  __typename?: 'UsageHistoryType';
  currentUsage: UsageSummaryType;
  dataPoints: Array<Maybe<UsageDataPointType>>;
  periodDays: Scalars['Int']['output'];
}

/** Complete usage summary with all resources */
export interface UsageSummaryType {
  __typename?: 'UsageSummaryType';
  bandwidth: BandwidthUsageType;
  customDomains: CustomDomainsUsageType;
  deploymentAllowed: Scalars['Boolean']['output'];
  sites: SitesUsageType;
  status: Scalars['String']['output'];
  storage: StorageUsageType;
}

/**
 * Manually trigger domain verification
 *
 * Use case: User configured DNS and wants immediate verification
 * (instead of waiting for 15-min auto-verification Celery task)
 */
export interface VerifyCustomDomain {
  __typename?: 'VerifyCustomDomain';
  domain?: Maybe<CustomDomainType>;
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  verified?: Maybe<Scalars['Boolean']['output']>;
}

/** An enumeration. */
export enum WorkspaceHostingCustomDomainRegistrarNameChoices {
  /** GoDaddy */
  Godaddy = 'GODADDY',
  /** Namecheap */
  Namecheap = 'NAMECHEAP'
}

/** An enumeration. */
export enum WorkspaceHostingCustomDomainStatusChoices {
  /** Active */
  Active = 'ACTIVE',
  /** Verification Failed */
  Failed = 'FAILED',
  /** Pending Verification */
  Pending = 'PENDING',
  /** Suspended */
  Suspended = 'SUSPENDED',
  /** Verified */
  Verified = 'VERIFIED'
}

/** An enumeration. */
export enum WorkspaceHostingDomainPurchasePaymentStatusChoices {
  /** Completed */
  Completed = 'COMPLETED',
  /** Failed */
  Failed = 'FAILED',
  /** Pending Payment */
  Pending = 'PENDING',
  /** Processing */
  Processing = 'PROCESSING',
  /** Refunded */
  Refunded = 'REFUNDED'
}

/** An enumeration. */
export enum WorkspaceHostingDomainRenewalRenewalStatusChoices {
  /** Completed */
  Completed = 'COMPLETED',
  /** Expired - Not Renewed */
  Expired = 'EXPIRED',
  /** Failed */
  Failed = 'FAILED',
  /** Payment Received */
  PaymentReceived = 'PAYMENT_RECEIVED',
  /** Pending Payment */
  PendingPayment = 'PENDING_PAYMENT',
  /** Processing Renewal */
  Processing = 'PROCESSING'
}

/** An enumeration. */
export enum WorkspaceHostingHostingEnvironmentStatusChoices {
  /** Active */
  Active = 'ACTIVE',
  /** Error */
  Error = 'ERROR',
  /** Grace Period */
  GracePeriod = 'GRACE_PERIOD',
  /** Initializing */
  Initializing = 'INITIALIZING',
  /** Suspended */
  Suspended = 'SUSPENDED'
}

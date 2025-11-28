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
  DateTime: { input: string; output: string; }
  Decimal: { input: string; output: string; }
  JSONString: { input: any; output: any; }
}

/**
 * Change workspace subdomain (e.g., mystore.huzilerz.com)
 *
 * Free for all tiers - uses SubdomainService
 * Atomic update across WorkspaceInfrastructure and DeployedSite
 */
export interface ChangeSubdomain {
  __typename?: 'ChangeSubdomain';
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
 * Custom domain connected to workspace
 *
 * Represents both purchased domains (via platform) and externally-owned domains
 * Workspace-scoped - only accessible to workspace owner
 */
export interface CustomDomainType extends Node {
  __typename?: 'CustomDomainType';
  /** Auto-renewal not supported for mobile money payments (Cameroon market) */
  autoRenewEnabled: Scalars['Boolean']['output'];
  canRenew?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTime']['output'];
  daysUntilExpiry?: Maybe<Scalars['Int']['output']>;
  /** Required DNS records for proper configuration */
  dnsRecords: Scalars['JSONString']['output'];
  /** Custom domain (e.g., shoppings.com or www.shoppings.com) */
  domain: Scalars['String']['output'];
  /** Domain expiration date */
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isExpiringSoon?: Maybe<Scalars['Boolean']['output']>;
  isPurchasedDomain?: Maybe<Scalars['Boolean']['output']>;
  nextRenewalDate?: Maybe<Scalars['DateTime']['output']>;
  /** Domain purchase price in FCFA (charged to customer) */
  purchasePriceFcfa?: Maybe<Scalars['Decimal']['output']>;
  /** Whether domain was purchased through Huzilerz */
  purchasedViaPlatform: Scalars['Boolean']['output'];
  /** Domain registrar if purchased via platform */
  registrarName?: Maybe<WorkspaceHostingCustomDomainRegistrarNameChoices>;
  /** Annual renewal price in FCFA (charged to customer) */
  renewalPriceFcfa?: Maybe<Scalars['Decimal']['output']>;
  renewalPriceFcfaComputed?: Maybe<Scalars['Int']['output']>;
  /** Whether renewal reminder has been sent for current period */
  renewalReminderSent: Scalars['Boolean']['output'];
  /** Number of renewal warnings sent (reset after successful renewal) */
  renewalWarningCount: Scalars['Int']['output'];
  /** Whether SSL/TLS is enabled for this domain */
  sslEnabled: Scalars['Boolean']['output'];
  /** When SSL certificate was provisioned */
  sslProvisionedAt?: Maybe<Scalars['DateTime']['output']>;
  status: WorkspaceHostingCustomDomainStatusChoices;
  /** DNS TXT record token for domain ownership verification (_huzilerz-verify) */
  verificationToken: Scalars['String']['output'];
  verified?: Maybe<Scalars['Boolean']['output']>;
  /** When domain ownership was verified */
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
}

/**
 * Domain availability search result
 *
 * NOT a Django model - data comes from registrar API
 */
export interface DomainAvailabilityType {
  __typename?: 'DomainAvailabilityType';
  available: Scalars['Boolean']['output'];
  domain: Scalars['String']['output'];
  error?: Maybe<Scalars['String']['output']>;
  premium?: Maybe<Scalars['Boolean']['output']>;
  priceFcfa?: Maybe<Scalars['Int']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
  registrar?: Maybe<Scalars['String']['output']>;
}

/**
 * Domain purchase transaction record
 *
 * Tracks purchase from initiation through completion
 */
export interface DomainPurchaseType extends Node {
  __typename?: 'DomainPurchaseType';
  createdAt: Scalars['DateTime']['output'];
  /** Domain purchased (e.g., mystore.com) */
  domainName: Scalars['String']['output'];
  /** Error message if purchase failed */
  errorMessage: Scalars['String']['output'];
  /** USD to FCFA exchange rate at time of purchase */
  exchangeRate: Scalars['Decimal']['output'];
  /** Domain expiration date after this purchase */
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCompleted?: Maybe<Scalars['Boolean']['output']>;
  isFailed?: Maybe<Scalars['Boolean']['output']>;
  isPending?: Maybe<Scalars['Boolean']['output']>;
  /** Payment method used (mobile_money, card, etc.) */
  paymentMethod: Scalars['String']['output'];
  /** MTN Mobile Money, Orange Money, etc. */
  paymentProvider?: Maybe<Scalars['String']['output']>;
  paymentStatus: WorkspaceHostingDomainPurchasePaymentStatusChoices;
  /** Price charged to customer in FCFA */
  priceFcfa: Scalars['Decimal']['output'];
  /** When domain was successfully registered */
  registeredAt?: Maybe<Scalars['DateTime']['output']>;
  /** Registrar used for purchase */
  registrar: WorkspaceHostingDomainPurchaseRegistrarChoices;
  /** Order ID from registrar API */
  registrarOrderId?: Maybe<Scalars['String']['output']>;
  /** Domain registration period in years */
  registrationPeriodYears: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
}

/**
 * Domain renewal transaction record
 *
 * Tracks renewal attempts and history
 */
export interface DomainRenewalType extends Node {
  __typename?: 'DomainRenewalType';
  createdAt: Scalars['DateTime']['output'];
  /** How many days before expiry the warning was sent (30, 15, 7, 1) */
  daysBeforeExpiryWarned?: Maybe<Scalars['Int']['output']>;
  domainName: Scalars['String']['output'];
  /** USD to FCFA exchange rate at time of renewal */
  exchangeRate: Scalars['Decimal']['output'];
  id: Scalars['ID']['output'];
  isCompleted?: Maybe<Scalars['Boolean']['output']>;
  isFailed?: Maybe<Scalars['Boolean']['output']>;
  isPendingPayment?: Maybe<Scalars['Boolean']['output']>;
  /** New expiry date after renewal */
  newExpiryDate?: Maybe<Scalars['DateTime']['output']>;
  paymentMethod: Scalars['String']['output'];
  paymentProvider?: Maybe<Scalars['String']['output']>;
  /** Domain expiry date before renewal */
  previousExpiryDate: Scalars['DateTime']['output'];
  registrar: Scalars['String']['output'];
  /** Renewal transaction ID from registrar */
  registrarRenewalId?: Maybe<Scalars['String']['output']>;
  /** Renewal price in FCFA (charged to customer) */
  renewalPriceFcfa: Scalars['Decimal']['output'];
  renewalStatus: WorkspaceHostingDomainRenewalRenewalStatusChoices;
  renewedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** When renewal warning was sent to user */
  warningSentAt?: Maybe<Scalars['DateTime']['output']>;
}

/**
 * Alternative domain suggestion
 *
 * NOT a Django model - generated by registrar service
 */
export interface DomainSuggestionType {
  __typename?: 'DomainSuggestionType';
  available: Scalars['Boolean']['output'];
  domain: Scalars['String']['output'];
  priceFcfa?: Maybe<Scalars['Int']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
  registrar?: Maybe<Scalars['String']['output']>;
}

/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface Mutation {
  __typename?: 'Mutation';
  /**
   * Change workspace subdomain (e.g., mystore.huzilerz.com)
   *
   * Free for all tiers - uses SubdomainService
   * Atomic update across WorkspaceInfrastructure and DeployedSite
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
   * Search domain availability with Cameroon pricing (FCFA)
   *
   * Returns availability + pricing + alternative suggestions
   * Uses DomainRegistrarService to check with Namecheap/GoDaddy
   */
  searchDomain?: Maybe<SearchDomain>;
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
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface MutationChangeSubdomainArgs {
  input: ChangeSubdomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface MutationConnectCustomDomainArgs {
  input: ConnectCustomDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface MutationPurchaseDomainArgs {
  input: PurchaseDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface MutationRenewDomainArgs {
  input: RenewDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface MutationSearchDomainArgs {
  input: SearchDomainInput;
}


/**
 * Domain management mutations (all require authentication + workspace)
 *
 * - searchDomain: Check domain availability + pricing
 * - purchaseDomain: Initiate domain purchase (mobile money flow)
 * - renewDomain: Initiate domain renewal (mobile money flow)
 * - changeSubdomain: Change workspace subdomain
 * - connectCustomDomain: Connect externally-owned domain (Shopify 2-step flow)
 * - verifyCustomDomain: Manually trigger domain verification
 */
export interface MutationVerifyCustomDomainArgs {
  domainId: Scalars['ID']['input'];
}

/** An object with an ID */
export interface Node {
  /** The ID of the object */
  id: Scalars['ID']['output'];
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
 */
export interface PurchaseDomainInput {
  /** Domain to purchase */
  domain: Scalars['String']['input'];
  /** Registration period (1-10 years) */
  registrationPeriodYears?: InputMaybe<Scalars['Int']['input']>;
  /** Workspace to associate domain with */
  workspaceId: Scalars['ID']['input'];
}

/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface Query {
  __typename?: 'Query';
  /** Get single custom domain by ID (for polling verification status) */
  customDomain?: Maybe<CustomDomainType>;
  /** Get domain purchase status and details */
  domainPurchaseStatus?: Maybe<DomainPurchaseType>;
  /** Get domain renewal status and details */
  domainRenewalStatus?: Maybe<DomainRenewalType>;
  /** Get subdomain suggestions (e.g., mystore, mystore-cm, mystore237) */
  subdomainSuggestions?: Maybe<Array<Maybe<SubdomainSuggestionType>>>;
  /** Validate if subdomain is available and DNS-compliant */
  validateSubdomain?: Maybe<Scalars['Boolean']['output']>;
  /** Get all domains for workspace (purchased + connected) */
  workspaceDomains?: Maybe<Array<Maybe<CustomDomainType>>>;
  /** Get workspace infrastructure (subdomain, URLs, status) */
  workspaceInfrastructure?: Maybe<WorkspaceInfrastructureType>;
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QueryCustomDomainArgs {
  id: Scalars['ID']['input'];
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QueryDomainPurchaseStatusArgs {
  purchaseId: Scalars['ID']['input'];
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QueryDomainRenewalStatusArgs {
  renewalId: Scalars['ID']['input'];
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QuerySubdomainSuggestionsArgs {
  baseName: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QueryValidateSubdomainArgs {
  subdomain: Scalars['String']['input'];
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QueryWorkspaceDomainsArgs {
  workspaceId: Scalars['ID']['input'];
}


/**
 * Domain management queries (all require authentication + workspace)
 *
 * - workspaceDomains: Get all domains for workspace (purchased + connected)
 * - customDomain: Get single domain by ID (for polling verification status)
 * - workspaceInfrastructure: Get workspace subdomain and URLs
 * - domainPurchaseStatus: Track purchase progress
 * - domainRenewalStatus: Track renewal progress
 * - subdomainSuggestions: Get subdomain suggestions
 * - validateSubdomain: Check subdomain availability
 */
export interface QueryWorkspaceInfrastructureArgs {
  workspaceId: Scalars['ID']['input'];
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
 * Search domain availability with Cameroon pricing (FCFA)
 *
 * Returns availability + pricing + alternative suggestions
 * Uses DomainRegistrarService to check with Namecheap/GoDaddy
 */
export interface SearchDomain {
  __typename?: 'SearchDomain';
  availability?: Maybe<DomainAvailabilityType>;
  error?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
  suggestions?: Maybe<Array<Maybe<DomainSuggestionType>>>;
}

/**
 * Input for searching domain availability
 *
 * Used by searchDomain mutation
 */
export interface SearchDomainInput {
  /** Domain to search (e.g., 'mystore.com') */
  domain: Scalars['String']['input'];
}

/**
 * Subdomain suggestion (e.g., mystore, mystore-cm, mystore237)
 *
 * NOT a Django model - generated by subdomain service
 */
export interface SubdomainSuggestionType {
  __typename?: 'SubdomainSuggestionType';
  available: Scalars['Boolean']['output'];
  fullDomain: Scalars['String']['output'];
  subdomain: Scalars['String']['output'];
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
export enum WorkspaceHostingDomainPurchaseRegistrarChoices {
  /** GoDaddy */
  Godaddy = 'GODADDY',
  /** Namecheap */
  Namecheap = 'NAMECHEAP'
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
export enum WorkspaceHostingWorkspaceInfrastructureStatusChoices {
  /** Active */
  Active = 'ACTIVE',
  /** Failed */
  Failed = 'FAILED',
  /** Migrating */
  Migrating = 'MIGRATING',
  /** Provisioning */
  Provisioning = 'PROVISIONING',
  /** Suspended */
  Suspended = 'SUSPENDED'
}

/**
 * Workspace infrastructure info (subdomain, URLs, status)
 *
 * Used to show current subdomain in UI (Shopify pattern)
 */
export interface WorkspaceInfrastructureType extends Node {
  __typename?: 'WorkspaceInfrastructureType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  previewUrl: Scalars['String']['output'];
  status: WorkspaceHostingWorkspaceInfrastructureStatusChoices;
  subdomain: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
}

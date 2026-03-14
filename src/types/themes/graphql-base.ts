export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  Decimal: { input: string; output: string };
  JSONString: { input: any; output: any };
}

/**
 * Add theme to user's library (clone from theme store)
 *
 * Shopify pattern: "Use theme" button in theme store
 * Creates draft customization with cloned puck data
 */
export interface AddTheme {
  __typename?: "AddTheme";
  customization?: Maybe<ThemeCustomizationType>;
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Triggers an asynchronous worker to safely deep-merge the global Template update
 * into the user's active theme customization snapshot.
 */
export interface ApplyThemeUpdate {
  __typename?: "ApplyThemeUpdate";
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Delete theme from library
 *
 * Shopify pattern: Permanent deletion (no archive)
 * Cannot delete active theme - must publish another first
 */
export interface DeleteTheme {
  __typename?: "DeleteTheme";
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Duplicate theme for experimentation
 *
 * Shopify pattern: Copy theme to try variations
 * Creates new draft with copied puck data
 */
export interface DuplicateTheme {
  __typename?: "DuplicateTheme";
  customization?: Maybe<ThemeCustomizationType>;
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Feature category with items list
 * Used for nested features structure
 */
export interface FeatureCategoryType {
  __typename?: "FeatureCategoryType";
  category?: Maybe<Scalars["String"]["output"]>;
  items?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface Mutation {
  __typename?: "Mutation";
  /**
   * Add theme to user's library (clone from theme store)
   *
   * Shopify pattern: "Use theme" button in theme store
   * Creates draft customization with cloned puck data
   */
  addTheme?: Maybe<AddTheme>;
  /**
   * Triggers an asynchronous worker to safely deep-merge the global Template update
   * into the user's active theme customization snapshot.
   */
  applyThemeUpdate?: Maybe<ApplyThemeUpdate>;
  /**
   * Delete theme from library
   *
   * Shopify pattern: Permanent deletion (no archive)
   * Cannot delete active theme - must publish another first
   */
  deleteTheme?: Maybe<DeleteTheme>;
  /**
   * Duplicate theme for experimentation
   *
   * Shopify pattern: Copy theme to try variations
   * Creates new draft with copied puck data
   */
  duplicateTheme?: Maybe<DuplicateTheme>;
  /**
   * Publish theme (make it live on workspace)
   *
   * Shopify pattern: Only one published theme at a time
   * Auto-unpublishes any other active theme
   */
  publishTheme?: Maybe<PublishTheme>;
  /**
   * Rename theme in library
   *
   * User-friendly labels for theme organization
   */
  renameTheme?: Maybe<RenameTheme>;
  /**
   * Rollback to a previous snapshot of the theme.
   *
   * Sets the ThemeInstance pointer back to an older ThemeVersion.
   * Instant switch. No migration needed.
   */
  rollbackThemeVersion?: Maybe<RollbackThemeVersion>;
  /**
   * Unpublish theme (take it offline)
   *
   * Workspace will have no active theme until another is published
   * Use case: Maintenance mode or switching themes
   */
  unpublishTheme?: Maybe<UnpublishTheme>;
  /**
   * Update theme customization (save Puck editor changes)
   *
   * Auto-saves from Puck editor every 30s or manual save
   * Updates puck_data and/or puck_config
   */
  updateThemeCustomization?: Maybe<UpdateThemeCustomization>;
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationAddThemeArgs {
  themeSlug: Scalars["String"]["input"];
  workspaceId: Scalars["ID"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationApplyThemeUpdateArgs {
  id: Scalars["ID"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationDeleteThemeArgs {
  id: Scalars["ID"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationDuplicateThemeArgs {
  id: Scalars["ID"]["input"];
  newName?: InputMaybe<Scalars["String"]["input"]>;
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationPublishThemeArgs {
  id: Scalars["ID"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationRenameThemeArgs {
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationRollbackThemeVersionArgs {
  id: Scalars["ID"]["input"];
  versionId: Scalars["ID"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationUnpublishThemeArgs {
  id: Scalars["ID"]["input"];
}

/**
 * Theme mutations (all require authentication + workspace scoping)
 *
 * - addTheme: Clone theme to library
 * - updateThemeCustomization: Save Puck edits
 * - publishTheme: Make theme live
 * - unpublishTheme: Take theme offline
 * - deleteTheme: Remove from library
 * - duplicateTheme: Copy for experimentation
 * - renameTheme: Change theme name
 */
export interface MutationUpdateThemeCustomizationArgs {
  id: Scalars["ID"]["input"];
  input: UpdateThemeCustomizationInput;
}

/** An object with an ID */
export interface Node {
  /** The ID of the object */
  id: Scalars["ID"]["output"];
}

/** The Relay compliant `PageInfo` type, containing data necessary to paginate this connection. */
export interface PageInfo {
  __typename?: "PageInfo";
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars["String"]["output"]>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars["Boolean"]["output"];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars["String"]["output"]>;
}

/**
 * Publish theme (make it live on workspace)
 *
 * Shopify pattern: Only one published theme at a time
 * Auto-unpublishes any other active theme
 */
export interface PublishTheme {
  __typename?: "PublishTheme";
  customization?: Maybe<ThemeCustomizationType>;
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/** Response type for public puck data query */
export interface PuckDataResponse {
  __typename?: "PuckDataResponse";
  data?: Maybe<Scalars["JSONString"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface Query {
  __typename?: "Query";
  /** Get currently published theme for workspace */
  activeTheme?: Maybe<ThemeCustomizationType>;
  /** Get all themes in user's library (published + drafts) */
  myThemes?: Maybe<Array<Maybe<ThemeCustomizationType>>>;
  /** Fetch active theme's puck data for storefront (uses X-Store-Hostname header) */
  publicPuckData?: Maybe<PuckDataResponse>;
  /** Get specific theme customization for Puck editor */
  themeCustomization?: Maybe<ThemeCustomizationType>;
  /** Get detailed theme information by slug (PUBLIC) */
  themeDetails?: Maybe<ThemeDetailsType>;
  /** Get all timestamped snapshots representing previous versions or edits */
  themeVersionHistory?: Maybe<Array<Maybe<ThemeVersionType>>>;
  /** Browse theme store with pagination and filtering (PUBLIC) */
  themes?: Maybe<ThemeTypeConnection>;
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface QueryActiveThemeArgs {
  workspaceId: Scalars["ID"]["input"];
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface QueryMyThemesArgs {
  workspaceId: Scalars["ID"]["input"];
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface QueryThemeCustomizationArgs {
  id: Scalars["ID"]["input"];
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface QueryThemeDetailsArgs {
  slug: Scalars["String"]["input"];
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface QueryThemeVersionHistoryArgs {
  customizationId: Scalars["ID"]["input"];
}

/**
 * Combined theme queries
 *
 * Public queries (no auth):
 * - themes: Browse theme store
 * - themeDetails: View single theme
 * - publicPuckData: Fetch puck data for storefront (X-Store-Hostname header)
 *
 * Authenticated queries (requires workspace):
 * - myThemes: User's theme library
 * - themeCustomization: Get customization for editor
 * - activeTheme: Currently published theme
 */
export interface QueryThemesArgs {
  after?: InputMaybe<Scalars["String"]["input"]>;
  before?: InputMaybe<Scalars["String"]["input"]>;
  first?: InputMaybe<Scalars["Int"]["input"]>;
  last?: InputMaybe<Scalars["Int"]["input"]>;
  name_Icontains?: InputMaybe<Scalars["String"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  priceTier?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  templateType?: InputMaybe<Scalars["String"]["input"]>;
}

/**
 * Rename theme in library
 *
 * User-friendly labels for theme organization
 */
export interface RenameTheme {
  __typename?: "RenameTheme";
  customization?: Maybe<ThemeCustomizationType>;
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Rollback to a previous snapshot of the theme.
 *
 * Sets the ThemeInstance pointer back to an older ThemeVersion.
 * Instant switch. No migration needed.
 */
export interface RollbackThemeVersion {
  __typename?: "RollbackThemeVersion";
  customization?: Maybe<ThemeCustomizationType>;
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Showcase section with title, description, and image
 * Used in theme details page
 */
export interface ShowcaseSectionType {
  __typename?: "ShowcaseSectionType";
  description?: Maybe<Scalars["String"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
}

/**
 * User's theme customization in their library
 *
 * Contains user's puck data/config for the Puck editor
 * Workspace-scoped - only accessible to workspace owner
 */
export interface ThemeCustomizationType extends Node {
  __typename?: "ThemeCustomizationType";
  /** The currently active snapshot version for this instance (Required) */
  activeVersion: ThemeVersionType;
  canDelete?: Maybe<Scalars["Boolean"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  /** Whether this theme is currently published and live on the workspace */
  isActive: Scalars["Boolean"]["output"];
  isDraft?: Maybe<Scalars["Boolean"]["output"]>;
  /** Whether the published storefront is password protected */
  isPasswordProtected?: Maybe<Scalars["Boolean"]["output"]>;
  isPublished?: Maybe<Scalars["Boolean"]["output"]>;
  /** When customization was last modified */
  lastEditedAt: Scalars["DateTime"]["output"];
  /** When this customization was last published to production */
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Puck Editor configuration */
  puckConfig?: Maybe<Scalars["JSONString"]["output"]>;
  /** Puck layout snapshot data */
  puckData?: Maybe<Scalars["JSONString"]["output"]>;
  /** Current password for password-protected storefront (for merchant to share) */
  storefrontPassword?: Maybe<Scalars["String"]["output"]>;
  /** Master template being customized */
  template: ThemeDetailsType;
  /** User-friendly name for this theme (can be renamed) */
  themeName: Scalars["String"]["output"];
  themeSlug?: Maybe<Scalars["String"]["output"]>;
}

/**
 * Detailed theme type for single theme view
 *
 * Contains full metadata for decision-making
 * Still NO puck data (user gets that after adding to library)
 */
export interface ThemeDetailsType {
  __typename?: "ThemeDetailsType";
  /** Number of active workspaces using this template */
  activeUsageCount: Scalars["Int"]["output"];
  /** Template author or creator */
  author: Scalars["String"]["output"];
  /** Technology compatibility requirements (nextjs, react, etc.) */
  compatibility: Scalars["JSONString"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  /** The latest stabilized global version of this theme */
  currentVersion: Scalars["String"]["output"];
  /** Live demo URL for previewing the template */
  demoUrl: Scalars["String"]["output"];
  /** Detailed description of the template */
  description: Scalars["String"]["output"];
  /** Number of times this template has been downloaded */
  downloadCount: Scalars["Int"]["output"];
  features?: Maybe<Array<Maybe<FeatureCategoryType>>>;
  id: Scalars["ID"]["output"];
  isFree?: Maybe<Scalars["Boolean"]["output"]>;
  isPaid?: Maybe<Scalars["Boolean"]["output"]>;
  /** Template license type */
  license: Scalars["String"]["output"];
  /** Unique name for the template */
  name: Scalars["String"]["output"];
  /** Preview image URL from CDN */
  previewImage: Scalars["String"]["output"];
  /** Price in FCFA for paid/exclusive templates */
  priceAmount?: Maybe<Scalars["Decimal"]["output"]>;
  /** Pricing category for the template */
  priceTier: ThemeTemplatePriceTierChoices;
  showcaseSections?: Maybe<Array<Maybe<ShowcaseSectionType>>>;
  /** URL-friendly version of the name */
  slug: Scalars["String"]["output"];
  /** Current status of the template */
  status: ThemeTemplateStatusChoices;
  /** Tags for categorization and search */
  tags: Scalars["JSONString"]["output"];
  /** Type of business this template is designed for */
  templateType: ThemeTemplateTemplateTypeChoices;
  updatedAt: Scalars["DateTime"]["output"];
  /** Number of times this template has been viewed */
  viewCount: Scalars["Int"]["output"];
  /** List of compatible workspace types (e.g., ['store', 'services']) */
  workspaceTypes: Scalars["JSONString"]["output"];
}

/** An enumeration. */
export enum ThemeTemplatePriceTierChoices {
  /** Exclusive */
  Exclusive = "EXCLUSIVE",
  /** Free */
  Free = "FREE",
  /** Paid */
  Paid = "PAID",
}

/** An enumeration. */
export enum ThemeTemplateStatusChoices {
  /** Active */
  Active = "ACTIVE",
  /** Deprecated */
  Deprecated = "DEPRECATED",
  /** Draft */
  Draft = "DRAFT",
  /** Published */
  Published = "PUBLISHED",
}

/** An enumeration. */
export enum ThemeTemplateTemplateTypeChoices {
  /** Blog */
  Blog = "BLOG",
  /** E-commerce */
  Ecommerce = "ECOMMERCE",
  /** Restaurant */
  Restaurant = "RESTAURANT",
  /** Services */
  Services = "SERVICES",
}

/** An enumeration. */
export enum ThemeTemplateVersionCreatedByActorChoices {
  /** Merchant */
  Merchant = "MERCHANT",
  /** System */
  System = "SYSTEM",
}

/** An enumeration. */
export enum ThemeTemplateVersionStatusChoices {
  /** Active */
  Active = "ACTIVE",
  /** Deprecated */
  Deprecated = "DEPRECATED",
  /** Draft */
  Draft = "DRAFT",
}

/**
 * Public theme type for theme store listing
 *
 * Contains light metadata for browsing
 * NO puck data (that's only for user customizations)
 */
export interface ThemeType extends Node {
  __typename?: "ThemeType";
  /** Number of active workspaces using this template */
  activeUsageCount: Scalars["Int"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  /** The latest stabilized global version of this theme */
  currentVersion: Scalars["String"]["output"];
  /** Live demo URL for previewing the template */
  demoUrl: Scalars["String"]["output"];
  /** Detailed description of the template */
  description: Scalars["String"]["output"];
  /** Number of times this template has been downloaded */
  downloadCount: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  /** Unique name for the template */
  name: Scalars["String"]["output"];
  /** Preview image URL from CDN */
  previewImage: Scalars["String"]["output"];
  /** Price in FCFA for paid/exclusive templates */
  priceAmount?: Maybe<Scalars["Decimal"]["output"]>;
  /** Pricing category for the template */
  priceTier: ThemeTemplatePriceTierChoices;
  /** URL-friendly version of the name */
  slug: Scalars["String"]["output"];
  /** Current status of the template */
  status: ThemeTemplateStatusChoices;
  /** Type of business this template is designed for */
  templateType: ThemeTemplateTemplateTypeChoices;
  updatedAt: Scalars["DateTime"]["output"];
  /** Number of times this template has been viewed */
  viewCount: Scalars["Int"]["output"];
}

export interface ThemeTypeConnection {
  __typename?: "ThemeTypeConnection";
  /** Contains the nodes in this connection. */
  edges: Array<Maybe<ThemeTypeEdge>>;
  /** Pagination data for this connection. */
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars["Int"]["output"]>;
}

/** A Relay edge containing a `ThemeType` and its cursor. */
export interface ThemeTypeEdge {
  __typename?: "ThemeTypeEdge";
  /** A cursor for use in pagination */
  cursor: Scalars["String"]["output"];
  /** The item at the end of the edge */
  node?: Maybe<ThemeType>;
}

/**
 * Snapshot history for a specific Theme Customization instance.
 *
 * Exposes past saves and system updates that can be rolled back to.
 */
export interface ThemeVersionType extends Node {
  __typename?: "ThemeVersionType";
  createdAt: Scalars["DateTime"]["output"];
  createdByActor: ThemeTemplateVersionCreatedByActorChoices;
  /** The theme instance this snapshot belongs to */
  customization: ThemeCustomizationType;
  id: Scalars["ID"]["output"];
  /** True if this snapshot was generated by an upstream theme update, False if saved by merchant */
  isSystemUpdate: Scalars["Boolean"]["output"];
  /** Logs or details about the data migration process if applicable */
  migrationLog?: Maybe<Scalars["JSONString"]["output"]>;
  /** Full snapshot of puck layout */
  puckDataSnapshot?: Maybe<Scalars["JSONString"]["output"]>;
  /** Current status of this version */
  status: ThemeTemplateVersionStatusChoices;
  /** Version identifier (e.g., 1.0.0, snapshot-2023) */
  versionNumber: Scalars["String"]["output"];
}

/**
 * Unpublish theme (take it offline)
 *
 * Workspace will have no active theme until another is published
 * Use case: Maintenance mode or switching themes
 */
export interface UnpublishTheme {
  __typename?: "UnpublishTheme";
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Update theme customization (save Puck editor changes)
 *
 * Auto-saves from Puck editor every 30s or manual save
 * Updates puck_data and/or puck_config
 */
export interface UpdateThemeCustomization {
  __typename?: "UpdateThemeCustomization";
  customization?: Maybe<ThemeCustomizationType>;
  error?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  success?: Maybe<Scalars["Boolean"]["output"]>;
}

/**
 * Input for updating theme customization
 *
 * Updates user's puck data and config from Puck editor
 * Both fields optional - update only what changed
 */
export interface UpdateThemeCustomizationInput {
  /** User's customized Puck config (component settings) */
  puckConfig?: InputMaybe<Scalars["JSONString"]["input"]>;
  /** User's customized Puck data (page layout) */
  puckData?: InputMaybe<Scalars["JSONString"]["input"]>;
}

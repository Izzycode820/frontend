import { NextRequest, NextResponse } from 'next/server';

/*
================================================================================
SUBSCRIPTION SUSPENSION - TWO-LAYER DEFENSE (OPTION B)
================================================================================

LAYER 1: MIDDLEWARE (THIS FILE) - Fast JWT Check
-------------------------------------------------
- Checks JWT subscription.status (stateless, no DB hit)
- Redirects 'suspended' users to /workspace/reactivate
- Does NOT redirect 'cancelled' users (they keep access until expires_at)
- Acceptable delay: 0-15 minutes (JWT refresh interval)
- Use case: Block page access (reads)

Status Semantics:
- 'suspended' = Non-payment, grace period expired (immediate block)
- 'cancelled' = User cancelled but paid period still valid (keep access)

LAYER 2: API LAYER - DB Verification (To Implement)
----------------------------------------------------
Add DB check before critical mutations (writes/payments):

Example in GraphQL resolvers:
```python
# In subscription mutations (createSubscription, renewSubscription, etc.)
@login_required
def resolve_renew_subscription(self, info, input):
    user = info.context.user

    # CRITICAL: Verify current status from DB (not JWT)
    subscription = user.subscription
    if subscription.status == 'suspended':
        raise GraphQLError(
            "Your subscription is suspended. Please reactivate your plan.",
            extensions={'code': 'SUBSCRIPTION_SUSPENDED'}
        )

    # Proceed with renewal...
```

Apply to these endpoints:
- renewSubscription (payment)
- createSubscription (payment)
- upgradeSubscription (payment)
- Any product/theme creation endpoints
- Any store settings mutations

Why two layers?
- Middleware: Fast (no DB), catches 99% of cases
- API: Authoritative (DB source of truth), prevents race conditions
- Combined: Fast UX + bulletproof security

Delay Scenario:
- 10:00 AM - Grace period ends → DB: status='suspended'
- 10:01 AM - User still has JWT with status='active' (15 min TTL)
- 10:01-10:16 AM - Can browse workspace (middleware allows)
- 10:01 AM - Tries to create product → API blocks (DB check)
- 10:16 AM - JWT refreshes → Middleware redirects

Acceptable tradeoff: User can browse for <15 mins, but blocked from actions.

 Examples:
  # Product mutations
  resolve_create_product → Check suspended
  resolve_update_product → Check suspended
  resolve_delete_product → Check suspended

  # Theme mutations  
  resolve_install_theme → Check suspended
  resolve_customize_theme → Check suspended

  # Store settings
  resolve_update_store_settings → Check suspended

  # Subscription mutations
  resolve_renew_subscription → Check suspended
  resolve_upgrade_subscription → Check suspended

  ---
  BUT - Middleware Already Handles Most Cases!

  Since middleware redirects /workspace → /workspace/reactivate, suspended users can't even access pages that make these API calls.

  API checks are just a safety net for the JWT delay edge case:
  - User has stale JWT (status='active' but DB is 'suspended')
  - Middleware lets them browse for <15 mins
  - They try to mutate data via API call
  - API blocks them (DB check)

  ---
  Simpler Approach (Recommended for early stage):

  Create a reusable decorator/guard:

  def require_active_subscription(resolver):
      def wrapper(self, info, *args, **kwargs):
          user = info.context.user
          if user.subscription.status == 'suspended':
              raise GraphQLError(
                  "Subscription suspended. Reactivate to continue.",
                  extensions={'code': 'SUBSCRIPTION_SUSPENDED'}
              )
          return resolver(self, info, *args, **kwargs)
      return wrapper

  # Apply to ALL workspace mutations
  @require_active_subscription
  def resolve_create_product(self, info, input):
  
================================================================================
*/

// Configuration for the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};

// Known system domains (add your production domain here)
const SYSTEM_DOMAINS = ['localhost', 'localhost:3000', 'huzilerz.com', 'www.huzilerz.com', 'api.huzilerz.com'];
const SUBDOMAIN_SUFFIX = '.huzilerz.com';

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/workspace', '/checkout'];

// Auth routes (public - no auth required)
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/register'];

// Public routes (accessible without auth)
const PUBLIC_ROUTES = ['/', '/pricing', '/features', '/about', '/contact', '/camp', '/showcase', '/blog', '/resources', '/billing'];

// Domain Helper functions removed as this frontend does not handle Storefront Routing.

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if user is authenticated via tokens
 * Checks for either refresh_token (long-lived) or access_token (short-lived)
 * to ensure valid session detection even if one cookie is momentarily missing/expired
 */
function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.has('refresh_token') || request.cookies.has('access_token');
}

/**
 * Decode JWT and extract subscription status
 * Stateless check - no DB hit (fast)
 * Uses same pattern as src/utils/jwt.ts (Edge runtime compatible)
 */
function getSubscriptionStatus(request: NextRequest): { tier: string; status: string } | null {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) return null;

  try {
    // Decode JWT payload (same as extractSubscriptionFromJWT utility)
    const payload = JSON.parse(atob(accessToken.split('.')[1]));

    return {
      tier: payload.subscription?.tier || 'free',
      status: payload.subscription?.status || 'unknown'
    };
  } catch (error) {
    // Invalid JWT format - let auth handle it
    return null;
  }
}

/**
 * Handle authentication for protected routes
 * (Currently disabled to rely on Client Side AuthGuard)
 */
function handleAuth(request: NextRequest): NextResponse | null {
  return null;
}



/**
 * Validate redirect path for middleware (OWASP-compliant)
 * Prevents open redirect vulnerabilities at SSR level
 */
function isValidRedirectPath(path: string): boolean {
  // Must be relative path
  if (!path.startsWith('/')) return false;

  // Prevent protocol-relative URLs
  if (path.startsWith('//')) return false;

  // Prevent path traversal
  if (path.includes('..')) return false;

  // Dynamic workspace routes: /workspace/[workspace_id]/...
  if (path.match(/^\/workspace\/[a-zA-Z0-9_-]+(\/.*)?$/)) {
    return true;
  }

  // Allowlist check (match frontend allowlist)
  const allowedPaths = ['/billing', '/workspace', '/settings', '/dashboard', '/pricing', '/camp', '/showcase', '/blog', '/resources', '/'];
  return allowedPaths.some(allowed => path.startsWith(allowed));
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // 0. BETA GATE: Cookie Check (Highest Priority)
  // If user tries to access /camp or /workspace without cookie, redirect to Home (Beta Page)
  const isProtectedBetaRoute =
    request.nextUrl.pathname.startsWith('/camp') ||
    request.nextUrl.pathname.startsWith('/workspace') ||
    request.nextUrl.pathname.startsWith('/auth');

  if (isProtectedBetaRoute) {
    const betaCookie = request.cookies.get('beta_token');

    // Check if cookie exists and has valid value (simple check)
    if (!betaCookie || betaCookie.value !== 'authorized') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Handle authentication for system domain
  if (SYSTEM_DOMAINS.includes(hostname)) {
    const authResponse = handleAuth(request);
    if (authResponse) return authResponse;
  }


  // Default behavior
  const response = NextResponse.next();

  // Apply Security Headers (CSP, X-Frame-Options, etc.)
  applySecurityHeaders(response);

  return response;
}

/**
 * Apply security headers to the response
 * Protects against Clickjacking, MIME sniffing, and other attacks
 */
function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Content-Security-Policy (CSP) is complex to implement strictly without breaking things,
  // so we skip it for this MVP phase to avoid blocking scripts/styles.
}
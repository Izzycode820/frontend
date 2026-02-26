import { NextRequest, NextResponse } from 'next/server';



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

  // 1. LOCALE DETECTION
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 
                 request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 
                 'en';

  // Handle authentication for system domain
  if (SYSTEM_DOMAINS.includes(hostname)) {
    const authResponse = handleAuth(request);
    if (authResponse) return authResponse;
  }


  // Default behavior
  const response = NextResponse.next();

  // 2. SET LOCALE COOKIE IF MISSING
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

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
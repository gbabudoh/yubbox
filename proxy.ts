import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Authenticated users are locked to /dashboard — redirect them away from these pages
const GUEST_ONLY = new Set(['/', '/login', '/register']);

// These prefixes require an active session
const PROTECTED = ['/dashboard', '/ads/create'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Authenticated user visiting a guest-only page ──
  // Redirect back to dashboard — they are locked in until logout
  if (token && GUEST_ONLY.has(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Unauthenticated user visiting a protected route ──
  if (!token && PROTECTED.some(p => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|images|icon\\.png|logo\\.png).*)',
  ],
};

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { aiLimiter, apiLimiter, authLimiter } from '@/lib/rate-limit';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function rateLimitResponse(resetAt: number): NextResponse {
  const res = NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    { status: 429 }
  );
  res.headers.set('Retry-After', String(Math.ceil((resetAt - Date.now()) / 1000)));
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // ── Rate limiting ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    let result: { success: boolean; remaining: number; resetAt: number };

    if (pathname.startsWith('/api/ai/')) {
      result = aiLimiter.check(ip);
    } else if (
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/auth/')
    ) {
      result = authLimiter.check(ip);
    } else {
      result = apiLimiter.check(ip);
    }

    if (!result.success) {
      return rateLimitResponse(result.resetAt);
    }
  }

  // ── Supabase session refresh ───────────────────────────────────────────────
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|workbox-.*\\.js|offline).*)',
  ],
};

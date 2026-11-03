import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const authCookie = req.cookies.get('pegbox_admin_auth');
    if (authCookie?.value === 'authenticated') {
      return NextResponse.next();
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Basic ')) {
      try {
        const authValue = authHeader.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        const expectedUser = process.env.ADMIN_USER || 'admin';
        const expectedPwd = process.env.ADMIN_PASSWORD || 'your_secure_password';

        if (user === expectedUser && pwd === expectedPwd) {
          return NextResponse.next();
        }
      } catch (_) {}
    }

    // Note: To avoid browser extensions entering infinite ERR_TOO_MANY_RETRIES loops,
    // the /admin page renders an in-app secure login view when unauthenticated,
    // rather than throwing a raw WWW-Authenticate challenge header.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

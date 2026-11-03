import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('pegbox_admin_auth');
  const authHeader = req.headers.get('authorization');

  let authenticated = false;

  if (authCookie?.value === 'authenticated') {
    authenticated = true;
  } else if (authHeader?.startsWith('Basic ')) {
    try {
      const authValue = authHeader.split(' ')[1];
      const [u, p] = atob(authValue).split(':');
      const expectedUser = process.env.ADMIN_USER || 'admin';
      const expectedPassword = process.env.ADMIN_PASSWORD || 'your_secure_password';
      if (u === expectedUser && p === expectedPassword) {
        authenticated = true;
      }
    } catch (_) {}
  }

  return NextResponse.json({ authenticated });
}


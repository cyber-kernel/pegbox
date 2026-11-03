import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user, password } = await req.json();

    const expectedUser = process.env.ADMIN_USER || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'your_secure_password';

    if (user === expectedUser && password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('pegbox_admin_auth', 'authenticated', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}


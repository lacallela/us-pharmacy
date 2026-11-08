import { NextResponse } from 'next/server';
import { findAdminByUsername } from '@/lib/queries';
import { verifyPassword, createSessionToken, getSessionCookieName } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const admin = await findAdminByUsername(username.trim());
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = createSessionToken(admin.username);
    const response = NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });

    response.cookies.set({
      name: getSessionCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

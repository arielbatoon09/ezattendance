import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      // Set a session cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

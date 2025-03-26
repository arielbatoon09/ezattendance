import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the admin session cookie
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');

  return NextResponse.json({ success: true });
}

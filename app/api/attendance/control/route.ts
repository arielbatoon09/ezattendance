import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { attendance_control } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get the latest control state
    const control = await db
      .select()
      .from(attendance_control)
      .orderBy(desc(attendance_control.updated_at))
      .limit(1);

    const isEnabled = control.length > 0 ? control[0].is_enabled : false;

    return NextResponse.json({ isEnabled });
  } catch (error) {
    console.error('Error fetching attendance control state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance control state' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { isEnabled } = await request.json();

    // Insert new control state
    await db.insert(attendance_control).values({
      is_enabled: isEnabled,
    });

    return NextResponse.json({ success: true, isEnabled });
  } catch (error) {
    console.error('Error updating attendance control state:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance control state' },
      { status: 500 }
    );
  }
}

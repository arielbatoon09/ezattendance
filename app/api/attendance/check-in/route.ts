import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { attendance_records, attendance_control } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json();

    // Check if attendance system is enabled
    const controlState = await db
      .select()
      .from(attendance_control)
      .orderBy(desc(attendance_control.updated_at))
      .limit(1);

    const isEnabled = controlState.length > 0 ? controlState[0].is_enabled : false;

    if (!isEnabled) {
      return NextResponse.json(
        { error: 'Attendance system is currently disabled' },
        { status: 403 }
      );
    }

    // If enabled, proceed with check-in
    const now = new Date();

    await db.insert(attendance_records).values({
      student_id: studentId,
      date: now,
      status: 'present',
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}

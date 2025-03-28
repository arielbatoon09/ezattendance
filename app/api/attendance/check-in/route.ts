import { NextResponse } from 'next/server';
import { markAttendance } from '@/app/action';
import { db } from '@/lib/db/db';
import { attendance_ip_strict } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { studentId, clientIp } = await request.json();

    if (!clientIp) {
      return NextResponse.json(
        { error: 'Client IP address is required' },
        { status: 400 }
      );
    }

    // Check for enabled IP rules
    const enabledIpRules = await db
      .select()
      .from(attendance_ip_strict)
      .where(eq(attendance_ip_strict.is_enabled, true));

    // If there are enabled IP rules, verify the client IP
    if (enabledIpRules.length > 0) {
      const isAllowedIp = enabledIpRules.some(
        (rule) => rule.ip_address === clientIp
      );

      if (!isAllowedIp) {
        return NextResponse.json(
          { error: "You're not able to present in the unauthorized network." },
          { status: 403 }
        );
      }
    }

    const result = await markAttendance(studentId, clientIp);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
} 
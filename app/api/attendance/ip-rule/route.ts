import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { attendance_ip_strict } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/attendance/ip-rule - Get all IP rules
export async function GET() {
  try {
    const rules = await db
      .select()
      .from(attendance_ip_strict)
      .orderBy(attendance_ip_strict.created_at);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching IP rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP rules' },
      { status: 500 }
    );
  }
}

// POST /api/attendance/ip-rule - Add new IP rule
export async function POST(request: Request) {
  try {
    const { ip_address } = await request.json();

    if (!ip_address) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return NextResponse.json(
        { error: 'Invalid IP address format' },
        { status: 400 }
      );
    }

    // Check if IP already exists
    const existingIp = await db
      .select()
      .from(attendance_ip_strict)
      .where(eq(attendance_ip_strict.ip_address, ip_address));

    if (existingIp.length > 0) {
      return NextResponse.json(
        { error: 'IP address already exists' },
        { status: 400 }
      );
    }

    // Add new IP rule
    const newRule = await db
      .insert(attendance_ip_strict)
      .values({
        ip_address,
        is_enabled: true, // Enable by default
      })
      .returning();

    return NextResponse.json({ rule: newRule[0] });
  } catch (error) {
    console.error('Error adding IP rule:', error);
    return NextResponse.json(
      { error: 'Failed to add IP rule' },
      { status: 500 }
    );
  }
}

// PATCH /api/attendance/ip-rule - Update IP rule status
export async function PATCH(request: Request) {
  try {
    const { ip_address, is_enabled } = await request.json();

    if (!ip_address) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    if (typeof is_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'is_enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Update IP rule status
    const updatedRule = await db
      .update(attendance_ip_strict)
      .set({ is_enabled })
      .where(eq(attendance_ip_strict.ip_address, ip_address))
      .returning();

    if (updatedRule.length === 0) {
      return NextResponse.json(
        { error: 'IP rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule: updatedRule[0] });
  } catch (error) {
    console.error('Error updating IP rule:', error);
    return NextResponse.json(
      { error: 'Failed to update IP rule' },
      { status: 500 }
    );
  }
}

// DELETE /api/attendance/ip-rule - Delete IP rule
export async function DELETE(request: Request) {
  try {
    const { ip_address } = await request.json();

    if (!ip_address) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    // Delete IP rule
    const deletedRule = await db
      .delete(attendance_ip_strict)
      .where(eq(attendance_ip_strict.ip_address, ip_address))
      .returning();

    if (deletedRule.length === 0) {
      return NextResponse.json(
        { error: 'IP rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting IP rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete IP rule' },
      { status: 500 }
    );
  }
}

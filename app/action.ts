'use server';

import { db } from '@/lib/db/db';
import { students, attendance_records } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function findStudent(studentId: string) {
  try {
    // Convert string ID to number for the query
    const numericId = parseInt(studentId, 10);
    if (isNaN(numericId)) {
      return { error: 'Invalid student ID format. Try again' };
    }

    const student = await db.query.students.findFirst({
      where: eq(students.id, numericId),
      columns: {
        id: true,
        first_name: true,
        last_name: true,
        middle_initial: true,
        section: true,
        email: true,
      },
    });

    if (!student) {
      return { error: 'Student not found. Try again' };
    }

    return { student };
  } catch (error) {
    console.error('Error finding student:', error);
    return { error: 'Failed to find student. Try again' };
  }
}

export async function markAttendance(studentId: string) {
  try {
    return await db.transaction(async (tx) => {
      // heck if student exists
      const student = await tx.query.students.findFirst({
        where: eq(students.id, parseInt(studentId, 10)),
      });

      if (!student) {
        return { error: 'Student not found. Try again' };
      }

      const now = new Date();
      const options = { timeZone: "Asia/Manila" };
      const today = now.toLocaleDateString("en-CA", options);

      // Check if attendance already exists for the current date
      const existingAttendance = await tx.query.attendance_records.findFirst({
        where: and(
          eq(attendance_records.student_id, studentId),
          eq(attendance_records.date, today)
        )
      });


      if (existingAttendance) {
        return { error: 'You already marked attendance for today.' };
      }

      // Insert attendance record with current date
      await tx.insert(attendance_records).values({
        student_id: studentId,
        status: 'present',
        date: today
      });

      return { success: 'Attendance marked successfully' };
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { error: 'Failed to mark attendance. Try again' };
  }
}

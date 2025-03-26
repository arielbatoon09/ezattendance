import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { attendance_records, students } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const date = searchParams.get('date');

    if (!section) {
      // If no section is provided, return unique dates that have attendance records
      const records = await db
        .selectDistinct({ date: attendance_records.date })
        .from(attendance_records)
        .orderBy(desc(attendance_records.date));

      return NextResponse.json({
        dates: records.map((r) => r.date),
      });
    }

    // Get all students in the section first
    const allStudents = await db
      .select({
        id: students.id,
        first_name: students.first_name,
        last_name: students.last_name,
        middle_initial: students.middle_initial,
        section: students.section,
      })
      .from(students)
      .where(eq(students.section, section));

    // If no students found in this section
    if (allStudents.length === 0) {
      return NextResponse.json({
        records: [],
        hasRecords: false,
        message: `No students found in section ${section}`,
      });
    }

    // If no date provided, return just the students list with absent status
    if (!date) {
      const studentsWithDefaultStatus = allStudents.map((student) => ({
        student: {
          id: student.id.toString(),
          first_name: student.first_name || '',
          last_name: student.last_name || '',
          middle_initial: student.middle_initial || '',
          section: student.section,
        },
        status: 'absent',
      }));

      return NextResponse.json({
        records: studentsWithDefaultStatus,
        hasRecords: false,
        message: 'No date selected',
      });
    }

    // Get all attendance records for the date
    const attendanceRecords = await db
      .select({
        student_id: attendance_records.student_id,
        status: attendance_records.status,
      })
      .from(attendance_records)
      .where(eq(attendance_records.date, date));

    // Create a map of student IDs to their attendance status
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.student_id, record.status])
    );

    // Check if any student from this section has an attendance record
    const hasAttendanceForSection = allStudents.some((student) =>
      attendanceMap.has(student.id.toString())
    );

    // If no attendance records found for this section and date
    if (!hasAttendanceForSection) {
      return NextResponse.json({
        records: [],
        hasRecords: false,
        message: `No attendance records for section ${section} on ${date}`,
      });
    }

    // Create the final attendance data for all students
    const finalRecords = allStudents.map((student) => {
      const studentId = student.id.toString();
      const status = attendanceMap.get(studentId) || 'absent';

      return {
        student: {
          id: studentId,
          first_name: student.first_name || '',
          last_name: student.last_name || '',
          middle_initial: student.middle_initial || '',
          section: student.section,
        },
        status,
      };
    });

    return NextResponse.json({
      records: finalRecords,
      hasRecords: true,
      debug: {
        selectedDate: date,
        selectedSection: section,
        attendanceRecordsFound: attendanceRecords.length,
        studentsInSection: allStudents.length,
        studentIds: allStudents.map((s) => s.id.toString()),
        attendanceIds: Array.from(attendanceMap.keys()),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch attendance records',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

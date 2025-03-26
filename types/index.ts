export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  section: string;
};

export type AttendanceRecord = {
  student: Student;
  status: 'present' | 'absent';
};

export type AttendanceData = AttendanceRecord;

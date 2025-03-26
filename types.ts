export type StudentInfo = {
  id: string;
  first_name: string;
  last_name: string;
  middle_initial: string;
  section: string;
  email: string;
}

export type AttendanceData = {
  id: string;
  student: StudentInfo;
  date: string;
  status: 'present' | 'absent';
  created_at?: string;
} 
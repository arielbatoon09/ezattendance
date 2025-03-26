'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { markAttendance, findStudent } from './action';
import { useState, useEffect } from 'react';
import { AlertCircle, Search, UserCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';

type FormData = {
  studentId: string;
};

type StudentInfo = {
  id: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  section: string;
  email?: string;
};

export default function Home() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAttendanceEnabled, setIsAttendanceEnabled] = useState<boolean | null>(null);

  // Check if attendance system is enabled
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        const response = await fetch('/api/attendance/control');
        const data = await response.json();
        setIsAttendanceEnabled(data.isEnabled);
      } catch {
        console.error('Error checking attendance status');
        setIsAttendanceEnabled(false);
      }
    };

    checkAttendanceStatus();
  }, []);

  const handleFindStudent = async (data: FormData) => {
    if (!isAttendanceEnabled) {
      setMessage({
        type: 'error',
        text: 'Attendance system is currently disabled',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const findResult = await findStudent(data.studentId);

      if (findResult.error) {
        setMessage({ type: 'error', text: findResult.error });
        setStudentInfo(null);
        return;
      }

      setStudentInfo(findResult.student);
      setMessage({ type: 'success', text: 'Student found successfully' });
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to find student. Please try again.',
      });
      setStudentInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!studentInfo) return;

    setIsLoading(true);
    try {
      const markResult = await markAttendance(studentInfo.id);

      if (markResult.error) {
        setMessage({ type: 'error', text: markResult.error });
        return;
      }

      setMessage({ type: 'success', text: markResult.success });
      reset();
      setStudentInfo(null);
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to mark attendance. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setMessage(null);
    setStudentInfo(null);
  };

  if (isAttendanceEnabled === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black/95 p-24">
        <Card className="w-[400px] border-white/20 bg-white/10">
          <CardHeader>
            <CardTitle className="text-white">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black/95 p-24">
      <Card className="w-[400px] border-white/20 bg-white/10">
        <CardHeader>
          <CardTitle className="text-white">Student Attendance</CardTitle>
          <CardDescription className="text-white/60">
            Enter your student ID to mark your attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAttendanceEnabled ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/20 p-4 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>Attendance system is currently disabled</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFindStudent)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-white">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  {...register('studentId', { required: true })}
                  type="text"
                  placeholder="Enter your student ID"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                {!studentInfo ? (
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Finding...'
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Student
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleMarkAttendance}
                      className="w-full bg-green-500 hover:bg-green-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        'Processing...'
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Mark as Present
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                      disabled={isLoading}
                    >
                      Reset
                    </Button>
                  </>
                )}
              </div>

              {message && (
                <div
                  className={`rounded-lg p-4 ${
                    message.type === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {studentInfo && (
                <div className="mt-4 rounded-lg bg-white/10 p-4">
                  <h3 className="mb-2 font-semibold text-white">Student Information</h3>
                  <p className="text-white/80">
                    Name: {studentInfo.first_name} {studentInfo.middle_initial}{' '}
                    {studentInfo.last_name}
                  </p>
                  <p className="text-white/80">Section: {studentInfo.section}</p>
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

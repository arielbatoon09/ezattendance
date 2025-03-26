'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Power, Search } from 'lucide-react';
import { format, parseISO, compareAsc } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { AttendanceData } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function ViewAttendance() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('BSIT 1A');
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRecords, setHasRecords] = useState(false);
  const [isAttendanceEnabled, setIsAttendanceEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // New state for filtering and pagination
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add this state after your other state declarations
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch attendance records
  const fetchAttendance = useCallback(async () => {
    if (!selectedDate || !selectedSection) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/attendance?section=${encodeURIComponent(selectedSection)}&date=${selectedDate}`
      );
      const data = await response.json();
      setAttendanceRecords(data.records);
      setHasRecords(data.hasRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedSection]);

  // Fetch available attendance dates
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        // Sort dates in ascending order (oldest first)
        const sortedDates = [...data.dates].sort((a, b) => compareAsc(parseISO(a), parseISO(b)));
        setAttendanceDates(sortedDates);

        // Set the first date as default if we have dates and no date is selected
        if (sortedDates.length > 0 && !selectedDate) {
          setSelectedDate(sortedDates[0]);
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
      }
    };

    fetchDates();
  }, [selectedDate]);

  // Fetch attendance records when date or section changes
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Fetch attendance control state
  useEffect(() => {
    const fetchControlState = async () => {
      try {
        const response = await fetch('/api/attendance/control');
        const data = await response.json();
        setIsAttendanceEnabled(data.isEnabled);
      } catch (error) {
        console.error('Error fetching attendance control state:', error);
      }
    };

    fetchControlState();
  }, []);

  // Handle attendance toggle
  const handleAttendanceToggle = async () => {
    setIsToggling(true);
    try {
      const response = await fetch('/api/attendance/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEnabled: !isAttendanceEnabled }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAttendanceEnabled(!isAttendanceEnabled);
      }
    } catch (error) {
      console.error('Error toggling attendance state:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  // Update the filtering logic to include search
  const filteredRecords = attendanceRecords
    .slice()
    .filter((record) => {
      // First apply status filter
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false;
      }

      // Then apply search filter if there's a search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          record.student.id.toLowerCase().includes(query) ||
          record.student.first_name.toLowerCase().includes(query) ||
          record.student.last_name.toLowerCase().includes(query) ||
          record.student.section.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      const lastNameA = (a.student.last_name || '').toLowerCase();
      const lastNameB = (b.student.last_name || '').toLowerCase();
      return lastNameA.localeCompare(lastNameB);
    });

  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, pageSize]);

  return (
    <section className="min-h-screen bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Attendance Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={isAttendanceEnabled ? 'default' : 'secondary'}
            size="sm"
            onClick={handleAttendanceToggle}
            disabled={isToggling}
            className={`gap-2 ${isAttendanceEnabled
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
              }`}
          >
            <Power className="h-4 w-4" />
            {isAttendanceEnabled ? 'Enabled' : 'Disabled'}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="min-h-[calc(100vh-5rem)] w-80 border-r border-white/10 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Attendance Dates</h2>
              <div className="space-y-2">
                {attendanceDates.map((date) => (
                  <Button
                    key={date}
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${selectedDate === date
                        ? 'border-white/80 bg-white/75 text-black hover:bg-white/90'
                        : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                      }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDisplayDate(date)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-white">Section</h2>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-[240px] border-white/20 bg-white/10 text-white">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BSIT 1A">BSIT 1A</SelectItem>
                      <SelectItem value="BSIT 1B">BSIT 1B</SelectItem>
                      <SelectItem value="BSIT 1C">BSIT 1C</SelectItem>
                      <SelectItem value="BSIT 1D">BSIT 1D</SelectItem>
                      <SelectItem value="BSIT 1E">BSIT 1E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h2 className="mb-2 text-lg font-semibold text-white">Search</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Search by ID, name, or section..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[300px] border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/40 h-10"
                    />
                  </div>
                </div>
              </div>

              {hasRecords && (
                <div className="flex justify-center items-center gap-4">
                  <div className="mt-7">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLoading(true);
                        fetchAttendance();
                      }}
                      disabled={loading}
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      Refresh
                    </Button>
                  </div>
                  <div>
                    <h2 className="mb-2 text-sm font-semibold text-white">Status Filter</h2>
                    <Select
                      value={statusFilter}
                      onValueChange={(value: 'all' | 'present' | 'absent') =>
                        setStatusFilter(value)
                      }
                    >
                      <SelectTrigger className="w-[140px] border-white/20 bg-white/10 text-white">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h2 className="mb-2 text-sm font-semibold text-white">Rows per page</h2>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(Number(value))}
                    >
                      <SelectTrigger className="w-[100px] border-white/20 bg-white/10 text-white">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white">Loading...</div>
              </div>
            ) : !hasRecords ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 py-20">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-yellow-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  No class records for {selectedSection}
                </h3>
                <p className="text-white/60">
                  on {selectedDate ? formatDisplayDate(selectedDate) : 'selected date'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-white">Student ID</TableHead>
                        <TableHead className="text-white">Last Name</TableHead>
                        <TableHead className="text-white">First Name</TableHead>
                        <TableHead className="text-white">MI</TableHead>
                        <TableHead className="text-white">Section</TableHead>
                        <TableHead className="text-right text-white">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRecords.map((record) => (
                        <TableRow
                          key={record.student.id}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <TableCell className="font-mono text-white">
                            {record.student.id}
                          </TableCell>
                          <TableCell className="text-white">{record.student.last_name}</TableCell>
                          <TableCell className="text-white">{record.student.first_name}</TableCell>
                          <TableCell className="text-white">
                            {record.student.middle_initial || '-'}
                          </TableCell>
                          <TableCell className="text-white">{record.student.section}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${record.status === 'present'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                                }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between text-white">
                  <div className="text-sm">
                    Showing {startIndex + 1}-{endIndex} of {totalRecords} records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="mx-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { usePathname } from 'next/navigation';

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isViewAttendance = pathname === '/view-attendance';

  return (
    <div className="min-h-screen bg-black">
      {!isViewAttendance && <Navbar />}
      {children}
      <Footer />
    </div>
  );
}
'use client';

import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

export function Navbar() {
  return (
    <header className="fixed top-6 z-50 w-full px-6">
      <nav className="mx-auto max-w-7xl">
        <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.03] px-8 py-3.5 shadow-[inset_0_0_0.5px_rgba(255,255,255,0.1)] backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent"></div>

          <div className="relative flex w-full items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold tracking-wider text-white transition-colors hover:text-white/90">
                EZAttendance
              </span>
            </Link>
            <Link href="/view-attendance">
              <Button size="lg" variant="outline" className="rounded-full">
                View Attendance
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

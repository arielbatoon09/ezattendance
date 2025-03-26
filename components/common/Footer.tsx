import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t-1 border-white/10 bg-black/50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold text-white">EZAttendance</h1>
          <p className="text-base text-gray-400">
            © 2025 EZAttendance. Made with 🖤 by
            <Link href="https://www.facebook.com/itsarielbatoon" className="text-white">
              {' '}
              Ariel Batoon
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

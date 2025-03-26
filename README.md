# EZAttendance

A modern web-based student attendance system built with Next.js 15 and Supabase with DrizzleORM.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **ORM:** DrizzleORM
- **Authentication:** Custom Approach
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Form Handling:** React Hook Form

## Prerequisites

- Node.js 18+ 
- PostgreSQL
- npm (recommended) or npm

## Getting Started

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd ezattendance
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/[yourdbname]"

# Next Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Admin Credentials (for dashboard access)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"
```

4. **Database Setup and Development**

```bash
# Development
npm dev              # Start development server with turbopack
npm build            # Build for production
npm start            # Start production server

# Database Management (Drizzle)
npm db:generate      # Generate migrations
npm db:migrate       # Apply migrations
npm db:push         # Push schema changes
npm db:studio       # Open Drizzle Studio

# Code Quality
npm lint            # Run ESLint
npm format          # Format code with Prettier
npm format:check    # Check code formatting
```

5. **Start the development server**

```bash
npm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
ezattendance/
├── app/                   # Next.js app router files
│   ├── api/              # API routes
│   ├── view-attendance/  # Admin dashboard
│   └── page.tsx         # Main attendance page
├── components/           # Reusable components
├── lib/                  # Utility functions
│   └── db/              # Database configuration
│       ├── migrations/  # DrizzleORM migrations
│       └── schema.ts   # Database schema
└── types/               # TypeScript type definitions
```

## Features

- **Student Check-in:** Quick and easy attendance marking
- **Admin Dashboard:** View and manage attendance records
- **Section Management:** Organize students by sections
- **Attendance Control:** Enable/disable attendance system
- **Dark Theme:** Modern and eye-friendly design
- **Responsive UI:** Works on desktop and mobile devices

## Development Guidelines

1. **Code Style and Quality**
   ```bash
   # Format your code
   npm format

   # Check code formatting
   npm format:check

   # Run linter
   npm lint
   ```

2. **Database Management**
   ```bash
   # Generate new migration after schema changes
   npm db:generate

   # Apply migrations
   npm db:migrate

   # Push schema changes directly
   npm db:push

   # Open Drizzle Studio for database management
   npm db:studio
   ```

3. **Testing Changes**
   - Test all features manually after changes
   - Ensure all code quality checks pass
   - Verify database migrations work correctly

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run all checks:
   ```bash
   npm lint
   npm format:check
   ```
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

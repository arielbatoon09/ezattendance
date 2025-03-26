import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' }); // Load .env.local in non-production
} else {
  config({ path: '.env' }); // Load .env in production
}

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables.');
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

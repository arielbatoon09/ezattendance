import { sql } from 'drizzle-orm/sql';
import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  date,
  boolean,
} from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  last_name: text('last_name'),
  first_name: text('first_name'),
  middle_initial: text('middle_initial'),
  section: text('section').default('BSIT 1A'),
  email: text('email'),
  created_at: timestamp('created_at').defaultNow(),
});

export const attendance_records = pgTable('attendance_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  student_id: varchar('student_id'),
  date: date('date').default(sql`now()`),
  status: text('status'),
  created_at: timestamp('created_at').defaultNow(),
});

export const attendance_control = pgTable('attendance_control', {
  id: uuid('id').defaultRandom().primaryKey(),
  is_enabled: boolean('is_enabled').default(false),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const attendance_ip_strict = pgTable('attendance_ip_strict', {
  id: uuid('id').defaultRandom().primaryKey(),
  ip_address: text('ip_address'),
  is_enabled: boolean('is_enabled').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

export type SelectStudent = typeof students.$inferSelect;
export type SelectAttendance = typeof attendance_records.$inferSelect;

export type InsertStudent = typeof students.$inferInsert;
export type InsertAttendance = typeof attendance_records.$inferInsert;

export type SelectAttendanceControl = typeof attendance_control.$inferSelect;
export type InsertAttendanceControl = typeof attendance_control.$inferInsert;

export type SelectAttendanceIpStrict = typeof attendance_ip_strict.$inferSelect;
export type InsertAttendanceIpStrict = typeof attendance_ip_strict.$inferInsert;

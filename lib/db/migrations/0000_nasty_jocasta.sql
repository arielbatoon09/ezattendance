CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar,
	"date" date DEFAULT now(),
	"status" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"last_name" text,
	"first_name" text,
	"middle_initial" text,
	"section" text DEFAULT 'BSIT 1A',
	"email" text,
	"created_at" timestamp DEFAULT now()
);

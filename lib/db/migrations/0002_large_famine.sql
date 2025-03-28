CREATE TABLE "attendance_ip_strict" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);

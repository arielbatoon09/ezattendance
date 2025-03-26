CREATE TABLE "attendance_control" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);

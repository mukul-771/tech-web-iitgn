CREATE TABLE "clubs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"members" text NOT NULL,
	"established" text NOT NULL,
	"email" text NOT NULL,
	"achievements" jsonb NOT NULL,
	"projects" jsonb NOT NULL,
	"team" jsonb NOT NULL,
	"logo_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

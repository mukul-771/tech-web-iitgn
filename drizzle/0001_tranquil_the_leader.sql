CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" text NOT NULL,
	"email" text NOT NULL,
	"initials" text NOT NULL,
	"gradient_from" text NOT NULL,
	"gradient_to" text NOT NULL,
	"category" text NOT NULL,
	"photo_path" text,
	"is_secretary" boolean DEFAULT false NOT NULL,
	"is_coordinator" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_email_unique" UNIQUE("email")
);

CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" text NOT NULL,
	"location" text NOT NULL,
	"duration" text NOT NULL,
	"participants" text NOT NULL,
	"organizer" text NOT NULL,
	"category" text NOT NULL,
	"highlights" jsonb NOT NULL,
	"gallery" jsonb NOT NULL,
	"draft" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inter_iit_achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"achievement_type" text NOT NULL,
	"competition_name" text NOT NULL,
	"inter_iit_edition" text NOT NULL,
	"year" text NOT NULL,
	"host_iit" text NOT NULL,
	"location" text NOT NULL,
	"ranking" integer,
	"achievement_description" text NOT NULL,
	"significance" text NOT NULL,
	"competition_category" text NOT NULL,
	"achievement_date" text NOT NULL,
	"points" integer,
	"status" text NOT NULL,
	"team_members" jsonb NOT NULL,
	"supporting_documents" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

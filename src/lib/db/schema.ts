import { pgTable, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

// Inter-IIT Achievements Table
export const interIITAchievements = pgTable('inter_iit_achievements', {
  id: text('id').primaryKey(),
  achievementType: text('achievement_type').notNull(),
  competitionName: text('competition_name').notNull(),
  interIITEdition: text('inter_iit_edition').notNull(),
  year: text('year').notNull(),
  hostIIT: text('host_iit').notNull(),
  location: text('location').notNull(),
  ranking: integer('ranking'),
  achievementDescription: text('achievement_description').notNull(),
  significance: text('significance').notNull(),
  competitionCategory: text('competition_category').notNull(),
  achievementDate: text('achievement_date').notNull(),
  points: integer('points'),
  status: text('status').notNull(),
  teamMembers: jsonb('team_members').notNull().$type<TeamMember[]>(),
  supportingDocuments: jsonb('supporting_documents').notNull().$type<SupportingDocument[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events Table
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  location: text('location').notNull(),
  duration: text('duration').notNull(),
  participants: text('participants').notNull(),
  organizer: text('organizer').notNull(),
  category: text('category').notNull(),
  highlights: jsonb('highlights').notNull().$type<string[]>(),
  gallery: jsonb('gallery').notNull().$type<GalleryItem[]>(),
  draft: boolean('draft').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team Members Table
export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  email: text('email').notNull().unique(),
  initials: text('initials').notNull(),
  gradientFrom: text('gradient_from').notNull(),
  gradientTo: text('gradient_to').notNull(),
  category: text('category').notNull(),
  photoPath: text('photo_path'),
  isSecretary: boolean('is_secretary').default(false).notNull(),
  isCoordinator: boolean('is_coordinator').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types for TypeScript
export type TeamMember = {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: string;
  email: string;
  achievements: string[];
};

export type SupportingDocument = {
  name: string;
  type: string;
  filePath: string;
  uploadDate: string;
  description: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  caption?: string;
};

export type InterIITAchievement = typeof interIITAchievements.$inferSelect;
export type NewInterIITAchievement = typeof interIITAchievements.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type TeamMemberDB = typeof teamMembers.$inferSelect;
export type NewTeamMemberDB = typeof teamMembers.$inferInsert;

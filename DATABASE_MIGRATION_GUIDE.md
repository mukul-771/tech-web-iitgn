# 🗄️ Database Migration Guide

## Overview
This guide helps you migrate from JSON file storage to a production database for better scalability, concurrent access, and data integrity.

---

## 🎯 Recommended Database Solutions

### Option 1: Vercel Postgres (Recommended)
**Best for**: Vercel deployments, simple setup
**Pricing**: Free tier available, pay-as-you-scale

```bash
# Install Vercel Postgres
npm install @vercel/postgres
```

### Option 2: PlanetScale (MySQL)
**Best for**: Serverless MySQL, branching workflows
**Pricing**: Free tier available

```bash
# Install PlanetScale client
npm install @planetscale/database
```

### Option 3: Supabase (PostgreSQL)
**Best for**: Open-source alternative, real-time features
**Pricing**: Free tier available

```bash
# Install Supabase client
npm install @supabase/supabase-js
```

---

## 📊 Database Schema Design

### Core Tables Structure

```sql
-- Users/Admin table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clubs table
CREATE TABLE clubs (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  category VARCHAR(100),
  logo_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  social_links JSONB,
  members JSONB,
  events JSONB,
  achievements JSONB,
  gallery JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  date TIMESTAMP,
  location VARCHAR(255),
  category VARCHAR(100),
  status VARCHAR(50),
  organizer VARCHAR(255),
  registration_url TEXT,
  gallery JSONB,
  participants JSONB,
  sponsors JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hackathons table
CREATE TABLE hackathons (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  date TIMESTAMP,
  location VARCHAR(255),
  category VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  registration_url TEXT,
  prizes JSONB,
  organizers JSONB,
  requirements JSONB,
  schedule JSONB,
  sponsors JSONB,
  winners JSONB,
  gallery JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inter-IIT Events table
CREATE TABLE inter_iit_events (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  long_description TEXT,
  location VARCHAR(255),
  host_iit VARCHAR(255),
  start_date DATE,
  end_date DATE,
  participating_iits JSONB,
  events JSONB,
  overall_results JSONB,
  team_roster JSONB,
  achievements JSONB,
  highlights JSONB,
  gallery JSONB,
  documents JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inter-IIT Achievements table
CREATE TABLE inter_iit_achievements (
  id VARCHAR(50) PRIMARY KEY,
  achievement_type VARCHAR(100) NOT NULL,
  competition_name VARCHAR(255) NOT NULL,
  inter_iit_edition VARCHAR(100),
  year INTEGER NOT NULL,
  host_iit VARCHAR(255),
  location VARCHAR(255),
  achievement_description TEXT,
  significance TEXT,
  competition_category VARCHAR(100),
  achievement_date DATE,
  status VARCHAR(50),
  team_members JSONB,
  mentors JSONB,
  gallery JSONB,
  documents JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members table
CREATE TABLE team_members (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  department VARCHAR(255),
  year INTEGER,
  bio TEXT,
  image_url TEXT,
  social_links JSONB,
  achievements JSONB,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Torque Magazines table
CREATE TABLE torque_magazines (
  id VARCHAR(50) PRIMARY KEY,
  year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pages INTEGER,
  articles INTEGER,
  featured TEXT,
  file_path TEXT,
  file_name VARCHAR(255),
  file_size BIGINT,
  is_latest BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings table
CREATE TABLE site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Uploads table (for tracking uploaded files)
CREATE TABLE file_uploads (
  id SERIAL PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(255),
  entity_type VARCHAR(50), -- 'club', 'event', 'hackathon', etc.
  entity_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Migration Scripts

### Step 1: Data Export Script

Create `scripts/export-json-data.js`:

```javascript
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

async function exportData() {
  const files = [
    'clubs.json',
    'events.json',
    'hackathons.json',
    'inter-iit.json',
    'inter-iit-achievements.json',
    'team.json',
    'torque.json',
    'site-settings.json'
  ];

  const exportData = {};

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const tableName = file.replace('.json', '').replace('-', '_');
      exportData[tableName] = data;
    }
  }

  // Write export file
  fs.writeFileSync(
    path.join(process.cwd(), 'data-export.json'),
    JSON.stringify(exportData, null, 2)
  );

  console.log('✅ Data exported to data-export.json');
}

exportData().catch(console.error);
```

### Step 2: Database Import Script

Create `scripts/import-to-database.js`:

```javascript
// Example for Vercel Postgres
import { sql } from '@vercel/postgres';
import fs from 'fs';

async function importData() {
  const exportData = JSON.parse(fs.readFileSync('data-export.json', 'utf8'));

  // Import clubs
  if (exportData.clubs) {
    for (const [id, club] of Object.entries(exportData.clubs)) {
      await sql`
        INSERT INTO clubs (
          id, name, description, long_description, category,
          logo_url, banner_url, website_url, social_links,
          members, events, achievements, gallery, is_visible
        ) VALUES (
          ${id}, ${club.name}, ${club.description}, ${club.longDescription},
          ${club.category}, ${club.logoUrl}, ${club.bannerUrl}, ${club.websiteUrl},
          ${JSON.stringify(club.socialLinks)}, ${JSON.stringify(club.members)},
          ${JSON.stringify(club.events)}, ${JSON.stringify(club.achievements)},
          ${JSON.stringify(club.gallery)}, ${club.isVisible ?? true}
        )
      `;
    }
  }

  // Import events
  if (exportData.events) {
    for (const [id, event] of Object.entries(exportData.events)) {
      await sql`
        INSERT INTO events (
          id, title, description, long_description, date,
          location, category, status, organizer, registration_url,
          gallery, participants, sponsors, is_visible
        ) VALUES (
          ${id}, ${event.title}, ${event.description}, ${event.longDescription},
          ${event.date}, ${event.location}, ${event.category}, ${event.status},
          ${event.organizer}, ${event.registrationUrl}, ${JSON.stringify(event.gallery)},
          ${JSON.stringify(event.participants)}, ${JSON.stringify(event.sponsors)},
          ${event.isVisible ?? true}
        )
      `;
    }
  }

  // Continue for other tables...
  console.log('✅ Data imported to database');
}

importData().catch(console.error);
```

---

## 🔧 Code Migration

### Step 1: Database Connection Setup

Create `src/lib/database.ts`:

```typescript
// For Vercel Postgres
import { sql } from '@vercel/postgres';

export { sql };

// For PlanetScale
// import { connect } from '@planetscale/database';
// export const db = connect({
//   host: process.env.DATABASE_HOST,
//   username: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
// });

// For Supabase
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_ANON_KEY!
// );
```

### Step 2: Update Storage Functions

Replace file-based storage with database operations:

```typescript
// Example: src/lib/clubs-database.ts
import { sql } from './database';
import { Club } from './clubs-data';

export async function getAllClubs(): Promise<Record<string, Club>> {
  const { rows } = await sql`SELECT * FROM clubs WHERE is_visible = true`;
  
  const clubs: Record<string, Club> = {};
  for (const row of rows) {
    clubs[row.id] = {
      id: row.id,
      name: row.name,
      description: row.description,
      longDescription: row.long_description,
      category: row.category,
      logoUrl: row.logo_url,
      bannerUrl: row.banner_url,
      websiteUrl: row.website_url,
      socialLinks: row.social_links,
      members: row.members,
      events: row.events,
      achievements: row.achievements,
      gallery: row.gallery,
      isVisible: row.is_visible,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  
  return clubs;
}

export async function createClub(clubData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<Club> {
  const id = generateClubId(clubData.name);
  
  const { rows } = await sql`
    INSERT INTO clubs (
      id, name, description, long_description, category,
      logo_url, banner_url, website_url, social_links,
      members, events, achievements, gallery, is_visible
    ) VALUES (
      ${id}, ${clubData.name}, ${clubData.description}, ${clubData.longDescription},
      ${clubData.category}, ${clubData.logoUrl}, ${clubData.bannerUrl}, ${clubData.websiteUrl},
      ${JSON.stringify(clubData.socialLinks)}, ${JSON.stringify(clubData.members)},
      ${JSON.stringify(clubData.events)}, ${JSON.stringify(clubData.achievements)},
      ${JSON.stringify(clubData.gallery)}, ${clubData.isVisible ?? true}
    )
    RETURNING *
  `;
  
  return transformRowToClub(rows[0]);
}

// Add more CRUD operations...
```

---

## 🚀 Migration Process

### Phase 1: Preparation
1. **Backup current data**: Export all JSON files
2. **Set up database**: Choose provider and create instance
3. **Create schema**: Run table creation scripts
4. **Test connection**: Verify database connectivity

### Phase 2: Parallel Implementation
1. **Create database functions**: Implement alongside existing file functions
2. **Feature flag**: Use environment variable to switch between storage methods
3. **Test thoroughly**: Ensure data consistency

### Phase 3: Migration
1. **Import data**: Run migration scripts
2. **Switch storage**: Update environment variable
3. **Monitor**: Watch for errors and performance issues
4. **Cleanup**: Remove old file-based functions

### Phase 4: Optimization
1. **Add indexes**: Optimize query performance
2. **Connection pooling**: Implement for better performance
3. **Caching**: Add Redis or similar for frequently accessed data

---

## 📈 Benefits After Migration

- ✅ **Concurrent access**: Multiple admin users can edit simultaneously
- ✅ **Data integrity**: ACID transactions prevent corruption
- ✅ **Scalability**: Handle thousands of records efficiently
- ✅ **Backup & recovery**: Automated database backups
- ✅ **Query capabilities**: Complex searches and filtering
- ✅ **Real-time updates**: WebSocket support for live updates

---

## 🔍 Monitoring & Maintenance

### Database Monitoring
- **Query performance**: Monitor slow queries
- **Connection usage**: Track connection pool utilization
- **Storage usage**: Monitor database size growth
- **Error rates**: Track failed queries and connections

### Backup Strategy
- **Automated backups**: Daily full backups
- **Point-in-time recovery**: For critical data recovery
- **Cross-region replication**: For disaster recovery

---

**Note**: This migration is optional. Your current JSON file storage works well for small to medium-scale applications. Consider migrating when you need better scalability, concurrent access, or advanced querying capabilities.

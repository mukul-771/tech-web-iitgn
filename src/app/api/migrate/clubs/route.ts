import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clubs, type ClubTeamMember } from "@/lib/db/schema";
import { readFileSync } from 'fs';
import { join } from 'path';

interface ClubData {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  type: string;
  category: string;
  members: string;
  established: string;
  email: string;
  achievements?: string[];
  projects?: string[];
  team?: ClubTeamMember[];
  logoPath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function POST() {
  try {
    console.log('🚀 Starting clubs migration from JSON to Neon...');
    
    // Read clubs data from local file
    const clubsFilePath = join(process.cwd(), 'data', 'clubs.json');
    const clubsData = JSON.parse(readFileSync(clubsFilePath, 'utf-8'));
    const clubsList = Object.values(clubsData);
    
    console.log(`📁 Found ${clubsList.length} clubs to migrate`);
    
    // Check current database state
    let existingClubs;
    try {
      existingClubs = await db.select().from(clubs);
      console.log(`📊 Current database has ${existingClubs.length} clubs`);
    } catch (error) {
      console.log('📊 Database table may not exist yet');
      existingClubs = [];
    }
    
    // Clear existing data if any
    if (existingClubs.length > 0) {
      console.log('⚠️  Clearing existing clubs...');
      await db.delete(clubs);
      console.log('✅ Existing clubs cleared');
    }
    
    // Prepare clubs for insertion
    const clubsToInsert = (clubsList as ClubData[]).map(club => ({
      id: club.id,
      name: club.name,
      description: club.description,
      longDescription: club.longDescription,
      type: club.type,
      category: club.category,
      members: club.members,
      established: club.established,
      email: club.email,
      achievements: club.achievements || [],
      projects: club.projects || [],
      team: club.team || [],
      logoPath: club.logoPath || null,
      createdAt: new Date(club.createdAt || '2023-01-01T00:00:00Z'),
      updatedAt: new Date(club.updatedAt || new Date()),
    }));
    
    console.log(`🔄 Prepared ${clubsToInsert.length} clubs for insertion`);
    
    // Insert clubs
    let insertedCount = 0;
    const errors = [];
    
    for (const club of clubsToInsert) {
      try {
        await db.insert(clubs).values(club);
        console.log(`   ✅ Inserted: ${club.name} (${club.type})`);
        insertedCount++;
      } catch (error: any) {
        console.log(`   ❌ Failed to insert ${club.name}: ${error.message}`);
        errors.push({ club: club.name, error: error.message });
      }
    }
    
    // Verify migration
    const finalClubs = await db.select().from(clubs);
    console.log(`🔍 Verification: ${finalClubs.length} total clubs in database`);
    
    // Type breakdown
    const typeBreakdown: Record<string, number> = {};
    finalClubs.forEach(club => {
      typeBreakdown[club.type] = (typeBreakdown[club.type] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      message: "Clubs migration completed successfully!",
      summary: {
        totalFromJSON: clubsList.length,
        inserted: insertedCount,
        totalInDatabase: finalClubs.length,
        typeBreakdown,
        errors: errors.length > 0 ? errors : null
      }
    });
    
  } catch (error: any) {
    console.error('💥 Migration failed:', error);
    return NextResponse.json({
      success: false,
      message: "Migration failed",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

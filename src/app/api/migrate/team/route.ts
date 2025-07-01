import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
  try {
    console.log('🚀 Starting team migration from JSON to Neon...');
    
    // Read team data from local file
    const teamFilePath = join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(readFileSync(teamFilePath, 'utf-8'));
    const members = Object.values(teamData);
    
    console.log(`📁 Found ${members.length} team members to migrate`);
    
    // Check current database state
    let existingMembers;
    try {
      existingMembers = await db.select().from(teamMembers);
      console.log(`📊 Current database has ${existingMembers.length} team members`);
    } catch (error) {
      console.log('📊 Database table may not exist yet');
      existingMembers = [];
    }
    
    // Clear existing data if any
    if (existingMembers.length > 0) {
      console.log('⚠️  Clearing existing team members...');
      await db.delete(teamMembers);
      console.log('✅ Existing team members cleared');
    }
    
    // Prepare team members for insertion
    const membersToInsert = members.map((member: any) => ({
      id: member.id,
      name: member.name,
      position: member.position,
      email: member.email,
      initials: member.initials,
      gradientFrom: member.gradientFrom,
      gradientTo: member.gradientTo,
      category: member.category,
      photoPath: member.photoPath || null,
      isSecretary: member.isSecretary || false,
      isCoordinator: member.isCoordinator || false,
    }));
    
    console.log(`🔄 Prepared ${membersToInsert.length} members for insertion`);
    
    // Insert team members
    let insertedCount = 0;
    const errors = [];
    
    for (const member of membersToInsert) {
      try {
        await db.insert(teamMembers).values(member);
        console.log(`   ✅ Inserted: ${member.name} (${member.category})`);
        insertedCount++;
      } catch (error: any) {
        console.log(`   ❌ Failed to insert ${member.name}: ${error.message}`);
        errors.push({ member: member.name, error: error.message });
      }
    }
    
    // Verify migration
    const finalMembers = await db.select().from(teamMembers);
    console.log(`🔍 Verification: ${finalMembers.length} total members in database`);
    
    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    finalMembers.forEach(member => {
      categoryBreakdown[member.category] = (categoryBreakdown[member.category] || 0) + 1;
    });
    
    // Leadership breakdown
    const secretaries = finalMembers.filter(m => m.isSecretary);
    const coordinators = finalMembers.filter(m => m.isCoordinator);
    
    return NextResponse.json({
      success: true,
      message: "Team migration completed successfully!",
      summary: {
        totalFromJSON: members.length,
        inserted: insertedCount,
        totalInDatabase: finalMembers.length,
        categoryBreakdown,
        leadership: {
          secretaries: secretaries.length,
          coordinators: coordinators.length,
          secretaryNames: secretaries.map(s => s.name),
          coordinatorNames: coordinators.map(c => c.name)
        },
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

#!/usr/bin/env node

/**
 * Execute Team Migration SQL
 * This script executes the team migration directly to Neon database
 */

import { db } from '../src/lib/db/index.js';
import { teamMembers } from '../src/lib/db/schema.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function executeTeamMigration() {
  try {
    console.log('🚀 Executing Team Migration to Neon Database\n');
    
    // Read team data from local file
    const teamFilePath = join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(readFileSync(teamFilePath, 'utf-8'));
    const members = Object.values(teamData);
    
    console.log(`📁 Found ${members.length} team members to migrate`);
    
    // Check current database state
    try {
      const existingMembers = await db.select().from(teamMembers);
      console.log(`📊 Current database has ${existingMembers.length} team members`);
      
      if (existingMembers.length > 0) {
        console.log('⚠️  Database already contains team members. Clearing first...');
        await db.delete(teamMembers);
        console.log('✅ Existing team members cleared');
      }
    } catch (error) {
      console.log('📊 Database appears empty or table doesn\'t exist yet');
    }
    
    // Prepare team members for insertion
    console.log('\n🔄 Preparing team members for insertion...');
    const membersToInsert = members.map(member => ({
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
    
    console.log(`✅ Prepared ${membersToInsert.length} members for insertion`);
    
    // Insert team members in batches
    console.log('\n💾 Inserting team members into database...');
    let insertedCount = 0;
    
    for (const member of membersToInsert) {
      try {
        await db.insert(teamMembers).values(member);
        console.log(`   ✅ Inserted: ${member.name} (${member.category})`);
        insertedCount++;
      } catch (error) {
        console.log(`   ❌ Failed to insert ${member.name}: ${error.message}`);
      }
    }
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const finalMembers = await db.select().from(teamMembers);
    console.log(`   Total members in database: ${finalMembers.length}`);
    
    // Show breakdown by category
    const categoryBreakdown = {};
    finalMembers.forEach(member => {
      categoryBreakdown[member.category] = (categoryBreakdown[member.category] || 0) + 1;
    });
    
    console.log('\n📊 Members by category:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
    // Show leadership
    const secretaries = finalMembers.filter(m => m.isSecretary);
    const coordinators = finalMembers.filter(m => m.isCoordinator);
    
    console.log('\n👥 Leadership roles:');
    console.log(`   Secretaries: ${secretaries.length}`);
    secretaries.forEach(s => console.log(`     - ${s.name} (${s.position})`));
    console.log(`   Coordinators: ${coordinators.length}`);
    coordinators.forEach(c => console.log(`     - ${c.name} (${c.position})`));
    
    console.log('\n🎉 Team migration completed successfully!');
    console.log(`✅ Migrated ${insertedCount}/${members.length} team members`);
    console.log('\n📝 Next steps:');
    console.log('1. Update team components to use database instead of blob storage');
    console.log('2. Test the team page');
    console.log('3. Update API endpoints to use database functions');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

console.log('🔧 Team Migration Executor');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

executeTeamMigration();

#!/usr/bin/env node

/**
 * Team Migration Script: Blob Storage → Neon Database
 * This script migrates team data from Vercel blob storage to Neon PostgreSQL database
 */

import { migrateTeamToDatabase } from '../src/lib/db/migrate-data.mjs';

async function runTeamMigration() {
  try {
    console.log('🚀 Starting Team Data Migration: Blob → Neon Database\n');
    
    console.log('📊 Current Storage Status:');
    console.log('  Source: Vercel Blob Storage (team.json)');
    console.log('  Target: Neon PostgreSQL Database (team_members table)');
    console.log('  Migration: All team member data including photos, roles, categories\n');
    
    // Run the migration
    const result = await migrateTeamToDatabase();
    
    console.log('\n✅ Migration Completed Successfully!');
    console.log(`📈 Statistics:`);
    console.log(`   Migrated: ${result.migratedCount} team members`);
    console.log(`   Success: ${result.success ? 'Yes' : 'No'}`);
    
    if (result.members && result.members.length > 0) {
      console.log('\n👥 Migrated Team Members:');
      result.members.forEach(member => {
        console.log(`   • ${member.name} (${member.position}) - ${member.category}`);
      });
    }
    
    console.log('\n🎉 Team data successfully migrated to Neon database!');
    console.log('💡 Next steps:');
    console.log('   1. Update production environment to use DATABASE_URL');
    console.log('   2. Deploy the new unified team storage layer');
    console.log('   3. Verify team pages work correctly');
    console.log('   4. Consider archiving blob storage data');
    
  } catch (error) {
    console.error('\n❌ Migration Failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check DATABASE_URL environment variable');
    console.log('   2. Verify Neon database is accessible');
    console.log('   3. Ensure team_members table exists');
    console.log('   4. Check blob storage accessibility');
    process.exit(1);
  }
}

runTeamMigration();

#!/usr/bin/env node

// Migration script to transfer data from blob storage to database
// Run this with: node scripts/migrate-to-database.mjs

import { runMigration } from '../src/lib/db/migrate-data.ts';

async function main() {
  try {
    console.log('🚀 Starting migration from blob storage to database...\n');
    
    const result = await runMigration();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Results:');
    console.log(`📝 Achievements: ${result.achievements.migrated} migrated, ${result.achievements.skipped} skipped (${result.achievements.total} total)`);
    console.log(`🎉 Events: ${result.events.migrated} migrated, ${result.events.skipped} skipped (${result.events.total} total)`);
    
    console.log('\n🎯 Your data has been successfully transferred to the PostgreSQL database!');
    console.log('🔄 All future operations will now use the database for real-time updates.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL is set in .env.local');
    console.error('2. Database connection is working');
    console.error('3. Tables have been created (npm run db:push)');
    process.exit(1);
  }
}

main();

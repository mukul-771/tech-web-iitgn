#!/usr/bin/env node

import postgres from 'postgres';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Neon database connection...');
    
    // Check for DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL environment variable not found');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL found');
    console.log('🔗 URL format:', databaseUrl.substring(0, 30) + '...');
    
    // Test connection
    const sql = postgres(databaseUrl);
    
    // Simple query
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Database connection successful');
    console.log('📅 Current time:', result[0].current_time);
    console.log('🗄️  Database version:', result[0].db_version.substring(0, 50) + '...');
    
    // Test team table
    const teamCount = await sql`SELECT COUNT(*) as count FROM team_members`;
    console.log('👥 Team members in database:', teamCount[0].count);
    
    // Test clubs table
    const clubsCount = await sql`SELECT COUNT(*) as count FROM clubs`;
    console.log('🏛️  Clubs in database:', clubsCount[0].count);
    
    await sql.end();
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('connect')) {
      console.log('🔧 Possible solutions:');
      console.log('   1. Check DATABASE_URL is correct');
      console.log('   2. Verify Neon database is running');
      console.log('   3. Check network connectivity');
    }
    process.exit(1);
  }
}

testDatabaseConnection();

#!/usr/bin/env node

/**
 * Complete API Testing Script for technical-council.iitgn.tech
 * Tests all major APIs after migration to Neon database
 */

async function testAllAPIs() {
  const domain = 'https://technical-council.iitgn.tech';
  
  console.log('🔍 COMPREHENSIVE API TESTING');
  console.log('==============================');
  console.log(`🌐 Domain: ${domain}\n`);

  let allTestsPassed = true;
  const results = [];

  // Test 1: Team API
  try {
    console.log('1️⃣ Testing Team APIs...');
    
    // Main team API
    const teamResponse = await fetch(`${domain}/api/team`);
    const teamData = await teamResponse.json();
    const teamType = Array.isArray(teamData) ? 'array' : 'object';
    
    results.push({
      api: 'Team API',
      status: teamResponse.ok ? 'PASS' : 'FAIL',
      format: teamType,
      count: teamType === 'array' ? teamData.length : Object.keys(teamData).length,
      note: teamType === 'array' ? 'Using Neon database ✅' : 'Still using blob storage ⚠️'
    });
    
    // Leadership API
    const leadershipResponse = await fetch(`${domain}/api/team/leadership`);
    const leadershipData = await leadershipResponse.json();
    
    results.push({
      api: 'Leadership API',
      status: leadershipResponse.ok ? 'PASS' : 'FAIL',
      format: Array.isArray(leadershipData) ? 'array' : 'object',
      count: Array.isArray(leadershipData) ? leadershipData.length : 'unknown'
    });
    
  } catch (error) {
    console.log(`   ❌ Team API error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Clubs API
  try {
    console.log('\n2️⃣ Testing Clubs APIs...');
    
    // Main clubs API
    const clubsResponse = await fetch(`${domain}/api/clubs`);
    const clubsData = await clubsResponse.json();
    const clubsType = Array.isArray(clubsData) ? 'array' : 'object';
    
    results.push({
      api: 'Clubs API',
      status: clubsResponse.ok ? 'PASS' : 'FAIL',
      format: clubsType,
      count: clubsType === 'array' ? clubsData.length : Object.keys(clubsData).length,
      note: clubsType === 'array' ? 'Using Neon database ✅' : 'Still using blob storage ⚠️'
    });
    
    // Test individual club
    if (clubsType === 'array' && clubsData.length > 0) {
      const firstClub = clubsData[0];
      const clubResponse = await fetch(`${domain}/api/clubs/${firstClub.id}`);
      
      results.push({
        api: `Individual Club (${firstClub.id})`,
        status: clubResponse.ok ? 'PASS' : 'FAIL',
        format: 'object',
        count: 1
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Clubs API error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Other APIs
  try {
    console.log('\n3️⃣ Testing Other APIs...');
    
    // Events API (if exists)
    const eventsResponse = await fetch(`${domain}/api/events`);
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      results.push({
        api: 'Events API',
        status: 'PASS',
        format: Array.isArray(eventsData) ? 'array' : 'object',
        count: Array.isArray(eventsData) ? eventsData.length : Object.keys(eventsData).length
      });
    }
    
    // Inter-IIT API (if exists)
    const interIITResponse = await fetch(`${domain}/api/inter-iit`);
    if (interIITResponse.ok) {
      const interIITData = await interIITResponse.json();
      results.push({
        api: 'Inter-IIT API',
        status: 'PASS',
        format: Array.isArray(interIITData) ? 'array' : 'object',
        count: Array.isArray(interIITData) ? interIITData.length : Object.keys(interIITData).length
      });
    }
    
  } catch (error) {
    console.log(`   ⚠️ Other APIs test: ${error.message}`);
  }

  // Test 4: Migration APIs
  try {
    console.log('\n4️⃣ Testing Migration APIs...');
    
    // Team migration status
    const teamMigrationResponse = await fetch(`${domain}/api/migrate/team`, { method: 'POST' });
    if (teamMigrationResponse.ok) {
      const migrationData = await teamMigrationResponse.json();
      results.push({
        api: 'Team Migration',
        status: migrationData.success ? 'AVAILABLE' : 'ERROR',
        format: 'json',
        count: migrationData.summary?.totalInDatabase || 'unknown'
      });
    }
    
    // Clubs migration status
    const clubsMigrationResponse = await fetch(`${domain}/api/migrate/clubs`, { method: 'POST' });
    if (clubsMigrationResponse.ok) {
      const clubsMigrationData = await clubsMigrationResponse.json();
      results.push({
        api: 'Clubs Migration',
        status: clubsMigrationData.success ? 'AVAILABLE' : 'ERROR',
        format: 'json',
        count: clubsMigrationData.summary?.totalInDatabase || 'unknown'
      });
    }
    
  } catch (error) {
    console.log(`   ⚠️ Migration APIs: ${error.message}`);
  }

  // Display Results
  console.log('\n📊 API TEST RESULTS');
  console.log('===================');
  console.table(results);

  // Summary
  console.log('\n🏁 MIGRATION STATUS SUMMARY');
  console.log('============================');
  
  const teamAPI = results.find(r => r.api === 'Team API');
  const clubsAPI = results.find(r => r.api === 'Clubs API');
  
  if (teamAPI) {
    if (teamAPI.format === 'array') {
      console.log('✅ TEAMS: Fully migrated to Neon database');
      console.log(`   📊 ${teamAPI.count} team members served from database`);
    } else {
      console.log('⚠️  TEAMS: Still using blob storage (needs DATABASE_URL in Vercel)');
      console.log(`   📊 ${teamAPI.count} team members from blob storage`);
    }
  }
  
  if (clubsAPI) {
    if (clubsAPI.format === 'array') {
      console.log('✅ CLUBS: Fully migrated to Neon database');
      console.log(`   📊 ${clubsAPI.count} clubs served from database`);
    } else {
      console.log('⚠️  CLUBS: Still using blob storage');
      console.log(`   📊 ${clubsAPI.count} clubs from blob storage`);
    }
  }

  console.log('\n🔗 Website: https://technical-council.iitgn.tech');
  console.log('🔗 Vercel: https://vercel.com/technical-secretary-s-projects/tech-web-iitgn');
  
  if (teamAPI?.format === 'object') {
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('   • Add DATABASE_URL to Vercel environment variables');
    console.log('   • Redeploy the latest version from GitHub');
    console.log('   • Run team migration API after deployment');
  }
}

testAllAPIs().catch(console.error);

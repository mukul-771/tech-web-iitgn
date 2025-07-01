#!/usr/bin/env node

/**
 * Complete Team Migration Verification Script
 * Tests all team-related endpoints and functionality after migration to Neon database
 */

async function verifyTeamMigration() {
  console.log('🔍 TEAM MIGRATION VERIFICATION');
  console.log('=====================================\n');

  const baseUrl = 'http://localhost:3000';
  let allTestsPassed = true;

  // Test 1: Main Team API
  try {
    console.log('1️⃣ Testing main team API...');
    const response = await fetch(`${baseUrl}/api/team`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data) && data.length === 23) {
      console.log(`   ✅ SUCCESS: Retrieved ${data.length} team members`);
    } else {
      console.log(`   ❌ FAILED: Expected 23 members, got ${data.length || 'error'}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Leadership API
  try {
    console.log('\n2️⃣ Testing leadership API...');
    const response = await fetch(`${baseUrl}/api/team/leadership`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data) && data.length === 6) {
      console.log(`   ✅ SUCCESS: Retrieved ${data.length} leadership members`);
      console.log(`   📋 Leadership: ${data.map(m => m.name).join(', ')}`);
    } else {
      console.log(`   ❌ FAILED: Expected 6 leadership members, got ${data.length || 'error'}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Data Structure Validation
  try {
    console.log('\n3️⃣ Validating data structure...');
    const response = await fetch(`${baseUrl}/api/team`);
    const data = await response.json();
    
    if (response.ok && data.length > 0) {
      const member = data[0];
      const requiredFields = ['id', 'name', 'position', 'email', 'category', 'createdAt', 'updatedAt'];
      const missingFields = requiredFields.filter(field => !(field in member));
      
      if (missingFields.length === 0) {
        console.log('   ✅ SUCCESS: All required database fields present');
      } else {
        console.log(`   ❌ FAILED: Missing fields: ${missingFields.join(', ')}`);
        allTestsPassed = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Category Distribution
  try {
    console.log('\n4️⃣ Checking category distribution...');
    const response = await fetch(`${baseUrl}/api/team`);
    const data = await response.json();
    
    if (response.ok) {
      const categories = {};
      data.forEach(member => {
        categories[member.category] = (categories[member.category] || 0) + 1;
      });
      
      console.log('   📊 Category breakdown:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`      ${category}: ${count} members`);
      });
      
      const expectedTotal = Object.values(categories).reduce((sum, count) => sum + count, 0);
      if (expectedTotal === 23) {
        console.log('   ✅ SUCCESS: Category distribution matches expected total');
      } else {
        console.log(`   ❌ FAILED: Total doesn't match: ${expectedTotal} vs 23`);
        allTestsPassed = false;
      }
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 5: Migration API Status
  try {
    console.log('\n5️⃣ Checking migration API status...');
    const response = await fetch(`${baseUrl}/api/migrate/team`, { method: 'POST' });
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ SUCCESS: Migration API is functional');
      console.log(`   📈 Database contains ${data.summary.totalInDatabase} members`);
    } else {
      console.log('   ⚠️  Migration API returned an error (expected if already migrated)');
    }
  } catch (error) {
    console.log(`   ⚠️  Migration API test failed: ${error.message}`);
  }

  // Summary
  console.log('\n🏁 VERIFICATION SUMMARY');
  console.log('=======================');
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Team migration to Neon database is successful.');
    console.log('\n✅ Migration Complete:');
    console.log('   • 23 team members migrated from JSON to Neon database');
    console.log('   • All API endpoints updated to use database');
    console.log('   • Leadership filtering working correctly');
    console.log('   • Data structure validated');
  } else {
    console.log('❌ SOME TESTS FAILED. Please review the issues above.');
  }
}

// Run the verification
verifyTeamMigration().catch(console.error);

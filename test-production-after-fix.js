#!/usr/bin/env node

const API_BASE = 'https://technical-council.iitgn.tech/api';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   URL: ${API_BASE}${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
    
    console.log(`   ✅ Status: ${response.status}`);
    
    // Check if data is array (Neon format) vs object (blob format)
    if (Array.isArray(data)) {
      console.log(`   ✅ Format: Array (Neon database) - ${data.length} items`);
      if (data.length > 0) {
        console.log(`   ✅ Sample item has id: ${data[0].id ? 'Yes' : 'No'}`);
      }
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      console.log(`   ⚠️  Format: Object (possibly blob storage) - ${keys.length} keys`);
      if (keys.length > 0) {
        console.log(`   Keys: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
      }
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Production APIs After Build Fix...\n');
  
  const tests = [
    ['/team', 'Team API'],
    ['/team/leadership', 'Team Leadership API'],
    ['/clubs', 'Clubs API'],
    ['/clubs/programming-club', 'Individual Club API'],
    ['/migrate/team', 'Team Migration Endpoint'],
    ['/migrate/clubs', 'Clubs Migration Endpoint'],
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [endpoint, description] of tests) {
    const success = await testAPI(endpoint, description);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All APIs are working! Migration appears complete.');
    console.log('\n📋 Next steps:');
    console.log('   1. Run team migration if needed: curl -X POST https://technical-council.iitgn.tech/api/migrate/team');
    console.log('   2. Verify admin features work correctly');
    console.log('   3. All APIs should now be using Neon database');
  } else {
    console.log('\n⚠️  Some APIs failed. Check logs above for details.');
  }
}

runTests().catch(console.error);

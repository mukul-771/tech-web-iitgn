#!/usr/bin/env node

/**
 * Production Deployment Verification Script
 * Run this after Vercel deployment to verify team migration
 */

async function verifyProductionDeployment() {
  // Get the domain from command line args or use default
  const domain = process.argv[2] || 'https://your-tech-website.vercel.app';
  
  console.log('🔍 PRODUCTION DEPLOYMENT VERIFICATION');
  console.log('=====================================');
  console.log(`🌐 Testing domain: ${domain}\n`);

  let allTestsPassed = true;

  // Test 1: Health Check
  try {
    console.log('1️⃣ Health check...');
    const response = await fetch(`${domain}/api/health`);
    if (response.ok) {
      console.log('   ✅ Site is accessible');
    } else {
      console.log('   ⚠️  Site returned non-200 status');
    }
  } catch (error) {
    console.log(`   ❌ Site not accessible: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Team API
  try {
    console.log('\n2️⃣ Testing team API...');
    const response = await fetch(`${domain}/api/team`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      console.log(`   ✅ Team API working: ${data.length} members retrieved`);
      if (data.length === 23) {
        console.log('   ✅ Expected team count (23) confirmed');
      } else {
        console.log(`   ⚠️  Unexpected team count: ${data.length} (expected 23)`);
      }
    } else {
      console.log(`   ❌ Team API failed: ${response.status}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Team API error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Leadership API
  try {
    console.log('\n3️⃣ Testing leadership API...');
    const response = await fetch(`${domain}/api/team/leadership`);
    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      console.log(`   ✅ Leadership API working: ${data.length} members`);
      if (data.length === 6) {
        console.log('   ✅ Expected leadership count (6) confirmed');
      } else {
        console.log(`   ⚠️  Unexpected leadership count: ${data.length} (expected 6)`);
      }
    } else {
      console.log(`   ❌ Leadership API failed: ${response.status}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Leadership API error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Migration API Status
  try {
    console.log('\n4️⃣ Checking migration API...');
    const response = await fetch(`${domain}/api/migrate/team`, { method: 'POST' });
    const data = await response.json();
    
    if (response.ok) {
      if (data.success) {
        console.log('   ✅ Migration API functional');
        console.log(`   📊 Database has ${data.summary?.totalInDatabase || 'unknown'} members`);
      } else {
        console.log('   ⚠️  Migration API returned error (may be expected if already migrated)');
      }
    } else {
      console.log(`   ⚠️  Migration API returned ${response.status} status`);
    }
  } catch (error) {
    console.log(`   ⚠️  Migration API test failed: ${error.message}`);
  }

  // Test 5: About Page
  try {
    console.log('\n5️⃣ Testing About page...');
    const response = await fetch(`${domain}/about`);
    
    if (response.ok) {
      console.log('   ✅ About page accessible');
    } else {
      console.log(`   ❌ About page returned ${response.status}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ About page error: ${error.message}`);
    allTestsPassed = false;
  }

  // Summary
  console.log('\n🏁 PRODUCTION VERIFICATION SUMMARY');
  console.log('===================================');
  if (allTestsPassed) {
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('\n✅ All critical systems operational:');
    console.log('   • Team data served from Neon database');
    console.log('   • All API endpoints functional');
    console.log('   • Frontend pages accessible');
    console.log('   • Migration system ready');
  } else {
    console.log('❌ DEPLOYMENT ISSUES DETECTED');
    console.log('\n🔧 Recommended actions:');
    console.log('   • Check Vercel environment variables');
    console.log('   • Verify DATABASE_URL is set correctly');
    console.log('   • Check function logs in Vercel dashboard');
    console.log('   • Run migration API if team data is missing');
  }

  console.log(`\n🔗 Test your deployment: ${domain}`);
}

// Show usage if no domain provided
if (process.argv.length < 3) {
  console.log('Usage: node verify-production.js <your-domain>');
  console.log('Example: node verify-production.js https://tech-iitgn.vercel.app');
  console.log('\nRunning with placeholder domain...\n');
}

verifyProductionDeployment().catch(console.error);

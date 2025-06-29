#!/usr/bin/env node

/**
 * Test Admin Email Loading
 * This script tests if the admin email loading function works correctly
 */

async function testAdminEmailLoading() {
  try {
    console.log('🔍 Testing admin email loading from blob storage...');
    
    // Directly fetch from blob storage like the production code does
    const response = await fetch('https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/admin-emails.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const adminEmailsData = await response.json();
    
    console.log(`📧 Loaded ${adminEmailsData.emails.length} admin emails:`);
    adminEmailsData.emails.forEach(email => console.log(`  - ${email}`));
    
    console.log(`\n📅 Last modified: ${adminEmailsData.lastModified}`);
    console.log(`👤 Modified by: ${adminEmailsData.modifiedBy}`);
    
    if (adminEmailsData.emails.length >= 16) {
      console.log('\n✅ All admin emails loaded successfully from blob storage!');
      console.log('🚀 Production authentication should now work for all these users.');
    } else {
      console.log('\n⚠️  Fewer admin emails than expected.');
    }
    
  } catch (error) {
    console.error('❌ Failed to load admin emails:', error);
    process.exit(1);
  }
}

// Run the test
testAdminEmailLoading();

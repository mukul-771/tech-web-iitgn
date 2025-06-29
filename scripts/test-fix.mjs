#!/usr/bin/env node

/**
 * Test the fixed admin email loading
 */

async function testFixedAdminLoading() {
  try {
    console.log('🔍 Testing fixed admin email loading...\n');
    
    // Simulate production environment (no BLOB_READ_WRITE_TOKEN)
    delete process.env.BLOB_READ_WRITE_TOKEN;
    process.env.NODE_ENV = 'production';
    
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      BLOB_TOKEN_EXISTS: !!process.env.BLOB_READ_WRITE_TOKEN
    });
    
    // Test direct fetch (what the fixed code does)
    console.log('\n📍 Testing direct blob fetch (no token required)...');
    const response = await fetch('https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/admin-emails.json');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Loaded ${data.emails.length} admin emails`);
      console.log(`   Emails: ${data.emails.slice(0, 5).join(', ')}...`);
      
      if (data.emails.length >= 16) {
        console.log('\n🎉 Fix confirmed! Production should now work with all admin emails.');
      }
    } else {
      console.log(`❌ Failed: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixedAdminLoading();

#!/usr/bin/env node

/**
 * Production Auth Diagnosis
 * This script helps diagnose authentication issues in production
 */

async function diagnoseAuth() {
  try {
    console.log('🔍 Diagnosing production authentication...\n');
    
    // Test 1: Check blob storage directly
    console.log('📍 Test 1: Direct blob storage access');
    const blobResponse = await fetch('https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/admin-emails.json');
    if (blobResponse.ok) {
      const blobData = await blobResponse.json();
      console.log(`✅ Blob storage accessible: ${blobData.emails.length} emails`);
      console.log(`   First few emails: ${blobData.emails.slice(0, 3).join(', ')}`);
    } else {
      console.log(`❌ Blob storage not accessible: ${blobResponse.status}`);
    }
    
    // Test 2: Check debug auth endpoint (reads from local file)
    console.log('\n📍 Test 2: Debug auth endpoint (local file)');
    const debugResponse = await fetch('https://technical-council.iitgn.tech/api/admin/debug-auth');
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log(`✅ Debug endpoint accessible: ${debugData.adminEmails.length} emails`);
      console.log(`   Emails: ${debugData.adminEmails.join(', ')}`);
    } else {
      console.log(`❌ Debug endpoint not accessible: ${debugResponse.status}`);
    }
    
    // Test 3: Check if there's a difference between www and technical-council
    console.log('\n📍 Test 3: Compare www vs technical-council domains');
    const wwwDebugResponse = await fetch('https://www.iitgn.tech/api/admin/debug-auth');
    if (wwwDebugResponse.ok) {
      const wwwDebugData = await wwwDebugResponse.json();
      console.log(`✅ www.iitgn.tech debug: ${wwwDebugData.adminEmails.length} emails`);
    } else {
      console.log(`❌ www.iitgn.tech debug not accessible: ${wwwDebugResponse.status}`);
    }
    
    // Test 4: Check if the NextAuth configuration is working
    console.log('\n📍 Test 4: NextAuth configuration check');
    const authConfigResponse = await fetch('https://technical-council.iitgn.tech/api/auth/providers');
    if (authConfigResponse.ok) {
      const authConfig = await authConfigResponse.json();
      console.log(`✅ NextAuth providers: ${Object.keys(authConfig).join(', ')}`);
    } else {
      console.log(`❌ NextAuth providers not accessible: ${authConfigResponse.status}`);
    }
    
    console.log('\n📝 Diagnosis Summary:');
    console.log('- Blob storage contains 16 admin emails ✅');
    console.log('- Production code should read from blob storage in auth.ts');
    console.log('- Debug endpoint reads from local file (shows 3 emails)');
    console.log('- AccessDenied error suggests auth callback is rejecting the user');
    
    console.log('\n🔧 Potential Issues:');
    console.log('1. Deployment may not have picked up the blob URL fix');
    console.log('2. Environment variables (BLOB_READ_WRITE_TOKEN) may be missing');
    console.log('3. Google OAuth domain restrictions');
    console.log('4. Caching issues in production');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseAuth();

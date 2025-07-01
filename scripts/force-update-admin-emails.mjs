#!/usr/bin/env node

/**
 * Create a simple admin email updater
 * This bypasses the authentication and directly updates blob storage
 */

import { put } from '@vercel/blob';

const BLOB_TOKEN = 'vercel_blob_rw_B7AJQRSRMGSt9ONJ_6XxhzNhI0eBbFNrwTixWHkmiBXTpYf';

async function forceUpdateAdminEmails() {
  try {
    console.log('🚀 Force updating admin emails in blob storage...\n');
    
    // Get current admin emails from local file
    const adminEmailsData = {
      "emails": [
        "mukul.meena@iitgn.ac.in",
        "technical.secretary@iitgn.ac.in", 
        "mukulmee771@gmail.com",
        "chandrabhan.patel@iitgn.ac.in",
        "arjun.sekar@iitgn.ac.in",
        "siya.patil@iitgn.ac.in",
        "aniket.mishra@iitgn.ac.in",
        "aashmun.gupta@iitgn.ac.in",
        "tanish.yelgoe@iitgn.ac.in",
        "meanmechanics@iitgn.ac.in",
        "odyssey@iitgn.ac.in",
        "grasp@iitgn.ac.in",
        "digis@iitgn.ac.in",
        "romit.mohane@iitgn.ac.in",
        "metis@iitgn.ac.in",
        "kalp.shah@iitgn.ac.in"
      ],
      "lastModified": new Date().toISOString(),
      "modifiedBy": "force-update-script",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": new Date().toISOString()
    };
    
    console.log(`📧 Updating with ${adminEmailsData.emails.length} admin emails:`);
    adminEmailsData.emails.forEach(email => console.log(`  - ${email}`));
    
    console.log('\n⬆️  Force uploading to blob storage...');
    
    // Force upload to blob storage
    const result = await put('admin-emails.json', JSON.stringify(adminEmailsData, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN,
      allowOverwrite: true
    });
    
    console.log(`✅ Force upload successful: ${result.url}`);
    
    // Wait a moment and verify
    console.log('\n⏳ Waiting 5 seconds for propagation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔍 Verifying forced update...');
    const response = await fetch(`https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/admin-emails.json?t=${Date.now()}`);
    if (response.ok) {
      const uploadedData = await response.json();
      console.log(`✅ Verification successful! Blob now contains ${uploadedData.emails.length} admin emails.`);
      console.log(`🕐 Last updated: ${uploadedData.lastModified}`);
      
      if (uploadedData.emails.length === 16) {
        console.log('\n🎉 SUCCESS! All 16 admin emails are now in production!');
        console.log('🔐 Try logging in again - authentication should now work for all users.');
      }
    } else {
      console.log('⚠️  Could not verify upload, but upload command succeeded.');
    }
    
  } catch (error) {
    console.error('❌ Force update failed:', error);
    process.exit(1);
  }
}

forceUpdateAdminEmails();

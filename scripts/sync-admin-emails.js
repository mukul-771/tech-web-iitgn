#!/usr/bin/env node

/**
 * Sync Admin Emails to Blob Storage
 * This script uploads the current admin-emails.json to Vercel blob storage
 */

import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { join } from 'path';

const BLOB_TOKEN = 'vercel_blob_rw_B7AJQRSRMGSt9ONJ_6XxhzNhI0eBbFNrwTixWHkmiBXTpYf';

async function syncAdminEmails() {
  try {
    console.log('🔍 Reading local admin emails...');
    
    // Read local admin-emails.json
    const filePath = join(process.cwd(), 'data', 'admin-emails.json');
    const adminEmailsData = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    console.log(`📧 Found ${adminEmailsData.emails.length} admin emails:`);
    adminEmailsData.emails.forEach(email => console.log(`  - ${email}`));
    
    console.log('\n⬆️  Uploading to blob storage...');
    
    // Upload to blob storage
    const result = await put('admin-emails.json', JSON.stringify(adminEmailsData, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: BLOB_TOKEN
    });
    
    console.log(`✅ Successfully uploaded admin emails to: ${result.url}`);
    console.log(`🔗 Public URL: https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/admin-emails.json`);
    
    // Verify upload
    console.log('\n🔍 Verifying upload...');
    const response = await fetch('https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/admin-emails.json');
    if (response.ok) {
      const uploadedData = await response.json();
      console.log(`✅ Verification successful! Blob now contains ${uploadedData.emails.length} admin emails.`);
    } else {
      console.log('⚠️  Could not verify upload, but upload command succeeded.');
    }
    
  } catch (error) {
    console.error('❌ Failed to sync admin emails:', error);
    process.exit(1);
  }
}

// Run the sync
syncAdminEmails();

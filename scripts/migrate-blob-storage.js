// Blob Storage Migration Script
// This script helps migrate files from old blob storage to new one

import { put, list } from '@vercel/blob';

const OLD_TOKEN = 'vercel_blob_rw_sJ0soPNWRxxAp15U_EMQCszQU2RRK9UZyrUyM5Y22vAqbXz';
const NEW_TOKEN = 'vercel_blob_rw_B7AJQRSRMGSt9ONJ_6XxhzNhI0eBbFNrwTixWHkmiBXTpYf';

async function migrateFiles() {
  try {
    console.log('🔍 Listing files from old storage...');
    
    // List all files from old storage
    const { blobs } = await list({
      token: OLD_TOKEN
    });

    console.log(`📁 Found ${blobs.length} files to migrate`);

    for (const blob of blobs) {
      try {
        console.log(`⬇️  Downloading: ${blob.pathname}`);
        
        // Download file from old storage
        const response = await fetch(blob.url);
        const fileBuffer = await response.arrayBuffer();
        
        console.log(`⬆️  Uploading: ${blob.pathname}`);
        
        // Upload to new storage
        const result = await put(blob.pathname, fileBuffer, {
          access: 'public',
          token: NEW_TOKEN
        });
        
        console.log(`✅ Migrated: ${blob.pathname} -> ${result.url}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${blob.pathname}:`, error);
      }
    }
    
    console.log('🎉 Migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

// Run migration
migrateFiles();

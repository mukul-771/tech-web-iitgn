#!/usr/bin/env node

/**
 * Migration script to move existing files from local storage to Firebase Storage
 * Run this script after setting up Firebase configuration
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin
function initializeFirebase() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  const serviceAccount = JSON.parse(serviceAccountKey);
  
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return getStorage().bucket();
}

// Upload file to Firebase Storage
async function uploadFile(localPath, firebasePath, contentType) {
  const bucket = initializeFirebase();
  
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const file = bucket.file(firebasePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebasePath}`;
    console.log(`✅ Uploaded: ${localPath} -> ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`❌ Failed to upload ${localPath}:`, error.message);
    return null;
  }
}

// Get content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Migrate files from a directory
async function migrateDirectory(localDir, firebaseFolder) {
  const fullLocalPath = path.join(process.cwd(), 'public', localDir);
  
  if (!fs.existsSync(fullLocalPath)) {
    console.log(`⚠️  Directory not found: ${fullLocalPath}`);
    return;
  }

  console.log(`\n📁 Migrating ${localDir}...`);
  
  const files = fs.readdirSync(fullLocalPath, { recursive: true });
  
  for (const file of files) {
    const localFilePath = path.join(fullLocalPath, file);
    const stats = fs.statSync(localFilePath);
    
    if (stats.isFile()) {
      const firebasePath = `${firebaseFolder}/${file}`;
      const contentType = getContentType(localFilePath);
      
      await uploadFile(localFilePath, firebasePath, contentType);
    }
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting Firebase Storage migration...\n');
  
  try {
    // Define directories to migrate
    const migrations = [
      { local: 'team', firebase: 'team' },
      { local: 'logos/clubs', firebase: 'logos/clubs' },
      { local: 'logos/hobby-groups', firebase: 'logos/hobby-groups' },
      { local: 'events/uploads', firebase: 'events/uploads' },
      { local: 'torque/magazines', firebase: 'torque/magazines' },
      { local: 'torque/covers', firebase: 'torque/covers' },
    ];

    for (const { local, firebase } of migrations) {
      await migrateDirectory(local, firebase);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your data files to use Firebase URLs');
    console.log('2. Test the application thoroughly');
    console.log('3. Remove local files after confirming everything works');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  migrate().catch(console.error);
}

module.exports = { migrate, uploadFile, getContentType };

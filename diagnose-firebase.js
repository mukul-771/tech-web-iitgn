#!/usr/bin/env node

// Firebase Storage Diagnostic Script
const { initializeApp } = require('firebase/app');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function diagnoseFirebaseStorage() {
  try {
    console.log('🔍 Diagnosing Firebase Storage...\n');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log(`📦 Storage bucket: ${firebaseConfig.storageBucket}\n`);
    
    // List all files in the team folder
    const teamRef = ref(storage, 'team');
    console.log('📁 Listing files in team folder...');
    
    const listResult = await listAll(teamRef);
    
    if (listResult.items.length === 0 && listResult.prefixes.length === 0) {
      console.log('❌ No files or folders found in team directory');
      console.log('💡 This means files were never uploaded or were deleted');
      return;
    }
    
    console.log(`📂 Found ${listResult.prefixes.length} subfolders`);
    console.log(`📄 Found ${listResult.items.length} files in root\n`);
    
    // Check subfolders (team member folders)
    for (const folderRef of listResult.prefixes) {
      console.log(`📁 Checking folder: ${folderRef.name}`);
      
      try {
        const folderContents = await listAll(folderRef);
        console.log(`  - Contains ${folderContents.items.length} files`);
        
        // Test download URLs for files in this folder
        for (const fileRef of folderContents.items) {
          try {
            const downloadURL = await getDownloadURL(fileRef);
            console.log(`  ✅ ${fileRef.name}: URL generated successfully`);
            
            // Test if URL actually works
            const response = await fetch(downloadURL, { method: 'HEAD' });
            if (response.ok) {
              console.log(`  ✅ ${fileRef.name}: File accessible (${response.status})`);
            } else {
              console.log(`  ❌ ${fileRef.name}: File not accessible (${response.status})`);
            }
          } catch (error) {
            console.log(`  ❌ ${fileRef.name}: Error generating URL - ${error.message}`);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error accessing folder: ${error.message}`);
      }
      
      console.log('');
    }
    
    // Test a specific problematic URL from your data
    console.log('🔍 Testing specific URLs from database...');
    const testUrls = [
      'https://firebasestorage.googleapis.com/v0/b/tech-website-prod.firebasestorage.app/o/team/iRNL2REvSA61hsVEtYJO/ChatGPT%20Image%20May%2024%2C%202025%2C%2008_58_56%20PM.png?alt=media&token=cbd2233c-b76c-47b9-8c93-89ffd37d7e32',
      'https://firebasestorage.googleapis.com/v0/b/tech-website-prod.firebasestorage.app/o/team/xQKMWHiU94AyPGESgD9f/ChatGPT%20Image%20May%2024%2C%202025%2C%2008_58_56%20PM.png?alt=media&token=f82b7810-c1e3-4599-be29-1ead6870ae29'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`${response.ok ? '✅' : '❌'} URL test: ${response.status} - ${url.split('/').pop()?.split('?')[0]}`);
        
        if (!response.ok) {
          const errorText = await fetch(url).then(r => r.text()).catch(() => 'Could not read error');
          console.log(`   Error details: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`❌ URL test failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\n💡 SOLUTION: Update Firebase Storage rules to allow public read access');
      console.log('Go to Firebase Console > Storage > Rules and set:');
      console.log('rules_version = \'2\';');
      console.log('service firebase.storage {');
      console.log('  match /b/{bucket}/o {');
      console.log('    match /{allPaths=**} {');
      console.log('      allow read: if true;');
      console.log('      allow write: if request.auth != null;');
      console.log('    }');
      console.log('  }');
      console.log('}');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

diagnoseFirebaseStorage();

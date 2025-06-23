#!/usr/bin/env node

// Script to fix Firebase service account private key formatting
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

try {
  // Read the current .env.local file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Find the FIREBASE_SERVICE_ACCOUNT_KEY line
  const serviceAccountMatch = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.+)/);
  
  if (!serviceAccountMatch) {
    console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
    process.exit(1);
  }
  
  const originalServiceAccount = serviceAccountMatch[1];
  
  try {
    // Parse the JSON to check if it's valid
    const serviceAccountObj = JSON.parse(originalServiceAccount);
    
    // Check if private_key has escaped newlines
    if (serviceAccountObj.private_key && serviceAccountObj.private_key.includes('\\n')) {
      console.log('🔧 Fixing private key formatting...');
      
      // Replace escaped newlines with actual newlines
      serviceAccountObj.private_key = serviceAccountObj.private_key.replace(/\\n/g, '\n');
      
      // Create the new service account JSON string
      const fixedServiceAccount = JSON.stringify(serviceAccountObj);
      
      // Replace in the env content
      const newEnvContent = envContent.replace(
        /FIREBASE_SERVICE_ACCOUNT_KEY=.+/,
        `FIREBASE_SERVICE_ACCOUNT_KEY=${fixedServiceAccount}`
      );
      
      // Write back to the file
      fs.writeFileSync(envPath, newEnvContent);
      
      console.log('✅ Fixed private key formatting in .env.local');
      console.log('🔄 Please restart your development server');
      
    } else {
      console.log('✅ Private key formatting is already correct');
    }
    
  } catch (error) {
    console.log('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', error.message);
  }
  
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
}

# Firebase Service Account Key Fix Instructions

## Problem
The Firebase service account private key in Vercel environment variables may have incorrect line breaks, causing JWT signing errors during image uploads.

## Symptoms
- Error: `error:1E08010C:DECODER routines::unsupported`
- Authentication and JWT signing failures in production
- Image uploads failing with cryptographic errors

## Solution

### Step 1: Create a Local Key Fix Script

Create a file called `fix-firebase-key.js` with the following content:

```javascript
// DO NOT COMMIT THIS FILE - Contains sensitive credentials
const fs = require('fs');

// Replace this with your actual Firebase service account key JSON
const serviceAccountKey = `PASTE_YOUR_ACTUAL_SERVICE_ACCOUNT_KEY_HERE`;

try {
  const serviceAccount = JSON.parse(serviceAccountKey);
  
  if (serviceAccount.private_key) {
    // Fix the private key formatting
    serviceAccount.private_key = serviceAccount.private_key
      .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
      .replace(/\n\n+/g, '\n')  // Remove multiple consecutive newlines
      .trim();
    
    // Ensure proper PEM format
    if (!serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format - should start with -----BEGIN PRIVATE KEY-----');
    }
    
    if (!serviceAccount.private_key.endsWith('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format - should end with -----END PRIVATE KEY-----');
    }
    
    // Write the fixed key to a file
    fs.writeFileSync('firebase-service-account-fixed.json', JSON.stringify(serviceAccount, null, 2));
    console.log('✅ Fixed Firebase service account key saved to firebase-service-account-fixed.json');
    console.log('📝 Copy the contents of this file to your Vercel environment variable FIREBASE_SERVICE_ACCOUNT_KEY');
    
  } else {
    console.error('❌ No private_key found in service account');
  }
} catch (error) {
  console.error('❌ Error fixing Firebase key:', error.message);
}
```

### Step 2: Run the Fix Script

1. Replace `PASTE_YOUR_ACTUAL_SERVICE_ACCOUNT_KEY_HERE` with your actual Firebase service account key JSON
2. Run the script: `node fix-firebase-key.js`
3. This will create `firebase-service-account-fixed.json` with the properly formatted key

### Step 3: Update Vercel Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Find the `FIREBASE_SERVICE_ACCOUNT_KEY` variable
4. Replace its value with the contents of `firebase-service-account-fixed.json`
5. Redeploy your application

### Step 4: Clean Up

After updating Vercel:
- Delete the local `fix-firebase-key.js` file (contains sensitive data)
- Delete the local `firebase-service-account-fixed.json` file (contains sensitive data)
- Never commit these files to version control

### Step 5: Test the Fix

Use the Firebase authentication diagnostics endpoint to verify the fix:
```
GET https://your-domain.vercel.app/api/admin/firebase-auth-diagnostics
```

This should show `privateKeyValid: true` if the key is properly formatted.

## Security Notes

- Never commit service account keys to version control
- Always use environment variables for sensitive credentials
- The fix script should only be run locally and files should be deleted after use
- Consider rotating your service account key periodically for security

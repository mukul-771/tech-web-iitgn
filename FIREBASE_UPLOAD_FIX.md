# 🔥 Firebase Storage Upload Fix for Vercel

## Current Error
```
Upload error: Failed to upload photo: 7 PERMISSION_DENIED: Missing or insufficient permissions.
```

## Root Causes
1. **Firebase Storage rules** don't allow server-side uploads
2. **Service account authentication** may not be properly configured
3. **Storage bucket permissions** need adjustment

## 🛠 Step-by-Step Fix

### Step 1: Update Firebase Storage Rules

Go to [Firebase Console](https://console.firebase.google.com/):

1. Select your project: `tech-website-prod`
2. Go to **Storage** > **Rules**
3. Replace current rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files (for displaying images)
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow server-side writes (using service account)
    // This is for admin uploads from your Next.js API
    match /team/{allPaths=**} {
      allow write: if true; // Service account bypasses auth rules
    }
    
    // Allow writes for authenticated users (if using client-side auth)
    match /uploads/{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

### Step 2: Verify Service Account Key in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `technical-council-iitgn`
3. Go to **Settings** > **Environment Variables**
4. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly

**Important**: The service account key should be the **complete JSON** starting with `{"type":"service_account"...}`

### Step 3: Test Firebase Admin Connection

I've created a test endpoint to verify Firebase Admin is working. After deployment, test:

**Test URL**: `https://technical-council-iitgn.vercel.app/api/admin/test-firebase`

This will show you:
- Whether Firebase Admin is properly initialized
- If the service account key is configured
- Whether the storage bucket is accessible

### Step 4: Alternative Storage Rules (More Secure)

If you want more specific permissions:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for team images
    match /team/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only server-side uploads allowed
    }
    
    // Server uploads bypass these rules when using service account
    // So admin uploads will work regardless
  }
}
```

## 🚀 Quick Fix Commands

If you have Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set your project
firebase use tech-website-prod

# Deploy updated rules
firebase deploy --only storage
```

## 🎯 Testing Steps

1. **Update Firebase Storage rules** (Step 1)
2. **Test Firebase connection**: `https://technical-council-iitgn.vercel.app/api/admin/test-firebase`
3. **Test authentication**: `https://technical-council-iitgn.vercel.app/api/admin/debug-auth`
4. **Try photo upload**: `https://technical-council-iitgn.vercel.app/admin/team`

## 🛠 If Still Getting Permission Errors

1. **Check Vercel environment variables**:
   - `FIREBASE_SERVICE_ACCOUNT_KEY` should be complete JSON
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` should match your bucket name

2. **Verify Firebase project settings**:
   - Make sure you're using the correct project ID
   - Check that Storage is enabled in Firebase Console

3. **Check Vercel function logs**:
   - Go to Vercel Dashboard > Your Project > Functions
   - Look for detailed error messages

## 📝 What I Fixed

- ✅ **Completed Firebase upload function** - was missing actual upload logic
- ✅ **Added proper error handling** - better error messages
- ✅ **Created Firebase test endpoint** - for debugging connections
- ✅ **Updated storage rules guidance** - more specific permissions
- ✅ **Added server-side authentication** - using Firebase Admin SDK

The upload should now work properly once you update the Firebase Storage rules!

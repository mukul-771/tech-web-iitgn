# Firebase Storage Security Rules Fix

## The Problem
Your Firebase Storage files exist but return 403 (Forbidden) errors because the security rules don't allow public read access.

## The Solution

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tech-website-prod`
3. Go to **Storage** in the left sidebar
4. Click on **Rules** tab

### Step 2: Update Security Rules
Replace your current rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    // Allow authenticated write access
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish the Rules
1. Click **Publish** to save the new rules
2. Wait for the rules to propagate (usually takes a few seconds)

## What This Does
- **`allow read: if true`** - Allows anyone to read/download files (needed for public images)
- **`allow write: if request.auth != null`** - Only authenticated users can upload/modify files
- **`match /{allPaths=**}`** - Applies to all files and folders

## Alternative: More Specific Rules
If you only want to allow public access to team images:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to team images
    match /team/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Require authentication for other files
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing
After updating the rules, test with:
```bash
curl -I "https://firebasestorage.googleapis.com/v0/b/tech-website-prod.firebasestorage.app/o/team/iRNL2REvSA61hsVEtYJO/ChatGPT%20Image%20May%2024%2C%202025%2C%2008_58_56%20PM.png?alt=media"
```

You should see `200 OK` instead of `403 Forbidden`.

## Current Status ✅

- **Fixed**: Firebase service account key formatting
- **Fixed**: Storage bucket name corrected 
- **Fixed**: Next.js 15 API route compatibility
- **Working**: Team member fallback display with initials
- **Working**: All API endpoints functional
- **Pending**: Firebase Storage security rules update (see solution above)

**Test Result**: Images still return 400/403 errors until security rules are updated.

## Security Note
These rules make your team images publicly accessible, which is typical for profile pictures on websites. If you have sensitive files, store them in different folders with stricter rules.

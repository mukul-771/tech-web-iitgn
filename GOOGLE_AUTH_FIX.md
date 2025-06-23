# Google OAuth Configuration Fix

## Issue Found and Fixed

**Problem**: Your `NEXTAUTH_URL` was set to `http://localhost:3001` but your app runs on `http://localhost:3000`.

**Solution**: Updated `.env.local` to use the correct URL:
```
NEXTAUTH_URL=http://localhost:3000
```

## Important: Update Google Cloud Console

You need to update your Google OAuth configuration in the Google Cloud Console:

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or the project containing your OAuth client)

### Step 2: Navigate to OAuth Configuration
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID (check your .env.local file for the actual ID)
3. Click on it to edit

### Step 3: Update Authorized Redirect URIs
Make sure these URIs are listed:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google` (keep this if you might use port 3001)

### Step 4: Test Authentication
1. Clear your browser cookies/cache for localhost:3000
2. Go to `http://localhost:3000/admin`
3. Click "Sign in with Google"
4. After successful login, visit: `http://localhost:3000/api/admin/debug-auth`

## Verification Steps

After fixing the Google Cloud Console settings:

1. **Test Authentication**: Go to `http://localhost:3000/api/admin/debug-auth`
2. **Check Session**: Should show your user details and admin status
3. **Test Upload**: Try uploading a team member photo

## Troubleshooting

If you still get authentication errors:

1. **Clear browser data** for localhost:3000
2. **Check admin email**: Make sure your Google email is in `data/admin-emails.json`
3. **Check console logs** in browser developer tools
4. **Verify Google OAuth settings** match the redirect URIs exactly

## Next.js Server Restart

The server has been restarted with the correct configuration. You should now be able to authenticate properly.

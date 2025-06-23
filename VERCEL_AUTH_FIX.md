# 🔧 Vercel Production Authentication Fix

## Current Issues
Your Vercel deployment at `https://technical-council-iitgn.vercel.app` is experiencing authentication issues because:

1. **NEXTAUTH_URL** is not set correctly for production
2. **Google OAuth redirect URIs** don't include your Vercel domain
3. **Environment variables** may not be properly configured

## 🚀 Step-by-Step Fix

### Step 1: Update Vercel Environment Variables

Go to your Vercel Dashboard:
1. Visit: https://vercel.com/dashboard
2. Find your project: `technical-council-iitgn`
3. Go to **Settings** > **Environment Variables**

Add/Update these variables:

```env
NEXTAUTH_URL=https://technical-council-iitgn.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_from_env_local
GOOGLE_CLIENT_ID=your_google_client_id_from_env_local
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_env_local
```

**Important**: Make sure to set these for **Production** environment.

### Step 2: Update Google Cloud Console OAuth Settings

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (from your .env.local file)
3. Click to edit it
4. In **Authorized redirect URIs**, add:
   ```
   https://technical-council-iitgn.vercel.app/api/auth/callback/google
   ```
5. Keep existing localhost URIs for development:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   ```

### Step 3: Deploy Latest Changes

Since we've made code fixes, push them to GitHub:

```bash
git add .
git commit -m "Fix authentication for Vercel production deployment"
git push origin main
```

Vercel will automatically redeploy.

### Step 4: Test Authentication

After deployment:

1. **Clear browser cache** for your Vercel domain
2. Go to: `https://technical-council-iitgn.vercel.app/admin`
3. Click "Sign in with Google"
4. Test the debug endpoint: `https://technical-council-iitgn.vercel.app/api/admin/debug-auth`

### Step 5: Test Photo Upload

1. Go to: `https://technical-council-iitgn.vercel.app/admin/team`
2. Try uploading a team member photo
3. Check if images display correctly on: `https://technical-council-iitgn.vercel.app/about`

## 🛠 Troubleshooting

### If authentication still fails:

1. **Check Vercel logs**:
   - Go to Vercel Dashboard > Your Project > Functions tab
   - Look for error logs in API routes

2. **Verify environment variables**:
   - In Vercel Dashboard, check that all env vars are set correctly
   - Make sure they're set for "Production" environment

3. **Check Google OAuth error messages**:
   - Look for specific error messages in browser console
   - Common issues: wrong redirect URI, expired tokens

### If images don't upload:

1. **Check Firebase Storage rules** (see `FIREBASE_STORAGE_RULES_FIX.md`)
2. **Verify Firebase service account key** is properly set in Vercel
3. **Check Firebase Storage bucket permissions**

## 🎯 Quick Verification Commands

Test these URLs after fixing:

- Authentication debug: `https://technical-council-iitgn.vercel.app/api/admin/debug-auth`
- Team API: `https://technical-council-iitgn.vercel.app/api/team`
- Admin login: `https://technical-council-iitgn.vercel.app/admin`

## ⚡ One-Click Vercel Environment Setup

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Set environment variables
vercel env add NEXTAUTH_URL production
# Enter: https://technical-council-iitgn.vercel.app

vercel env add NEXTAUTH_SECRET production  
# Enter: your_nextauth_secret_from_env_local

vercel env add GOOGLE_CLIENT_ID production
# Enter: your_google_client_id_from_env_local

vercel env add GOOGLE_CLIENT_SECRET production
# Enter: your_google_client_secret_from_env_local

# Redeploy
vercel --prod
```

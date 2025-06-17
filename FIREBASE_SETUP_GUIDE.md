# 🔥 Firebase Storage Setup Guide

This guide will help you set up Firebase Storage for file management and deploy your application to Vercel.

## 📋 Prerequisites

- Google account
- Node.js installed
- Vercel account (optional, for deployment)

---

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or "Add project"

2. **Configure Project**
   - Enter project name (e.g., "tech-website")
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"

3. **Enable Storage**
   - In the Firebase console, go to "Storage" in the left sidebar
   - Click "Get started"
   - Choose "Start in production mode" (we'll configure rules later)
   - Select a storage location (choose closest to your users)

---

## 🔧 Step 2: Get Firebase Configuration

1. **Web App Configuration**
   - In Firebase console, click the gear icon → "Project settings"
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app icon (`</>`)
   - Enter app nickname (e.g., "tech-website-web")
   - Click "Register app"
   - Copy the configuration object

2. **Service Account Key**
   - Go to "Project settings" → "Service accounts" tab
   - Click "Generate new private key"
   - Download the JSON file
   - **Keep this file secure and never commit it to version control**

---

## 🔐 Step 3: Configure Environment Variables

1. **Create `.env.local` file** (copy from `.env.example`):

```bash
cp .env.example .env.local
```

2. **Fill in Firebase configuration** from Step 2:

```env
# Firebase Configuration (from web app config)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

---

## 📁 Step 4: Configure Storage Rules

1. **Go to Storage Rules** in Firebase console
2. **Replace default rules** with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only allow writes through admin API
    }
  }
}
```

3. **Publish the rules**

---

## 🔄 Step 5: Migrate Existing Files

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Run migration script**:
```bash
node scripts/migrate-to-firebase.js
```

3. **Verify migration**:
   - Check Firebase Storage console
   - Ensure all files are uploaded
   - Test file access in your application

---

## 🚀 Step 6: Deploy to Vercel

1. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

2. **Deploy via Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel:
     - Add all variables from `.env.local`
     - Make sure `NEXTAUTH_URL` points to your production domain

3. **Deploy via CLI** (alternative):
```bash
vercel --prod
```

---

## 🔧 Environment Variables for Production

### Required for Vercel:

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## ✅ Step 7: Verify Setup

1. **Test file uploads** in admin interface
2. **Check Firebase Storage** console for new files
3. **Verify public access** to uploaded files
4. **Test on production** deployment

---

## 🔒 Security Considerations

- **Service Account Key**: Never expose in client-side code
- **Storage Rules**: Configured for public read, admin-only write
- **Admin Access**: Protected by Google OAuth
- **CORS**: Automatically handled by Firebase

---

## 🐛 Troubleshooting

### Common Issues:

1. **"Permission denied" errors**:
   - Check Firebase Storage rules
   - Verify service account key is correct

2. **"Module not found" errors**:
   - Run `npm install` to install dependencies
   - Check import paths in updated files

3. **Environment variables not working**:
   - Verify `.env.local` file exists and has correct values
   - Restart development server after changes
   - Check Vercel environment variables for production

4. **Files not uploading**:
   - Check Firebase project configuration
   - Verify storage bucket exists and is accessible
   - Check browser console for errors

---

## 📞 Support

If you encounter issues:
1. Check Firebase console for error logs
2. Review browser console for client-side errors
3. Check Vercel function logs for server-side errors
4. Verify all environment variables are set correctly

---

**🎉 Congratulations! Your application now uses Firebase Storage for scalable file management.**

# 🚀 Vercel Deployment Guide - POST TEAM MIGRATION UPDATE

## 📢 LATEST UPDATE: Team Migration Complete
**Status:** ✅ Team data successfully migrated from blob storage to Neon database
**GitHub Push:** ✅ COMPLETED (commit: 5f3f7bf)  
**Auto-Deploy:** Should trigger automatically from main branch

---

Complete guide for deploying your tech website to Vercel with Firebase Storage integration.

## 📋 Prerequisites

- Completed Firebase setup (see `FIREBASE_SETUP_GUIDE.md`)
- GitHub repository with your code
- Vercel account

---

## 🔧 Step 1: Prepare for Deployment

### 1.1 Environment Variables Checklist

Ensure you have all required environment variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://tech-web-iitgn.vercel.app/
NEXTAUTH_SECRET=your_production_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 1.2 Test Local Build

```bash
npm run build
npm start
```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables" section
   - Add all variables from your `.env.local` file
   - **Important**: Set `NEXTAUTH_URL` to your production domain

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Option B: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   # ... add all other variables
   ```

---

## 🔧 Step 3: Configure Production Settings

### 3.1 Update Google OAuth

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project

2. **Update OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Add your production domain to "Authorized domains"

3. **Update OAuth Client**
   - Go to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add to "Authorized redirect URIs":
     ```
     https://your-domain.vercel.app/api/auth/callback/google
     ```

### 3.2 Update Firebase Configuration

1. **Add Domain to Firebase**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to "Authorized domains"

2. **Update CORS (if needed)**
   - Firebase Storage automatically handles CORS
   - No additional configuration needed

---

## 🔍 Step 4: Verify Deployment

### 4.1 Test Core Functionality

- [ ] Website loads correctly
- [ ] Admin login works
- [ ] File uploads work in admin interface
- [ ] Images display correctly on public pages
- [ ] All admin CRUD operations work

### 4.2 Test File Operations

1. **Upload Test**
   - Login to admin interface
   - Try uploading different file types
   - Verify files appear in Firebase Storage

2. **Display Test**
   - Check if uploaded files display correctly
   - Test different image formats
   - Verify PDF downloads work

### 4.3 Performance Check

- [ ] Page load times are acceptable
- [ ] Images load quickly
- [ ] No console errors
- [ ] Mobile responsiveness works

---

## 🔧 Step 5: Domain Configuration (Optional)

### 5.1 Custom Domain

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   ```env
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

3. **Update OAuth Settings**
   - Update Google OAuth redirect URIs
   - Update Firebase authorized domains

---

## 📊 Step 6: Monitoring and Analytics

### 6.1 Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor performance and usage

### 6.2 Firebase Monitoring

- Check Firebase Storage usage
- Monitor file upload/download metrics
- Set up billing alerts if needed

---

## 🐛 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build locally first
   npm run build
   
   # Common fixes:
   # - Update Node.js version in vercel.json
   # - Check for TypeScript errors
   # - Verify all dependencies are installed
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify variables are set
   vercel env ls
   
   # Add missing variables
   vercel env add VARIABLE_NAME
   ```

3. **Authentication Issues**
   - Verify Google OAuth redirect URIs
   - Check NEXTAUTH_URL is correct
   - Ensure NEXTAUTH_SECRET is set

4. **File Upload Issues**
   - Check Firebase service account key
   - Verify Firebase Storage rules
   - Check browser console for errors

### Performance Issues

1. **Slow Image Loading**
   - Images are automatically optimized by Firebase
   - Consider implementing lazy loading
   - Use appropriate image formats

2. **Function Timeouts**
   - Increased timeout to 60s in vercel.json
   - Monitor function execution times
   - Optimize large file uploads

---

## 🔄 Step 7: Continuous Deployment

### Automatic Deployments

- Vercel automatically deploys on git push to main branch
- Preview deployments for pull requests
- Environment variables are inherited

### Manual Deployments

```bash
# Deploy specific branch
vercel --prod --branch feature-branch

# Deploy with specific environment
vercel --prod --env ENVIRONMENT=production
```

---

## 📈 Step 8: Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Google OAuth working
- [ ] Firebase Storage working
- [ ] Admin interface accessible
- [ ] File uploads/downloads working
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable
- [ ] Error monitoring set up
- [ ] Backup strategy in place

---

## 🎉 Success!

Your tech website is now deployed to Vercel with Firebase Storage integration!

### Next Steps:
1. Share the production URL with your team
2. Set up monitoring and alerts
3. Plan regular backups
4. Monitor usage and costs
5. Consider implementing CDN for better performance

---

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NextAuth.js Documentation](https://next-auth.js.org/)

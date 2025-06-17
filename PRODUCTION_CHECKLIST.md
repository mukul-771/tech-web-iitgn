# ✅ Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

### Code Quality & Testing
- [ ] **Build succeeds locally**: `npm run build` completes without errors
- [ ] **Linting passes**: `npm run lint` shows no errors
- [ ] **TypeScript compilation**: `npx tsc --noEmit` passes
- [ ] **All admin features tested**: Create, edit, delete operations work
- [ ] **Authentication tested**: Google OAuth login/logout works
- [ ] **File uploads tested**: Image and PDF uploads work correctly
- [ ] **Responsive design**: Website works on mobile, tablet, desktop
- [ ] **Performance optimized**: Images optimized, bundle size reasonable

### Security Review
- [ ] **Admin emails configured**: Updated in `src/lib/auth.ts`
- [ ] **Environment variables secure**: No secrets in code
- [ ] **HTTPS enforced**: All external links use HTTPS
- [ ] **File upload validation**: Proper file type and size limits
- [ ] **Route protection**: All admin routes require authentication
- [ ] **CORS configured**: Proper cross-origin settings
- [ ] **Security headers**: CSP, XSS protection enabled

### Configuration
- [ ] **Environment variables ready**: All required vars documented
- [ ] **Google OAuth configured**: Production credentials obtained
- [ ] **Domain configured**: DNS settings ready (if using custom domain)
- [ ] **Error pages**: Custom 404, 500 pages implemented
- [ ] **Robots.txt**: SEO configuration set
- [ ] **Sitemap**: Generated for public pages

---

## 🔧 Environment Variables Setup

### Required Variables
```env
# Authentication (Required)
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-secure-random-secret-32-chars-minimum
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Optional: Database (if migrating from JSON)
DATABASE_URL=your-database-connection-string

# Optional: File Storage (if migrating from local storage)
# Vercel Blob (automatic with Vercel)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# AWS S3 (if using S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_CLOUDFRONT_URL=https://your-cloudfront-distribution.com

# Cloudinary (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-ga-tracking-id
```

### Generate Secure Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🌐 Google OAuth Production Setup

### Step 1: Update OAuth Consent Screen
1. **Google Cloud Console** → OAuth consent screen
2. **Publishing status**: Change from "Testing" to "In production"
3. **Verification**: May require Google verification for sensitive scopes

### Step 2: Add Production Redirect URIs
1. **Credentials** → Your OAuth 2.0 Client ID
2. **Authorized redirect URIs**: Add production callback
   ```
   https://your-domain.com/api/auth/callback/google
   ```

### Step 3: Update Authorized Domains
1. **OAuth consent screen** → Authorized domains
2. **Add your production domain**: `your-domain.com`

### Step 4: Test OAuth Flow
- [ ] **Login works**: Can sign in with admin email
- [ ] **Logout works**: Can sign out properly
- [ ] **Unauthorized users blocked**: Non-admin emails rejected
- [ ] **Session persistence**: Login state maintained across page refreshes

---

## 🚀 Deployment Platforms

### Vercel (Recommended)

#### Advantages
- ✅ **Zero-config Next.js deployment**
- ✅ **Automatic HTTPS and CDN**
- ✅ **Serverless functions for API routes**
- ✅ **Environment variables management**
- ✅ **Preview deployments for PRs**
- ✅ **Built-in analytics and monitoring**

#### Deployment Steps
1. **Connect GitHub**: Import repository to Vercel
2. **Configure build**: Auto-detected for Next.js
3. **Set environment variables**: In project settings
4. **Deploy**: Automatic on git push
5. **Custom domain**: Optional, configure DNS

#### Environment Variables in Vercel
- **Dashboard** → Project → Settings → Environment Variables
- **Add each variable**: Name and value
- **Environment**: Production, Preview, Development

### Alternative Platforms

#### Netlify
- **Pros**: Good Next.js support, generous free tier
- **Cons**: Less optimized for Next.js than Vercel
- **Setup**: Similar to Vercel, requires build configuration

#### Railway
- **Pros**: Full-stack hosting, database included
- **Cons**: More expensive, complex setup
- **Best for**: Applications needing persistent storage

#### AWS Amplify
- **Pros**: Full AWS ecosystem integration
- **Cons**: More complex configuration
- **Best for**: AWS-centric infrastructure

---

## 📊 Post-Deployment Verification

### Functionality Testing
- [ ] **Homepage loads**: Main website accessible
- [ ] **Navigation works**: All menu items functional
- [ ] **Admin login**: Can access `/admin` with authorized email
- [ ] **Admin operations**: Create, edit, delete content works
- [ ] **File uploads**: Images and files upload successfully
- [ ] **Public pages**: All content displays correctly
- [ ] **Mobile responsive**: Works on various screen sizes

### Performance Testing
- [ ] **Page load speed**: < 3 seconds for main pages
- [ ] **Core Web Vitals**: Good scores in PageSpeed Insights
- [ ] **Image optimization**: Images load efficiently
- [ ] **Bundle size**: JavaScript bundles reasonably sized

### Security Testing
- [ ] **HTTPS enforced**: All traffic uses SSL
- [ ] **Admin routes protected**: Unauthorized access blocked
- [ ] **File upload security**: Only allowed file types accepted
- [ ] **XSS protection**: Security headers present
- [ ] **CSRF protection**: Forms protected against CSRF

---

## 🔍 Monitoring & Analytics Setup

### Error Monitoring (Recommended: Sentry)
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Analytics (Google Analytics)
```typescript
// src/lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
```

### Uptime Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring features
- **StatusPage**: Public status page for users

---

## 🔄 CI/CD Pipeline Setup

### GitHub Actions (Included)
The provided `.github/workflows/deploy.yml` includes:
- ✅ **Automated testing**: Lint and build on every PR
- ✅ **Security scanning**: Dependency vulnerability checks
- ✅ **Preview deployments**: For pull requests
- ✅ **Production deployment**: On main branch push

### Required GitHub Secrets
1. **Repository Settings** → Secrets and variables → Actions
2. **Add secrets**:
   ```
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-vercel-org-id
   VERCEL_PROJECT_ID=your-vercel-project-id
   ```

### Vercel Integration
- **Automatic**: Vercel automatically deploys on git push
- **Manual**: Can trigger deployments from Vercel dashboard
- **Rollback**: Easy rollback to previous deployments

---

## 🛡️ Security Best Practices

### Environment Security
- [ ] **Secrets rotation**: Regularly rotate API keys and secrets
- [ ] **Access control**: Limit who can access production environment
- [ ] **Audit logs**: Monitor access to admin functions
- [ ] **Backup strategy**: Regular backups of data and configuration

### Application Security
- [ ] **Input validation**: All user inputs validated
- [ ] **File upload limits**: Size and type restrictions enforced
- [ ] **Rate limiting**: Prevent abuse of API endpoints
- [ ] **Security headers**: CSP, HSTS, X-Frame-Options set

### Monitoring Security
- [ ] **Failed login attempts**: Monitor and alert on suspicious activity
- [ ] **Admin actions**: Log all administrative operations
- [ ] **Error tracking**: Monitor for security-related errors
- [ ] **Performance monitoring**: Detect unusual traffic patterns

---

## 📞 Support & Maintenance

### Documentation
- [ ] **Admin user guide**: Instructions for content management
- [ ] **Technical documentation**: Architecture and deployment docs
- [ ] **Troubleshooting guide**: Common issues and solutions
- [ ] **Contact information**: Support contacts for issues

### Maintenance Schedule
- [ ] **Regular updates**: Keep dependencies updated
- [ ] **Security patches**: Apply security updates promptly
- [ ] **Performance reviews**: Monthly performance analysis
- [ ] **Backup verification**: Test backup restoration process

### Emergency Procedures
- [ ] **Incident response plan**: Steps for handling outages
- [ ] **Rollback procedures**: How to revert problematic deployments
- [ ] **Contact escalation**: Who to contact for different issues
- [ ] **Status communication**: How to communicate issues to users

---

## 🎉 Go-Live Checklist

### Final Verification
- [ ] **All tests pass**: Automated and manual testing complete
- [ ] **Performance acceptable**: Load times and Core Web Vitals good
- [ ] **Security verified**: All security measures in place
- [ ] **Monitoring active**: Error tracking and analytics working
- [ ] **Backups configured**: Data backup strategy implemented
- [ ] **Team trained**: Admin users know how to use the system

### Launch Day
- [ ] **DNS updated**: Domain points to production
- [ ] **SSL certificate active**: HTTPS working properly
- [ ] **Admin access verified**: All admin users can log in
- [ ] **Content migrated**: All existing content transferred
- [ ] **Monitoring alerts set**: Team notified of any issues
- [ ] **Announcement ready**: Communication plan for launch

### Post-Launch
- [ ] **Monitor closely**: Watch for issues in first 24-48 hours
- [ ] **User feedback**: Collect feedback from admin users
- [ ] **Performance tracking**: Monitor site performance metrics
- [ ] **Issue resolution**: Address any problems quickly
- [ ] **Documentation updates**: Update docs based on launch experience

---

**🚀 Your Tech@IITGN website is ready for production!**

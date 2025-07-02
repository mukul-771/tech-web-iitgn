# 🔧 VERCEL ENVIRONMENT VARIABLES SETUP

## Critical Issue Identified
The production site is still returning team data as an **object** instead of an **array**, indicating it's using blob storage instead of the Neon database.

## Required Action: Set Environment Variables in Vercel Dashboard

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/technical-secretary-s-projects/tech-web-iitgn/settings/environment-variables

### 2. Add/Update These Environment Variables:

#### **DATABASE_URL** (CRITICAL - Missing in Production)
```
DATABASE_URL=postgres://neondb_owner:npg_iB4pCaPgVM7X@ep-odd-brook-a4xqv6nd-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```
**Environment:** Production, Preview, Development

#### **NEXTAUTH_SECRET**
```
NEXTAUTH_SECRET=6VczpbSfiwM40JnZIJHZRorD8n6qsOo99vHSgdSMku4=
```
**Environment:** Production, Preview, Development

#### **NEXTAUTH_URL**
```
NEXTAUTH_URL=https://tech-web-iitgn.vercel.app
```
**Environment:** Production

#### **Google OAuth**
```
GOOGLE_CLIENT_ID=578108451083-9h7v9bds8rg35kuhauh9ndu41tbtcfsr.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```
**Environment:** Production, Preview, Development

#### **Blob Storage** (Legacy - Keep for Now)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_B7AJQRSRMGSt9ONJ_6XxhzNhI0eBbFNrwTixWHkmiBXTpYf
```
**Environment:** Production, Preview, Development

### 3. After Setting Environment Variables:

1. **Redeploy**: Click "Redeploy" on the latest deployment in Vercel dashboard
2. **Wait for Build**: Let the deployment complete (2-3 minutes)
3. **Test API**: Run verification commands below

### 4. Verification Commands:

```bash
# Should return "array" (currently returns "object")
curl -s "https://tech-web-iitgn.vercel.app/api/team" | jq 'type'

# Should return 23
curl -s "https://tech-web-iitgn.vercel.app/api/team" | jq '. | length'  

# Test migration endpoint
curl -X POST "https://tech-web-iitgn.vercel.app/api/migrate/team"

# Test leadership endpoint
curl -s "https://tech-web-iitgn.vercel.app/api/team/leadership" | jq '. | length'
```

### 5. Expected Results After Fix:
- ✅ Team API returns **array** (database format)
- ✅ 23 team members from Neon database  
- ✅ Migration endpoint functional
- ✅ Leadership filtering works (6 members)
- ✅ About page displays database data

### 6. Troubleshooting:
If issues persist after setting environment variables:
1. Check Vercel function logs for errors
2. Verify DATABASE_URL can connect to Neon
3. Run migration API endpoint to populate database
4. Check if Neon database has team_members table

---
**Status:** Environment variables need to be set in Vercel dashboard
**Priority:** HIGH - DATABASE_URL missing in production

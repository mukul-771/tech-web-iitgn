# Admin Dashboard Setup Guide

This guide will help you set up the admin dashboard for managing the event gallery content on the Technical Council website.

## Prerequisites

1. **Google Cloud Console Project**: You need a Google Cloud Console project to set up OAuth authentication.
2. **Admin Email Access**: You need access to the email addresses that will be authorized as administrators.

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (for OAuth)

### 1.2 Configure OAuth Consent Screen

1. In Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Technical Council Admin"
   - User support email: Your admin email
   - Developer contact information: Your admin email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (the admin email addresses)

### 1.3 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. Save the Client ID and Client Secret

## Step 2: Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the environment variables in `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. Generate a secure secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

## Step 3: Configure Admin Users

1. Open `src/lib/auth.ts`
2. Update the `ADMIN_EMAILS` array with authorized admin email addresses:
   ```typescript
   const ADMIN_EMAILS = [
     "admin@iitgn.ac.in",
     "tech.council@iitgn.ac.in",
     "your-admin-email@example.com",
     // Add more admin emails as needed
   ];
   ```

## Step 4: Install Dependencies and Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the admin dashboard at: `http://localhost:3000/admin`

## Step 5: First Login

1. Navigate to `http://localhost:3000/admin`
2. You'll be redirected to the login page
3. Click "Continue with Google"
4. Sign in with an authorized admin email
5. You'll be redirected to the admin dashboard

## Features

### Event Management
- **Create Events**: Add new events with details, photos, and metadata
- **Edit Events**: Update event information, add/remove photos, reorder gallery
- **Delete Events**: Remove events and all associated photos
- **Preview**: View events as they appear on the public website

### Photo Management
- **Upload Photos**: Drag-and-drop interface for uploading multiple photos
- **Image Optimization**: Automatic image compression and optimization
- **Captions**: Add captions and alt text for accessibility
- **Reorder**: Drag-and-drop to reorder photos within events

### Content Management
- **Rich Text Editing**: Edit event descriptions and highlights
- **Categories**: Organize events by category (Workshop, Symposium, etc.)
- **Organizing Bodies**: Assign events to different clubs and organizations

## File Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── page.tsx          # Main dashboard
│   │   ├── login/            # Login page
│   │   └── events/           # Event management pages
│   └── api/
│       ├── auth/             # NextAuth.js API routes
│       └── admin/            # Admin API endpoints
├── components/
│   ├── admin/                # Admin-specific components
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── auth.ts              # Authentication configuration
│   ├── events-data.ts       # Event data types and defaults
│   └── events-storage.ts    # Data storage functions
└── middleware.ts            # Route protection middleware
```

## Data Storage

Currently, the system uses JSON files for data storage:
- Events data: `data/events.json`
- Uploaded images: `public/events/uploads/`

For production, consider migrating to a proper database like PostgreSQL or MongoDB.

## Security Considerations

1. **Admin Email Verification**: Only emails in the `ADMIN_EMAILS` array can access the admin dashboard
2. **Route Protection**: All admin routes are protected by middleware
3. **File Upload Security**: Images are validated and optimized before storage
4. **Environment Variables**: Sensitive data is stored in environment variables

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**: Make sure your email is in the `ADMIN_EMAILS` array
2. **OAuth Error**: Check your Google OAuth configuration and redirect URIs
3. **File Upload Issues**: Ensure the `public/events/uploads/` directory is writable
4. **Environment Variables**: Make sure all required environment variables are set

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Check the server logs in the terminal
3. Verify your Google OAuth configuration
4. Ensure all environment variables are correctly set

## Production Deployment

For production deployment:

1. Update the `NEXTAUTH_URL` to your production domain
2. Add your production domain to Google OAuth redirect URIs
3. Use a secure secret for `NEXTAUTH_SECRET`
4. Consider using a proper database instead of JSON files
5. Set up proper image storage (e.g., AWS S3, Cloudinary)
6. Configure proper backup and monitoring

## Future Enhancements

Potential improvements for the admin dashboard:
- Database integration (PostgreSQL, MongoDB)
- Cloud storage for images (AWS S3, Cloudinary)
- Bulk operations (bulk upload, bulk edit)
- User roles and permissions
- Activity logging and audit trails
- Advanced image editing features
- SEO optimization tools

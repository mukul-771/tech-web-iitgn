# Admin Login Instructions

## How to Access the Admin Panel

### Step 1: Navigate to Admin Login
Go to: http://localhost:3001/admin/login

### Step 2: Log in with Google
Use one of these authorized admin emails:
- **mukul.meena@iitgn.ac.in**
- **technical.secretary@iitgn.ac.in** 
- **mukulmee771@gmail.com**

### Step 3: Access Team Management
After logging in, go to: http://localhost:3001/admin/team

## Current Admin Setup ✅

- **Authentication**: Google OAuth configured and fixed
- **NextAuth Secret**: Generated and configured 
- **Admin Emails**: 3 authorized emails configured
- **NextAuth URL**: Updated to correct port (localhost:3001)
- **Team Upload**: Available at `/admin/team` after login

## Recent Fixes ✅

- **Fixed**: Empty NEXTAUTH_SECRET (was causing auth issues)
- **Fixed**: Incorrect NEXTAUTH_URL port 
- **Working**: Authentication should now work properly

## Upload Process

1. **Login** → Admin panel unlocked
2. **Navigate** → Go to Admin → Team Management
3. **Upload** → Click "Add New Member" or edit existing member
4. **Photo Upload** → Use the photo upload component

## Troubleshooting

### If you see "You must be signed in to upload":
- ✅ The auth system is working correctly
- ❌ You need to log in first
- 🔧 Go to `/admin/login` and sign in with authorized email

### If login doesn't work:
- Check that you're using one of the authorized emails above
- Try clearing browser cookies/localStorage
- Check the browser console for any errors

### If upload still fails after login:
- Check browser network tab for detailed error messages
- Verify Firebase Storage configuration
- Ensure you have admin permissions

## Next Steps After Login

1. **Test Team Upload**: Try uploading a new team member photo
2. **Verify Display**: Check if images show (may still need Firebase rules fix)
3. **Admin Functions**: All admin features should now be accessible

The authentication is working perfectly - you just need to log in with one of the authorized admin accounts!

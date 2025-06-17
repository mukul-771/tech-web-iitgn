# Inter-IIT Achievements Management System

## Overview

A comprehensive management system for Inter-IIT Tech Meet achievements that allows administrators to create, read, update, and delete achievement records with real-time synchronization to the public website.

## Features

### ✅ Complete CRUD Operations
- **Create**: Add new Inter-IIT achievements with comprehensive form validation
- **Read**: View and search through all achievements with filtering capabilities
- **Update**: Edit existing achievements with pre-populated forms
- **Delete**: Remove achievements with confirmation dialogs

### ✅ Real-time Synchronization
- Changes made in admin panel are immediately reflected on public website
- No server restart required for updates
- Atomic file operations ensure data integrity

### ✅ Data Persistence
- JSON-based storage in `/data/` directory
- Atomic file writes prevent data corruption
- Automatic backup through temporary file operations

### ✅ Role-based Access Control
- Only authorized administrators can access management interface
- Email-based authentication system
- Secure admin-only routes

### ✅ Comprehensive Form Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Required field validation
- Email format validation
- Data type validation

### ✅ Error Handling
- Comprehensive error messages
- Graceful fallbacks for data loading
- User-friendly error notifications
- Detailed logging for debugging

## System Architecture

### Admin Interface Routes
```
/admin/inter-iit-achievements          # List all achievements
/admin/inter-iit-achievements/new      # Create new achievement
/admin/inter-iit-achievements/[id]/edit # Edit existing achievement
```

### API Routes
```
GET    /api/admin/inter-iit-achievements     # Fetch all achievements
POST   /api/admin/inter-iit-achievements     # Create new achievement
GET    /api/admin/inter-iit-achievements/[id] # Fetch single achievement
PUT    /api/admin/inter-iit-achievements/[id] # Update achievement
DELETE /api/admin/inter-iit-achievements/[id] # Delete achievement
```

### Public Routes
```
GET /api/inter-iit-achievements              # Public achievements API
GET /achievements                            # Public achievements page
```

## Data Structure

### Achievement Schema
```typescript
interface InterIITAchievement {
  id: string;
  achievementType: "gold-medal" | "silver-medal" | "bronze-medal" | "ranking" | "special-award" | "recognition";
  competitionName: string;
  interIITEdition: string;
  year: string;
  hostIIT: string;
  location: string;
  ranking?: number;
  teamMembers: TeamMember[];
  achievementDescription: string;
  significance: string;
  competitionCategory: string;
  supportingDocuments: Document[];
  achievementDate: string;
  points?: number;
  status: "verified" | "pending-verification" | "archived";
  createdAt: string;
  updatedAt: string;
}
```

### Team Member Schema
```typescript
interface TeamMember {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: "Team Lead" | "Member" | "Coach" | "Substitute";
  email: string;
  phone?: string;
  achievements?: string[];
}
```

## Usage Guide

### For Administrators

#### Adding New Achievement
1. Navigate to `/admin/inter-iit-achievements`
2. Click "New Achievement" button
3. Fill in all required fields:
   - Competition details (name, type, edition, year)
   - Host information (IIT, location)
   - Achievement details (description, significance)
   - Team members (at least one required)
4. Submit form to create achievement

#### Editing Achievement
1. From achievements list, click "Edit" button on desired achievement
2. Modify any fields as needed
3. Add/remove team members as required
4. Submit to save changes

#### Deleting Achievement
1. From achievements list, click "Delete" button
2. Confirm deletion in dialog
3. Achievement is immediately removed from public site

### For Developers

#### Adding New Achievement Types
Update `achievementTypes` array in `/src/lib/inter-iit-achievements-data.ts`

#### Adding New Competition Categories
Update `competitionCategories` array in `/src/lib/inter-iit-achievements-data.ts`

#### Modifying Validation Rules
Update validation logic in `/src/app/api/admin/inter-iit-achievements/route.ts`

## File Structure

```
src/
├── app/
│   ├── admin/inter-iit-achievements/
│   │   ├── page.tsx                    # Admin list page
│   │   ├── new/page.tsx               # Create form
│   │   └── [id]/edit/page.tsx         # Edit form
│   ├── api/
│   │   ├── admin/inter-iit-achievements/
│   │   │   ├── route.ts               # CRUD API
│   │   │   └── [id]/route.ts          # Single achievement API
│   │   └── inter-iit-achievements/
│   │       └── route.ts               # Public API
│   └── achievements/page.tsx           # Public page
├── lib/
│   ├── inter-iit-achievements-data.ts  # Data types & constants
│   └── inter-iit-achievements-storage.ts # Storage functions
└── data/
    └── inter-iit-achievements.json     # Data file
```

## Security Features

- **Authentication**: Only authorized admin emails can access management interface
- **Input Validation**: Comprehensive validation on both client and server
- **Data Sanitization**: All inputs are validated and sanitized
- **Atomic Operations**: File operations are atomic to prevent corruption
- **Error Handling**: Secure error messages that don't expose system details

## Testing

Run the test script to verify system integrity:
```bash
node test-achievements.js
```

The test validates:
- Data file accessibility
- Data structure integrity
- Team member validation
- Achievement type distribution
- Status distribution
- Atomic file operations

## Maintenance

### Backup
The system automatically creates temporary files during write operations for data safety.

### Monitoring
Check the admin interface regularly for:
- Pending verification achievements
- Data integrity
- Error logs in browser console

### Updates
When updating the system:
1. Test in development environment first
2. Backup data file before deployment
3. Verify all CRUD operations work correctly
4. Check public page displays correctly

## Troubleshooting

### Common Issues

**Data not updating on public site**
- Check if admin changes are being saved
- Verify API routes are working
- Check browser cache

**Form validation errors**
- Ensure all required fields are filled
- Check email format for team members
- Verify achievement type matches requirements

**File permission errors**
- Ensure `/data/` directory is writable
- Check file permissions on data file

### Support
For technical issues, check:
1. Browser console for JavaScript errors
2. Server logs for API errors
3. File system permissions
4. Network connectivity for API calls

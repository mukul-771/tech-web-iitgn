import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getAdminEmails, 
  addAdminEmail, 
  removeAdminEmail, 
  updateAdminEmails 
} from '@/lib/admin-emails-blob-storage';

// GET - Fetch admin emails
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const adminEmailsData = await getAdminEmails();
    return NextResponse.json(adminEmailsData);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin emails' },
      { status: 500 }
    );
  }
}

// POST - Add admin email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }
    
    const modifiedBy = session.user.email || session.user.name || 'Unknown Admin';
    const updatedData = await addAdminEmail(email.trim(), modifiedBy);
    
    return NextResponse.json({
      message: 'Admin email added successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error adding admin email:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add admin email' },
      { status: 500 }
    );
  }
}

// PUT - Update admin emails (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { emails } = body;
    
    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }
    
    // Trim all emails
    const trimmedEmails = emails.map(email => email.trim()).filter(email => email.length > 0);
    
    const modifiedBy = session.user.email || session.user.name || 'Unknown Admin';
    const updatedData = await updateAdminEmails(trimmedEmails, modifiedBy);
    
    return NextResponse.json({
      message: 'Admin emails updated successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating admin emails:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update admin emails' },
      { status: 500 }
    );
  }
}

// DELETE - Remove admin email
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    const modifiedBy = session.user.email || session.user.name || 'Unknown Admin';
    const updatedData = await removeAdminEmail(email, modifiedBy);
    
    return NextResponse.json({
      message: 'Admin email removed successfully',
      data: updatedData
    });
  } catch (error) {
    console.error('Error removing admin email:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to remove admin email' },
      { status: 500 }
    );
  }
}

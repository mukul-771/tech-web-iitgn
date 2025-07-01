import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateTeamMember, deleteTeamMember } from '@/lib/db/team';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    const isAuthenticated = session?.user?.email;
    const isAdmin = isAuthenticated && (
      session?.user?.email?.endsWith('@iitgn.ac.in') || 
      session?.user?.email === 'mukulmee771@gmail.com'
    );
    
    if (!isAuthenticated || !isAdmin) {
      console.log('Unauthorized access attempt. Email:', session?.user?.email, 'Is admin:', isAdmin);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    console.log('Updating team member:', id, 'with data:', data);

    try {
      const updatedMember = await updateTeamMember(id, data);
      
      console.log('Team member updated successfully:', id);
      return NextResponse.json({ 
        success: true, 
        message: 'Team member updated successfully',
        data: updatedMember
      });
    } catch (error) {
      console.error('Error updating team member in storage:', error);
      
      // Check if it's a "not found" error
      if (error instanceof Error && error.message === 'Team member not found') {
        console.log('Team member not found:', id);
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    const isAuthenticated = session?.user?.email;
    const isAdmin = isAuthenticated && (
      session?.user?.email?.endsWith('@iitgn.ac.in') || 
      session?.user?.email === 'mukulmee771@gmail.com'
    );
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
      await deleteTeamMember(id);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Team member deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting team member from storage:', error);
      
      // Check if it's a "not found" error
      if (error instanceof Error && error.message === 'Team member not found') {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}

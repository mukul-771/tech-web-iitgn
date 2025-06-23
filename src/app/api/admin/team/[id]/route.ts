import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

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

    // Read the current team data
    const teamDataPath = path.join(process.cwd(), 'data', 'team.json');
    
    if (!fs.existsSync(teamDataPath)) {
      console.error('Team data file not found:', teamDataPath);
      return NextResponse.json({ error: 'Team data file not found' }, { status: 500 });
    }

    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));

    // Check if the team member exists
    if (!teamData[id]) {
      console.log('Team member not found:', id, 'Available IDs:', Object.keys(teamData));
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Update the team member data
    teamData[id] = {
      ...teamData[id],
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Write back to the file
    fs.writeFileSync(teamDataPath, JSON.stringify(teamData, null, 2));

    console.log('Team member updated successfully:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'Team member updated successfully',
      data: teamData[id]
    });
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

    // Read the current team data
    const teamDataPath = path.join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));

    // Check if the team member exists
    if (!teamData[id]) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Delete the team member
    delete teamData[id];

    // Write back to the file
    fs.writeFileSync(teamDataPath, JSON.stringify(teamData, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}

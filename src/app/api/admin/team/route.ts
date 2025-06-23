import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load team data from JSON file
    const teamDataPath = path.join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));
    return NextResponse.json(teamData);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Generate ID from name (lowercase, spaces to hyphens)
    const id = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Read the current team data
    const teamDataPath = path.join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));

    // Check if team member already exists
    if (teamData[id]) {
      return NextResponse.json({ error: 'Team member with this name already exists' }, { status: 400 });
    }

    // Create new team member
    const newMember = {
      id,
      name: data.name,
      position: data.position,
      email: data.email,
      initials: data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      gradientFrom: data.gradientFrom || 'from-blue-600',
      gradientTo: data.gradientTo || 'to-purple-600',
      category: data.category,
      photoPath: data.photoPath || '',
      isSecretary: data.category === 'leadership' && data.position.toLowerCase().includes('secretary'),
      isCoordinator: data.category === 'coordinator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to team data
    teamData[id] = newMember;

    // Write back to the file
    fs.writeFileSync(teamDataPath, JSON.stringify(teamData, null, 2));

    return NextResponse.json({ 
      success: true,
      message: 'Team member created successfully',
      data: newMember
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // For now, just return success - in a real app you'd save to database
    console.log('Would update team member:', data.id, data);
    return NextResponse.json({ message: 'Team member update not implemented without database' });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

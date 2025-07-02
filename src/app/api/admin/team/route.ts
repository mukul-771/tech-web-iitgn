import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllTeamMembers, createTeamMember } from '@/lib/db/team';

export async function GET() {
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

    console.log('🚀 Admin Team API: Fetching team members for authenticated admin...');
    
    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    // Load team data from Neon database
    const teamData = await getAllTeamMembers();
    console.log(`✅ Admin Team API: Successfully returned ${teamData.length} team members`);
    return NextResponse.json(teamData);
  } catch (error) {
    console.error('❌ Admin Team API: Error fetching team members:', error);
    console.error('Database URL available:', !!process.env.DATABASE_URL);
    return NextResponse.json({ 
      error: `Failed to fetch team members: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const data = await request.json();
    
    // Create team member in Neon database
    const newMember = await createTeamMember({
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      position: data.position,
      email: data.email,
      initials: data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      gradientFrom: data.gradientFrom || 'from-blue-600',
      gradientTo: data.gradientTo || 'to-purple-600',
      category: data.category,
      photoPath: data.photoPath || null,
      isSecretary: data.category === 'leadership' && data.position.toLowerCase().includes('secretary'),
      isCoordinator: data.category === 'coordinator'
    });

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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInterIITAchievementById, updateInterIITAchievement, deleteInterIITAchievement } from '@/lib/inter-iit-achievements-storage';

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievement = await getInterIITAchievementById(id);
    
    if (!achievement) {
      return NextResponse.json(
        { error: 'Inter-IIT achievement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error fetching Inter-IIT achievement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Inter-IIT achievement' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'achievementType', 'competitionName', 'interIITEdition', 'year', 
      'hostIIT', 'location', 'achievementDescription', 'significance', 
      'competitionCategory', 'achievementDate', 'status'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    const updatedAchievement = await updateInterIITAchievement(id, body);
    return NextResponse.json(updatedAchievement);
  } catch (error) {
    console.error('Error updating Inter-IIT achievement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update Inter-IIT achievement' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteInterIITAchievement(id);
    return NextResponse.json({ message: 'Inter-IIT achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting Inter-IIT achievement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete Inter-IIT achievement' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getInterIITAchievementById, updateInterIITAchievement, deleteInterIITAchievement } from '@/lib/inter-iit-achievements-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
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

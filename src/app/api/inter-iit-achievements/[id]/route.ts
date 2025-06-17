import { NextRequest, NextResponse } from 'next/server';
import { getInterIITAchievementById } from '@/lib/inter-iit-achievements-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

import { NextResponse } from 'next/server';
import { getInterIITAchievementsForDisplay } from '@/lib/inter-iit-achievements-blob-storage';

export async function GET() {
  try {
    const achievements = await getInterIITAchievementsForDisplay();
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching Inter-IIT achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Inter-IIT achievements' },
      { status: 500 }
    );
  }
}

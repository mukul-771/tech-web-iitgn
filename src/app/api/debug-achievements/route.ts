import { NextResponse } from 'next/server';
import { getInterIITAchievementsForDisplay } from '@/lib/inter-iit-achievements-blob-storage';

export async function GET() {
  try {
    const achievements = await getInterIITAchievementsForDisplay();
    const response = {
      timestamp: new Date().toISOString(),
      count: achievements.length,
      firstAchievement: achievements[0] ? {
        id: achievements[0].id,
        description: achievements[0].achievementDescription,
        updatedAt: achievements[0].updatedAt
      } : null,
      summary: achievements.map(a => ({
        id: a.id,
        description: a.achievementDescription.substring(0, 50) + '...',
        updatedAt: a.updatedAt
      }))
    };
    
    const responseObject = NextResponse.json(response);
    
    // Add headers to prevent caching
    responseObject.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    responseObject.headers.set('Pragma', 'no-cache');
    responseObject.headers.set('Expires', '0');
    
    return responseObject;
  } catch (error) {
    console.error('Error in debug achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements debug info' },
      { status: 500 }
    );
  }
}

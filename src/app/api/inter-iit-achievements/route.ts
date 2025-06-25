import { NextResponse } from 'next/server';
import { getInterIITAchievementsForDisplay } from '@/lib/inter-iit-achievements-blob-storage';

export async function GET() {
  try {
    const achievements = await getInterIITAchievementsForDisplay();
    const response = NextResponse.json(achievements);
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Error fetching Inter-IIT achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Inter-IIT achievements' },
      { status: 500 }
    );
  }
}

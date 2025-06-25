import { NextResponse } from 'next/server';
import { getEventsForDisplay } from '@/lib/events-blob-storage';

export async function GET() {
  try {
    const events = await getEventsForDisplay();
    
    const response = NextResponse.json(events);
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

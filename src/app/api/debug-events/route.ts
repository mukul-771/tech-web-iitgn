import { NextResponse } from 'next/server';
import { getEventsForDisplay } from '@/lib/events-blob-storage';

export async function GET() {
  try {
    const events = await getEventsForDisplay();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      count: events.length,
      firstEvent: events[0] ? {
        id: events[0].id,
        title: events[0].title,
        updatedAt: events[0].updatedAt
      } : null,
      summary: events.map(event => ({
        id: event.id,
        title: event.title.substring(0, 50) + (event.title.length > 50 ? '...' : ''),
        updatedAt: event.updatedAt
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

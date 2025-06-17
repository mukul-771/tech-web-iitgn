import { NextRequest, NextResponse } from 'next/server';
import { getInterIITEventsForDisplay } from '@/lib/inter-iit-storage';

export async function GET() {
  try {
    const events = await getInterIITEventsForDisplay();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching Inter-IIT events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Inter-IIT events' },
      { status: 500 }
    );
  }
}

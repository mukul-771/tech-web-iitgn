import { NextRequest, NextResponse } from 'next/server';
import { getInterIITEventById } from '@/lib/inter-iit-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getInterIITEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Inter-IIT event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching Inter-IIT event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Inter-IIT event' },
      { status: 500 }
    );
  }
}

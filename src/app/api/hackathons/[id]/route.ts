import { NextRequest, NextResponse } from 'next/server';
import { getHackathonById } from '@/lib/hackathons-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hackathon = await getHackathonById(id);
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hackathon);
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathon' },
      { status: 500 }
    );
  }
}

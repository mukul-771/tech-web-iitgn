import { NextRequest, NextResponse } from 'next/server';
import { getHackathonById, updateHackathon, deleteHackathon } from '@/lib/hackathons-storage';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'longDescription', 'date', 'location', 'category', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const updatedHackathon = await updateHackathon(id, body);
    return NextResponse.json(updatedHackathon);
  } catch (error) {
    console.error('Error updating hackathon:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update hackathon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteHackathon(id);
    return NextResponse.json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    console.error('Error deleting hackathon:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete hackathon' },
      { status: 500 }
    );
  }
}

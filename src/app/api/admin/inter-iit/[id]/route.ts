import { NextRequest, NextResponse } from 'next/server';
import { getInterIITEventById, updateInterIITEvent, deleteInterIITEvent } from '@/lib/inter-iit-storage';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'year', 'description', 'longDescription', 'location', 'hostIIT', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const updatedEvent = await updateInterIITEvent(id, body);
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating Inter-IIT event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update Inter-IIT event' },
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
    await deleteInterIITEvent(id);
    return NextResponse.json({ message: 'Inter-IIT event deleted successfully' });
  } catch (error) {
    console.error('Error deleting Inter-IIT event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete Inter-IIT event' },
      { status: 500 }
    );
  }
}

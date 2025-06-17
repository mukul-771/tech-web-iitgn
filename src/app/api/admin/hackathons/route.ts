import { NextRequest, NextResponse } from 'next/server';
import { getAllHackathons, createHackathon } from '@/lib/hackathons-storage';
import { Hackathon } from '@/lib/hackathons-data';

export async function GET() {
  try {
    const hackathons = await getAllHackathons();
    const hackathonsArray = Object.values(hackathons).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json(hackathonsArray);
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Ensure arrays are properly initialized
    const hackathonData = {
      ...body,
      prizes: body.prizes || [],
      organizers: body.organizers || [],
      requirements: body.requirements || [],
      schedule: body.schedule || [],
      sponsors: body.sponsors || [],
      winners: body.winners || [],
      gallery: body.gallery || []
    };
    
    const newHackathon = await createHackathon(hackathonData);
    return NextResponse.json(newHackathon, { status: 201 });
  } catch (error) {
    console.error('Error creating hackathon:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create hackathon' },
      { status: 500 }
    );
  }
}

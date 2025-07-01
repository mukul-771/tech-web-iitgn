import { NextResponse } from "next/server";
import { getAllTeamMembers } from '@/lib/db/team';

export async function GET() {
  try {
    // Load team data from Neon database
    const teamMembers = await getAllTeamMembers();
    
    // Filter for leadership (secretary and coordinators)
    const leadership = teamMembers.filter(member => 
      member.isSecretary || member.isCoordinator || member.category === 'leadership'
    );

    return NextResponse.json(leadership);
  } catch (error) {
    console.error('Error fetching leadership team:', error);
    return NextResponse.json({ error: 'Failed to fetch leadership team' }, { status: 500 });
  }
}

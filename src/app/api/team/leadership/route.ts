import { NextResponse } from "next/server";
import { getAllTeamMembers, TeamMember } from '@/lib/team-storage';

export async function GET() {
  try {
    // Load team data from Blob storage
    const teamData = await getAllTeamMembers();
    const teamMembers = Object.values(teamData);
    
    // Filter for leadership (secretary and coordinators)
    const leadership = teamMembers.filter((member: TeamMember) => 
      member.isSecretary || member.isCoordinator || member.category === 'leadership'
    );

    return NextResponse.json(leadership);
  } catch (error) {
    console.error('Error fetching leadership team:', error);
    return NextResponse.json({ error: 'Failed to fetch leadership team' }, { status: 500 });
  }
}

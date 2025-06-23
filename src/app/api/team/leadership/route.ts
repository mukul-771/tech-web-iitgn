import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Load team data from JSON file
    const teamDataPath = path.join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));
    const teamMembers = Object.values(teamData);
    
    // Filter for leadership (secretary and coordinators)
    const leadership = teamMembers.filter((member: any) => 
      member.isSecretary || member.isCoordinator || member.category === 'leadership'
    );

    return NextResponse.json(leadership);
  } catch (error) {
    console.error('Error fetching leadership team:', error);
    return NextResponse.json({ error: 'Failed to fetch leadership team' }, { status: 500 });
  }
}

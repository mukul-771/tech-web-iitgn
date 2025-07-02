import { NextResponse } from "next/server";
import { getAllTeamMembers } from '@/lib/db/team';

export async function GET() {
  try {
    console.log('🚀 Team API: Starting to fetch team members...');
    
    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }
    
    // Load team data from Neon database
    const teamData = await getAllTeamMembers();
    console.log(`✅ Team API: Successfully returned ${teamData.length} team members`);
    return NextResponse.json(teamData);
  } catch (error) {
    console.error("❌ Team API: Error fetching team members:", error);
    return NextResponse.json(
      { error: `Failed to fetch team members: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getTeamMemberById } from '@/lib/db/team';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 Individual Team Member API: Starting...');
    
    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }
    
    const { id } = await params;
    console.log(`🔍 Looking for team member with ID: ${id}`);
    
    // Load team member data from Neon database
    const teamMember = await getTeamMemberById(id);
    
    if (!teamMember) {
      console.log(`⚠️ Team member not found: ${id}`);
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }
    
    console.log(`✅ Individual Team Member API: Successfully returned member ${teamMember.name}`);
    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("❌ Individual Team Member API: Error fetching team member:", error);
    return NextResponse.json(
      { error: `Failed to fetch team member: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

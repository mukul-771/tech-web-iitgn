import { NextResponse } from "next/server";
import { getAllTeamMembers } from '@/lib/db/team';

export async function GET() {
  try {
    // Load team data from Neon database
    const teamData = await getAllTeamMembers();
    return NextResponse.json(teamData);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

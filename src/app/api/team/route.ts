import { NextResponse } from "next/server";
import { getAllTeamMembers } from "@/lib/team-firebase";

export async function GET() {
  try {
    const teamMembers = await getAllTeamMembers();
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

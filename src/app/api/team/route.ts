import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Load team data from JSON file
    const teamDataPath = path.join(process.cwd(), 'data', 'team.json');
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));
    return NextResponse.json(teamData);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

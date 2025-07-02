import { NextResponse } from "next/server";
import { getAllClubs } from '@/lib/db/clubs';

// GET /api/clubs - Get all clubs for public display  
export async function GET() {
  try {
    const clubs = await getAllClubs();
    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getClubsForDisplay } from "@/lib/clubs-storage";

// GET /api/clubs - Get all clubs for public display
export async function GET() {
  try {
    const clubs = await getClubsForDisplay();
    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { error: "Failed to fetch clubs" },
      { status: 500 }
    );
  }
}

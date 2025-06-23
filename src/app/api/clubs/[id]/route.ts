import { NextRequest, NextResponse } from "next/server";
import { getClubById } from "@/lib/clubs-blob-storage";

// GET /api/clubs/[id] - Get single club for public display
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const club = await getClubById(resolvedParams.id);

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error("Error fetching club:", error);
    return NextResponse.json(
      { error: "Failed to fetch club" },
      { status: 500 }
    );
  }
}

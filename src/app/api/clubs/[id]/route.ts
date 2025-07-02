import { NextRequest, NextResponse } from "next/server";
import { getClubById } from "@/lib/db/clubs";

// GET /api/clubs/[id] - Get single club for public display
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = resolvedParams.id.split(':')[0];
    console.log('GET Public Club request:', { originalId: resolvedParams.id, cleanId: cleanClubId });
    
    const club = await getClubById(cleanClubId);

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

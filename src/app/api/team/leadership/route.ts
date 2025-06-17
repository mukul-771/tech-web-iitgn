import { NextResponse } from "next/server";
import { getLeadershipTeam } from "@/lib/team-storage";

// GET /api/team/leadership - Get leadership team (secretary + coordinators) for public display
export async function GET() {
  try {
    const leadership = await getLeadershipTeam();
    
    // Format for public display
    const publicLeadership = {
      secretary: leadership.secretary ? {
        id: leadership.secretary.id,
        name: leadership.secretary.name,
        position: leadership.secretary.position,
        email: leadership.secretary.email,
        initials: leadership.secretary.initials,
        gradientFrom: leadership.secretary.gradientFrom,
        gradientTo: leadership.secretary.gradientTo,
        photoPath: leadership.secretary.photoPath
      } : null,
      coordinators: leadership.coordinators.map(coord => ({
        id: coord.id,
        name: coord.name,
        position: coord.position,
        email: coord.email,
        initials: coord.initials,
        gradientFrom: coord.gradientFrom,
        gradientTo: coord.gradientTo,
        photoPath: coord.photoPath
      }))
    };

    return NextResponse.json(publicLeadership);
  } catch (error) {
    console.error("Error fetching leadership team:", error);
    return NextResponse.json(
      { error: "Failed to fetch leadership team" },
      { status: 500 }
    );
  }
}

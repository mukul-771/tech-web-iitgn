import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setLatestMagazine } from "@/lib/torque-storage";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/torque/[id]/set-latest - Set magazine as latest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const magazineId = resolvedParams.id;
    
    if (!magazineId) {
      return NextResponse.json({ error: "Magazine ID is required" }, { status: 400 });
    }

    await setLatestMagazine(magazineId);

    return NextResponse.json({ message: "Magazine set as latest successfully" });
  } catch (error) {
    console.error("Error setting latest magazine:", error);
    
    // Provide more specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to set latest magazine: ${errorMessage}` },
      { status: 500 }
    );
  }
}

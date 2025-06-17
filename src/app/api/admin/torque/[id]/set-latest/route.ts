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
    const success = await setLatestMagazine(resolvedParams.id);

    if (!success) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Magazine set as latest successfully" });
  } catch (error) {
    console.error("Error setting latest magazine:", error);
    return NextResponse.json(
      { error: "Failed to set latest magazine" },
      { status: 500 }
    );
  }
}

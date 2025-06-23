import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClubById, updateClub, deleteClub } from "@/lib/clubs-blob-storage";
import { z } from "zod";

// Validation schema for club updates
const updateClubSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  longDescription: z.string().min(1).optional(),
  type: z.enum(["club", "hobby-group", "technical-council-group"]).optional(),
  category: z.string().min(1).optional(),
  email: z.string().email().optional(),
  members: z.string().optional(),
  established: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  team: z.array(z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email()
  })).optional(),
  logoPath: z.string().optional()
});

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// GET /api/admin/clubs/[id] - Get single club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

// PUT /api/admin/clubs/[id] - Update club
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateClubSchema.parse(body);

    // Update club
    const updatedClub = await updateClub(resolvedParams.id, validatedData);

    if (!updatedClub) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json(updatedClub);
  } catch (error) {
    console.error("Error updating club:", {
      clubId: (await params).id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to update club",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs/[id] - Delete club
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const success = await deleteClub(resolvedParams.id);

    if (!success) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error("Error deleting club:", error);
    return NextResponse.json(
      { error: "Failed to delete club" },
      { status: 500 }
    );
  }
}

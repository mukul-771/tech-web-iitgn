import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClubById, updateClub, deleteClub } from "@/lib/clubs-blob-storage";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema for club updates
const updateClubSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  longDescription: z.string().min(1).optional(),
  type: z.enum(["club", "hobby-group", "technical-council-group"]).optional(),
  category: z.string().min(1).optional(),
  email: z.string().email().optional(),
  members: z.string().optional().transform(val => val === "" ? undefined : val),
  established: z.string().optional().transform(val => val === "" ? undefined : val),
  achievements: z.array(z.string()).optional().default([]),
  projects: z.array(z.string()).optional().default([]),
  team: z.array(z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email()
  })).optional().default([]),
  logoPath: z.string().optional().transform(val => val === "" ? undefined : val)
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
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = resolvedParams.id.split(':')[0];
    console.log('GET Club request - originalId:', resolvedParams.id, 'cleanId:', cleanClubId, 'URL:', request.url);
    console.log('GET Club request - Full URL with query params:', request.url);
    console.log('GET Club request - User-Agent:', request.headers.get('user-agent'));
    console.log('GET Club request - Cache-Control:', request.headers.get('cache-control'));
    
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
    const clubId = resolvedParams.id;
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId.split(':')[0];
    
    console.log('PUT Club request - originalId:', clubId, 'cleanId:', cleanClubId, 'URL:', request.url);
    console.log('PUT Club request - Full URL with query params:', request.url);
    console.log('PUT Club request - User-Agent:', request.headers.get('user-agent'));
    console.log('PUT Club request - Cache-Control:', request.headers.get('cache-control'));
    
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));

    // Validate request body
    const validatedData = updateClubSchema.parse(body);
    console.log('Validation passed');

    // Update club
    const updatedClub = await updateClub(cleanClubId, validatedData);

    if (!updatedClub) {
      console.log('Club not found after update attempt');
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Revalidate the path for the updated club
    revalidatePath(`/admin/clubs/${cleanClubId}`);

    // Revalidate paths to clear cache and ensure fresh data
    revalidatePath(`/admin/clubs`);
    revalidatePath(`/admin/clubs/${cleanClubId}/edit`);
    revalidatePath(`/clubs`);
    revalidatePath(`/clubs/${cleanClubId}`);

    console.log('Club updated successfully');
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
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = resolvedParams.id.split(':')[0];
    console.log('DELETE Club request:', { originalId: resolvedParams.id, cleanId: cleanClubId });
    
    const success = await deleteClub(cleanClubId);

    if (!success) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Revalidate paths to clear cache
    revalidatePath(`/admin/clubs`);
    revalidatePath(`/admin/clubs/${cleanClubId}/edit`);
    revalidatePath(`/clubs`);
    revalidatePath(`/clubs/${cleanClubId}`);

    return NextResponse.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error("Error deleting club:", error);
    return NextResponse.json(
      { error: "Failed to delete club" },
      { status: 500 }
    );
  }
}

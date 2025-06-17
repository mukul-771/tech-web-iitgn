import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMagazineById, updateMagazine, deleteMagazine, setLatestMagazine } from "@/lib/torque-storage";
import { z } from "zod";

// Validation schema for magazine updates
const updateMagazineSchema = z.object({
  year: z.string().min(4).optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  pages: z.number().min(1).optional(),
  articles: z.number().min(1).optional(),
  featured: z.string().min(1).optional(),
  filePath: z.string().min(1).optional(),
  fileName: z.string().min(1).optional(),
  fileSize: z.number().min(1).optional(),
  coverPhoto: z.string().nullable().optional(),
  coverPhotoFileName: z.string().nullable().optional(),
  isLatest: z.boolean().optional()
});

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// GET /api/admin/torque/[id] - Get single magazine
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
    const magazine = await getMagazineById(resolvedParams.id);

    if (!magazine) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    return NextResponse.json(magazine);
  } catch (error) {
    console.error("Error fetching magazine:", error);
    return NextResponse.json(
      { error: "Failed to fetch magazine" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/torque/[id] - Update magazine
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
    const validatedData = updateMagazineSchema.parse(body);

    // Filter out null values and convert to undefined for optional fields
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [
        key,
        value === null ? undefined : value
      ])
    );

    // Update magazine
    const updatedMagazine = await updateMagazine(resolvedParams.id, cleanedData);

    if (!updatedMagazine) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMagazine);
  } catch (error) {
    console.error("Error updating magazine:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update magazine" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/torque/[id] - Delete magazine
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
    const success = await deleteMagazine(resolvedParams.id);

    if (!success) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Magazine deleted successfully" });
  } catch (error) {
    console.error("Error deleting magazine:", error);
    return NextResponse.json(
      { error: "Failed to delete magazine" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllClubs, createClub } from "@/lib/clubs-storage";
import { z } from "zod";

// Validation schema for club creation
const createClubSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().min(1, "Long description is required"),
  type: z.enum(["club", "hobby-group", "technical-council-group"]),
  category: z.string().min(1, "Category is required"),
  email: z.string().email("Valid email is required"),
  members: z.string().optional().default(""),
  established: z.string().optional().default(""),
  achievements: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  team: z.array(z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email()
  })).default([]),
  logoPath: z.string().optional()
});

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  console.log("Auth check - session:", session);
  console.log("Auth check - isAdmin:", session?.user?.isAdmin);

  if (!session?.user?.isAdmin) {
    return false;
  }

  return true;
}

// GET /api/admin/clubs - Get all clubs
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

// POST /api/admin/clubs - Create new club
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Creating club with data:", body);

    // Validate request body
    const validatedData = createClubSchema.parse(body);

    // Create club
    const newClub = await createClub(validatedData);

    return NextResponse.json(newClub, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create club" },
      { status: 500 }
    );
  }
}

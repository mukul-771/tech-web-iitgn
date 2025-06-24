import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllMagazines, createMagazine } from "@/lib/torque-storage";
import { z } from "zod";
import { TorqueMagazineInput } from "@/lib/torque-magazine.model";

// Validation schema for magazine creation
const createMagazineSchema = z.object({
  year: z.string().min(4, "Year is required (YYYY format)"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  pages: z.number().min(1, "Pages must be at least 1"),
  articles: z.number().min(1, "Articles must be at least 1"),
  featured: z.string().min(1, "Featured article is required"),
  filePath: z.string().min(1, "File path is required"),
  coverPhoto: z.string().optional(),
  isLatest: z.boolean().optional().default(false)
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

// GET /api/admin/torque - Get all magazines
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const magazines = await getAllMagazines();
    return NextResponse.json(magazines);
  } catch (error) {
    console.error("Error fetching magazines:", error);
    return NextResponse.json(
      { error: "Failed to fetch magazines" },
      { status: 500 }
    );
  }
}

// POST /api/admin/torque - Create new magazine
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    console.log("Creating magazine with data:", body);
    // Validate request body
    const validatedData = createMagazineSchema.parse(body) as TorqueMagazineInput;
    // Create magazine
    const newMagazine = await createMagazine(validatedData);
    return NextResponse.json(newMagazine, { status: 201 });
  } catch (error) {
    console.error("Error creating magazine:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create magazine" },
      { status: 500 }
    );
  }
}

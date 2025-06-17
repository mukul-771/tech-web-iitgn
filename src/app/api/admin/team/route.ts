import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllTeamMembers, createTeamMember } from "@/lib/team-storage";
import { z } from "zod";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// Validation schema for creating team member
const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  position: z.string().min(1, "Position is required"),
  category: z.string().min(1, "Category is required"),
  initials: z.string().min(1, "Initials are required"),
  gradientFrom: z.string().min(1, "Gradient from color is required"),
  gradientTo: z.string().min(1, "Gradient to color is required"),
  photoPath: z.string().optional(),
  isSecretary: z.boolean().optional(),
  isCoordinator: z.boolean().optional(),
});

// GET /api/admin/team - Get all team members for admin
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamMembers = await getAllTeamMembers();
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST /api/admin/team - Create new team member
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Creating team member with data:", body);

    // Validate request body
    const validatedData = createTeamMemberSchema.parse(body);

    // Create team member
    const newMember = await createTeamMember(validatedData);

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

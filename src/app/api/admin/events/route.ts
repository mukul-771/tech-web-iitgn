import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEvents, createEvent, migrateEventsFromFileSystem } from "@/lib/events-blob-storage";
import { z } from "zod";

// Validation schema for event creation
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional().default("IITGN Campus"),
  duration: z.string().optional().default("1 day"),
  participants: z.string().optional().default("50+"),
  organizer: z.string().optional().default("Technical Council"),
  category: z.string().min(1, "Category is required"),
  highlights: z.array(z.string()).default([]),
  gallery: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string(),
    caption: z.string().optional()
  })).default([]),
  draft: z.boolean().optional().default(false)
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

// GET /api/admin/events - Get all events
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure data is migrated to Blob
    await migrateEventsFromFileSystem();

    const events = await getAllEvents();
    
    // Return the events object with IDs as keys for admin interface
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  console.log("POST /api/admin/events - Request received!");
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received body:", body);

    // Validate request body with updated schema v2
    const validatedData = createEventSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Transform form data to Event format
    const eventData = {
      title: validatedData.title,
      description: validatedData.description,
      date: validatedData.date,
      location: validatedData.location,
      duration: validatedData.duration,
      participants: validatedData.participants,
      organizer: validatedData.organizer,
      category: validatedData.category,
      highlights: validatedData.highlights.length > 0 ? validatedData.highlights : [
        "Engaging sessions and activities",
        "Learning opportunities",
        "Networking with peers"
      ],
      gallery: validatedData.gallery
    };

    // Create event
    const newEvent = await createEvent(eventData);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

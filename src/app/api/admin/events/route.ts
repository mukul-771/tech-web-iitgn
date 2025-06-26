import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEvents, createEvent } from "@/lib/db/events";
import { z } from "zod";

// Validation schema for event creation
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  duration: z.string().optional(),
  participants: z.string().optional(),
  organizer: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  highlights: z.array(z.string()).optional().default([]),
  gallery: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string(),
    caption: z.string().optional()
  })).optional().default([]),
  draft: z.boolean().optional().default(false)
});

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// GET /api/admin/events - Get all events
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await getAllEvents();
    
    // Convert array to object with IDs as keys for admin interface compatibility
    const eventsObject = events.reduce((acc, event) => {
      acc[event.id] = event;
      return acc;
    }, {} as Record<string, typeof events[0]>);
    
    return NextResponse.json(eventsObject, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
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
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createEventSchema.parse(body);

    // Transform form data to Event format - only use defaults for empty/missing fields
    const eventData = {
      title: validatedData.title,
      description: validatedData.description,
      date: validatedData.date,
      location: validatedData.location && validatedData.location.trim() ? validatedData.location : "IITGN Campus",
      duration: validatedData.duration && validatedData.duration.trim() ? validatedData.duration : "1 day", 
      participants: validatedData.participants && validatedData.participants.trim() ? validatedData.participants : "50+",
      organizer: validatedData.organizer && validatedData.organizer.trim() ? validatedData.organizer : "Technical Council",
      category: validatedData.category,
      highlights: validatedData.highlights || [],
      gallery: validatedData.gallery || []
    };

    // Create event
    const newEvent = await createEvent(eventData);

    return NextResponse.json(newEvent, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
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

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db/events";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schema for event updates
const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  duration: z.string().min(1).optional(),
  participants: z.string().min(1).optional(),
  organizer: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  highlights: z.array(z.string()).optional(),
  gallery: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string(),
    caption: z.string().optional()
  })).optional()
});

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// GET /api/admin/events/[id] - Get single event
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
    const event = await getEventById(resolvedParams.id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Update event
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
    const validatedData = updateEventSchema.parse(body);

    // Update event
    const updatedEvent = await updateEvent(resolvedParams.id, validatedData);

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Revalidate relevant paths to clear cache
    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${resolvedParams.id}/edit`);
    revalidatePath('/achievements');
    revalidatePath(`/achievements/events/${resolvedParams.id}`);
    console.log(`Revalidated paths for event: ${resolvedParams.id}`);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Delete event
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
    await deleteEvent(resolvedParams.id);

    // Revalidate relevant paths
    revalidatePath('/admin/events');
    revalidatePath('/achievements');
    revalidatePath(`/achievements/events/${resolvedParams.id}`);
    console.log(`Deleted event ${resolvedParams.id} and revalidated paths.`);

    return NextResponse.json({ 
      message: "Event deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to delete event",
        success: false 
      },
      { status: 500 }
    );
  }
}

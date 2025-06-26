import { db, events, type Event, type NewEvent } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Get all events
export async function getAllEvents(): Promise<Event[]> {
  try {
    const allEvents = await db.select().from(events);
    return allEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

// Get events for public display (non-draft only)
export async function getEventsForDisplay(): Promise<Event[]> {
  try {
    const publicEvents = await db
      .select()
      .from(events)
      .where(eq(events.draft, false));
    
    // Sort by creation date (most recent first)
    return publicEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error fetching events for display:', error);
    throw new Error('Failed to fetch events for display');
  }
}

// Get event by ID
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    return event[0] || null;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw new Error('Failed to fetch event');
  }
}

// Create new event
export async function createEvent(
  event: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Event> {
  try {
    // Generate ID from title
    const baseId = event.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    
    // Check if ID already exists and make it unique
    let uniqueId = baseId;
    let counter = 1;
    
    while (true) {
      const existing = await getEventById(uniqueId);
      if (!existing) break;
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    const newEvent: NewEvent = {
      ...event,
      id: uniqueId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(events).values(newEvent).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
}

// Update event
export async function updateEvent(
  id: string,
  updates: Partial<Omit<NewEvent, 'id' | 'createdAt'>>
): Promise<Event> {
  try {
    const result = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('Event not found');
    }

    return result[0];
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
}

// Delete event
export async function deleteEvent(id: string): Promise<void> {
  try {
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('Event not found');
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
}

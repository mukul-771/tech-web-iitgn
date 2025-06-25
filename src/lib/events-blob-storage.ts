import { put, list } from '@vercel/blob';
import { Event, defaultEventsData } from './events-data';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Fallback file-based storage for development
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// Vercel Blob configuration
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const EVENTS_BLOB_URL = 'events-data.json';

// Ensure data directory exists (development only)
async function ensureDataDir() {
  if (!isDevelopment) return;
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize events file if it doesn't exist (development only)
async function initializeEventsFile() {
  if (!isDevelopment) return;
  try {
    await fs.access(EVENTS_FILE);
  } catch {
    await fs.writeFile(EVENTS_FILE, JSON.stringify(defaultEventsData, null, 2));
  }
}

// Get all events
export async function getAllEvents(): Promise<Record<string, Event>> {
  try {
    if (isDevelopment) {
      // Use file-based storage in development
      await ensureDataDir();
      await initializeEventsFile();
      
      const data = await fs.readFile(EVENTS_FILE, 'utf-8');
      return JSON.parse(data);
    } else {
      // Use Vercel Blob in production
      if (!BLOB_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not found, using default data');
        return defaultEventsData;
      }

      try {
        // List all blobs to find our events data file
        const { blobs } = await list({
          token: BLOB_TOKEN,
          prefix: 'events-data'
        });

        // Find the events data blob
        const eventsBlob = blobs.find(blob => blob.pathname === EVENTS_BLOB_URL);
        
        if (!eventsBlob) {
          console.log('Events blob not found, initializing with default data');
          await saveAllEvents(defaultEventsData);
          return defaultEventsData;
        }

        // Fetch and parse the blob data
        const response = await fetch(eventsBlob.url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching events from blob:', error);
        console.log('Falling back to default data');
        return defaultEventsData;
      }
    }
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    return defaultEventsData;
  }
}

// Get events for public display (array format)
export async function getEventsForDisplay(): Promise<Event[]> {
  const events = await getAllEvents();
  return Object.values(events)
    .filter(event => !event.draft) // Only show published events on public pages
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get event by ID
export async function getEventById(id: string): Promise<Event | null> {
  const events = await getAllEvents();
  return events[id] || null;
}

// Save all events with atomic write operation
export async function saveAllEvents(events: Record<string, Event>): Promise<void> {
  try {
    console.log('saveAllEvents called, isDevelopment:', isDevelopment);
    
    if (isDevelopment) {
      // Use file-based storage in development
      console.log('Using file-based storage for events');
      await ensureDataDir();

      // Create temporary file for atomic write
      const tempFile = `${EVENTS_FILE}.tmp`;
      const data = JSON.stringify(events, null, 2);

      // Write to temporary file first
      await fs.writeFile(tempFile, data);

      // Atomically move temp file to final location
      await fs.rename(tempFile, EVENTS_FILE);

      console.log('Events data saved successfully (file)');
    } else {
      // Use Vercel Blob in production
      console.log('Using Vercel Blob storage for events');
      if (!BLOB_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not found');
        throw new Error('BLOB_READ_WRITE_TOKEN not found');
      }

      try {
        // Delete existing blob first if it exists
        try {
          const { blobs } = await list({
            token: BLOB_TOKEN,
            prefix: 'events-data'
          });
          
          const existingBlob = blobs.find(blob => blob.pathname === EVENTS_BLOB_URL);
          if (existingBlob) {
            console.log('Found existing events blob, it will be overwritten');
          }
        } catch (listError) {
          console.log('Could not list existing blobs:', listError);
        }

        console.log('Starting blob upload for events data...');
        
        // Upload new data
        try {
          const blob = await put(EVENTS_BLOB_URL, JSON.stringify(events, null, 2), {
            access: 'public',
            token: BLOB_TOKEN,
            contentType: 'application/json',
            addRandomSuffix: false, // Ensure we overwrite the same blob
            allowOverwrite: true, // Allow overwriting existing events.json
          });
          console.log('Events data saved successfully to blob:', blob.url);
        } catch (putError) {
          console.error('Failed to save events data to blob:', putError);
          throw new Error('Blob storage failed: ' + (putError instanceof Error ? putError.message : String(putError)));
        }
      } catch (blobError) {
        console.error('Vercel Blob save failed:', {
          error: blobError instanceof Error ? blobError.message : blobError,
          stack: blobError instanceof Error ? blobError.stack : undefined,
          type: blobError?.constructor?.name
        });
        throw new Error(`Blob storage failed: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error saving events:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      isDevelopment,
      eventsCount: Object.keys(events).length
    });

    if (isDevelopment) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(`${EVENTS_FILE}.tmp`);
      } catch {
        // Ignore cleanup errors
      }
    }

    throw new Error(`Failed to save events data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create new event
export async function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
  const events = await getAllEvents();
  
  // Generate ID from title and date
  const baseId = `${event.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${event.date.replace(/[^0-9]/g, '')}`;
  
  // Ensure unique ID
  let uniqueId = baseId;
  let counter = 1;
  while (events[uniqueId]) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }

  const newEvent: Event = {
    ...event,
    id: uniqueId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  events[uniqueId] = newEvent;
  await saveAllEvents(events);

  return newEvent;
}

// Update event
export async function updateEvent(id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event> {
  const events = await getAllEvents();
  
  if (!events[id]) {
    throw new Error('Event not found');
  }
  
  const updatedEvent: Event = {
    ...events[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  events[id] = updatedEvent;
  await saveAllEvents(events);
  
  return updatedEvent;
}

// Delete event
export async function deleteEvent(id: string): Promise<void> {
  const events = await getAllEvents();
  
  if (!events[id]) {
    throw new Error('Event not found');
  }
  
  delete events[id];
  await saveAllEvents(events);
}

// Migrate events from file system to blob storage
export async function migrateEventsFromFileSystem(): Promise<void> {
  if (isDevelopment) {
    console.log('Skipping migration in development mode');
    return;
  }

  try {
    console.log('Starting events migration from file system to blob storage...');
    
    // Try to read from old file-based storage
    try {
      await ensureDataDir();
      await initializeEventsFile();
      
      const data = await fs.readFile(EVENTS_FILE, 'utf-8');
      const fileEvents = JSON.parse(data);
      
      console.log('Found file-based events data, migrating to blob storage...');
      await saveAllEvents(fileEvents);
      console.log('Events migration completed successfully');
    } catch (fileError) {
      console.log('No file-based events data found or error reading file:', fileError);
      console.log('Initializing blob storage with default events data...');
      await saveAllEvents(defaultEventsData);
    }
  } catch (error) {
    console.error('Error during events migration:', error);
    throw error;
  }
}

// Get events by category
export async function getEventsByCategory(category: string): Promise<Event[]> {
  const events = await getEventsForDisplay();
  return events.filter(event => event.category.toLowerCase() === category.toLowerCase());
}

// Get recent events
export async function getRecentEvents(limit: number = 6): Promise<Event[]> {
  const events = await getEventsForDisplay();
  return events.slice(0, limit);
}

// Search events
export async function searchEvents(query: string): Promise<Event[]> {
  const events = await getEventsForDisplay();
  const lowercaseQuery = query.toLowerCase();
  
  return events.filter(event => 
    event.title.toLowerCase().includes(lowercaseQuery) ||
    event.description.toLowerCase().includes(lowercaseQuery) ||
    event.organizer.toLowerCase().includes(lowercaseQuery) ||
    event.category.toLowerCase().includes(lowercaseQuery)
  );
}

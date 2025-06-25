import { put, list } from '@vercel/blob';
import type { BasicHackathon } from './hackathons-data';

// Re-export for convenience in other modules
export type { BasicHackathon };

// Store hackathons as JSON in Vercel Blob
const HACKATHONS_BLOB_PATH = 'hackathons-data.json';

// Get all hackathons from Vercel Blob
export async function getAllHackathons(): Promise<Record<string, BasicHackathon>> {
  try {
    const { blobs } = await list({ prefix: HACKATHONS_BLOB_PATH });
    
    if (blobs.length === 0) {
      // If no data exists, return empty object
      return {};
    }
    
    // Add cache busting to ensure fresh data
    const url = `${blobs[0].url}?t=${Date.now()}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hackathons data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error('Error fetching hackathons from blob:', error);
    // Return empty object if there's an error (first time setup)
    return {};
  }
}

// Save all hackathons to Vercel Blob
export async function saveAllHackathons(hackathons: Record<string, BasicHackathon>): Promise<void> {
  try {
    await put(HACKATHONS_BLOB_PATH, JSON.stringify(hackathons, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true, // Allow overwriting existing data
    });
    
    console.log('Hackathons data saved successfully to Vercel Blob');
  } catch (error) {
    console.error('Error saving hackathons to blob:', error);
    throw new Error(`Failed to save hackathons data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get hackathon by ID
export async function getHackathonById(id: string): Promise<BasicHackathon | null> {
  const hackathons = await getAllHackathons();
  return hackathons[id] || null;
}

// Create new hackathon
export async function createHackathon(hackathonInput: Record<string, unknown>): Promise<BasicHackathon> {
  // Always fetch latest from blob to avoid overwrites
  const latest = await getAllHackathons();

  // Extract only BasicHackathon properties from the input
  const basicHackathonData: Omit<BasicHackathon, 'id' | 'createdAt' | 'updatedAt'> = {
    name: String(hackathonInput.name || ''),
    description: String(hackathonInput.description || ''),
    longDescription: String(hackathonInput.longDescription || ''),
    date: String(hackathonInput.date || ''),
    location: String(hackathonInput.location || ''),
    category: String(hackathonInput.category || ''),
    status: String(hackathonInput.status || 'upcoming') as "upcoming" | "ongoing" | "completed" | "cancelled",
    registrationLink: hackathonInput.registrationLink ? String(hackathonInput.registrationLink) : undefined,
  };

  // Generate ID from name
  const id = basicHackathonData.name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  // Ensure unique ID
  let uniqueId = id;
  let counter = 1;
  while (latest[uniqueId]) {
    uniqueId = `${id}-${counter}`;
    counter++;
  }

  const now = new Date().toISOString();
  const newBasicHackathon: BasicHackathon = {
    ...basicHackathonData,
    id: uniqueId,
    createdAt: now,
    updatedAt: now,
  };

  latest[uniqueId] = newBasicHackathon;
  await saveAllHackathons(latest);
  await new Promise(resolve => setTimeout(resolve, 500));
  return newBasicHackathon;
}

// Update existing hackathon
export async function updateHackathon(id: string, updates: Record<string, unknown>): Promise<BasicHackathon> {
  // Always fetch latest from blob to avoid overwrites
  const latest = await getAllHackathons();

  if (!latest[id]) {
    throw new Error('BasicHackathon not found');
  }

  // Extract only BasicHackathon properties from updates
  const basicUpdates: Partial<BasicHackathon> = {};
  if (updates.name !== undefined) basicUpdates.name = String(updates.name);
  if (updates.description !== undefined) basicUpdates.description = String(updates.description);
  if (updates.longDescription !== undefined) basicUpdates.longDescription = String(updates.longDescription);
  if (updates.date !== undefined) basicUpdates.date = String(updates.date);
  if (updates.location !== undefined) basicUpdates.location = String(updates.location);
  if (updates.category !== undefined) basicUpdates.category = String(updates.category);
  if (updates.status !== undefined) basicUpdates.status = String(updates.status) as "upcoming" | "ongoing" | "completed" | "cancelled";
  if (updates.registrationLink !== undefined) {
    basicUpdates.registrationLink = String(updates.registrationLink);
  }

  const updatedBasicHackathon: BasicHackathon = {
    ...latest[id],
    ...basicUpdates,
    updatedAt: new Date().toISOString(),
  };

  latest[id] = updatedBasicHackathon;
  await saveAllHackathons(latest);
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedBasicHackathon;
}

// Delete hackathon
export async function deleteHackathon(id: string): Promise<void> {
  // Always fetch latest from blob to avoid overwrites
  const latest = await getAllHackathons();
  if (!latest[id]) {
    throw new Error('BasicHackathon not found');
  }
  delete latest[id];
  await saveAllHackathons(latest);
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Get hackathons for public display (sorted by date)
export async function getHackathonsForDisplay(): Promise<BasicHackathon[]> {
  try {
    const hackathons = await getAllHackathons();
    
    // Ensure hackathons is an object
    if (!hackathons || typeof hackathons !== 'object') {
      console.error('getHackathonsForDisplay: hackathons is not an object:', hackathons);
      return [];
    }
    
    const hackathonArray = Object.values(hackathons);
    
    // Ensure we have an array and all items are valid
    if (!Array.isArray(hackathonArray)) {
      console.error('getHackathonsForDisplay: Object.values() did not return an array:', hackathonArray);
      return [];
    }
    
    // Filter out any invalid entries, clean the data, and sort by date
    const validBasicHackathons = hackathonArray
      .filter(h => h && h.date)
      .map(h => ({
        id: h.id,
        name: h.name,
        description: h.description,
        longDescription: h.longDescription,
        date: h.date,
        location: h.location,
        category: h.category,
        status: h.status,
        registrationLink: h.registrationLink,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      } as BasicHackathon))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return validBasicHackathons;
  } catch (error) {
    console.error('Error in getHackathonsForDisplay:', error);
    return [];
  }
}

// Get hackathons by status
export async function getHackathonsByStatus(status: BasicHackathon['status']): Promise<BasicHackathon[]> {
  const hackathons = await getHackathonsForDisplay();
  return hackathons.filter(hackathon => hackathon.status === status);
}

// Get upcoming hackathons
export async function getUpcomingHackathons(): Promise<BasicHackathon[]> {
  return getHackathonsByStatus('upcoming');
}

// Get completed hackathons
export async function getCompletedHackathons(): Promise<BasicHackathon[]> {
  return getHackathonsByStatus('completed');
}

// Get ongoing hackathons
export async function getOngoingHackathons(): Promise<BasicHackathon[]> {
  return getHackathonsByStatus('ongoing');
}

// Get hackathon statistics
export async function getBasicHackathonStats() {
  try {
    const hackathons = await getHackathonsForDisplay();
    
    // Ensure hackathons is an array
    if (!Array.isArray(hackathons)) {
      console.error('getBasicHackathonStats: hackathons is not an array:', hackathons);
      return { total: 0, upcoming: 0, totalParticipants: 0, totalPrizePool: 0 };
    }
    
    const total = hackathons.length;
    const upcoming = hackathons.filter(h => h && h.status === 'upcoming').length;
    
    // Since we don't have participant or prize data in the current structure,
    // we'll provide reasonable estimates based on the number of events
    const totalParticipants = hackathons.reduce((sum, hackathon) => {
      if (!hackathon || !hackathon.status) return sum + 40;
      
      // Estimate participants based on event status and type
      switch (hackathon.status) {
        case 'completed':
          return sum + 75; // Estimate 75 participants per completed hackathon
        case 'ongoing':
          return sum + 50; // Estimate 50 participants for ongoing
        case 'upcoming':
          return sum + 30; // Estimate 30 registered for upcoming
        default:
          return sum + 40; // Default estimate
      }
    }, 0);
    
    // Estimate total prize pool (₹25,000 per hackathon average)
    const totalPrizePool = hackathons.length * 25000;

    return {
      total,
      upcoming,
      totalParticipants,
      totalPrizePool
    };
  } catch (error) {
    console.error('Error in getBasicHackathonStats:', error);
    return { total: 0, upcoming: 0, totalParticipants: 0, totalPrizePool: 0 };
  }
}

// Migrate data from file system to Vercel Blob (one-time operation)
export async function migrateFromFileSystem(): Promise<boolean> {
  try {
    // Try to read from the local hackathons.json file
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(process.cwd(), 'data');
    const hackathonsFile = path.join(dataDir, 'hackathons.json');
    
    const fileContent = await fs.readFile(hackathonsFile, 'utf8');
    const fileData = JSON.parse(fileContent);
    
    if (Object.keys(fileData).length > 0) {
      await saveAllHackathons(fileData);
      console.log(`Migrated ${Object.keys(fileData).length} hackathons to Vercel Blob`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('No file system data to migrate or migration failed:', error);
    return false;
  }
}

import { put, list } from '@vercel/blob';

// Updated BasicHackathon interface to match the enhanced Hackathon interface
export interface BasicHackathon {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrationLink?: string;
  
  // Organizer details
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  
  // Requirements and eligibility
  requirements?: string;
  eligibility?: string;
  teamSize?: string;
  
  // Prize pool
  firstPrize?: string;
  secondPrize?: string;
  thirdPrize?: string;
  specialPrizes?: string;
  
  // Timeline and important details
  timeline?: string;
  importantNotes?: string;
  
  // Additional details
  themes?: string;
  judingCriteria?: string;
  submissionGuidelines?: string;
  
  createdAt: string;
  updatedAt: string;
}

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

  // Extract all BasicHackathon properties from the input
  const basicHackathonData: Omit<BasicHackathon, 'id' | 'createdAt' | 'updatedAt'> = {
    // Core fields
    name: String(hackathonInput.name || ''),
    description: String(hackathonInput.description || ''),
    longDescription: String(hackathonInput.longDescription || ''),
    date: String(hackathonInput.date || ''),
    startTime: hackathonInput.startTime ? String(hackathonInput.startTime) : undefined,
    endTime: hackathonInput.endTime ? String(hackathonInput.endTime) : undefined,
    location: String(hackathonInput.location || ''),
    category: String(hackathonInput.category || ''),
    status: String(hackathonInput.status || 'upcoming') as "upcoming" | "ongoing" | "completed" | "cancelled",
    registrationLink: hackathonInput.registrationLink ? String(hackathonInput.registrationLink) : undefined,
    
    // Organizer details
    organizerName: hackathonInput.organizerName ? String(hackathonInput.organizerName) : undefined,
    organizerEmail: hackathonInput.organizerEmail ? String(hackathonInput.organizerEmail) : undefined,
    organizerPhone: hackathonInput.organizerPhone ? String(hackathonInput.organizerPhone) : undefined,
    organizerWebsite: hackathonInput.organizerWebsite ? String(hackathonInput.organizerWebsite) : undefined,
    
    // Requirements and eligibility
    requirements: hackathonInput.requirements ? String(hackathonInput.requirements) : undefined,
    eligibility: hackathonInput.eligibility ? String(hackathonInput.eligibility) : undefined,
    teamSize: hackathonInput.teamSize ? String(hackathonInput.teamSize) : undefined,
    
    // Prize pool
    firstPrize: hackathonInput.firstPrize ? String(hackathonInput.firstPrize) : undefined,
    secondPrize: hackathonInput.secondPrize ? String(hackathonInput.secondPrize) : undefined,
    thirdPrize: hackathonInput.thirdPrize ? String(hackathonInput.thirdPrize) : undefined,
    specialPrizes: hackathonInput.specialPrizes ? String(hackathonInput.specialPrizes) : undefined,
    
    // Timeline and important details
    timeline: hackathonInput.timeline ? String(hackathonInput.timeline) : undefined,
    importantNotes: hackathonInput.importantNotes ? String(hackathonInput.importantNotes) : undefined,
    
    // Additional details
    themes: hackathonInput.themes ? String(hackathonInput.themes) : undefined,
    judingCriteria: hackathonInput.judingCriteria ? String(hackathonInput.judingCriteria) : undefined,
    submissionGuidelines: hackathonInput.submissionGuidelines ? String(hackathonInput.submissionGuidelines) : undefined,
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

  // Extract all BasicHackathon properties from updates
  const basicUpdates: Partial<BasicHackathon> = {};
  
  // Core fields
  if (updates.name !== undefined) basicUpdates.name = String(updates.name);
  if (updates.description !== undefined) basicUpdates.description = String(updates.description);
  if (updates.longDescription !== undefined) basicUpdates.longDescription = String(updates.longDescription);
  if (updates.date !== undefined) basicUpdates.date = String(updates.date);
  if (updates.startTime !== undefined) basicUpdates.startTime = String(updates.startTime);
  if (updates.endTime !== undefined) basicUpdates.endTime = String(updates.endTime);
  if (updates.location !== undefined) basicUpdates.location = String(updates.location);
  if (updates.category !== undefined) basicUpdates.category = String(updates.category);
  if (updates.status !== undefined) basicUpdates.status = String(updates.status) as "upcoming" | "ongoing" | "completed" | "cancelled";
  if (updates.registrationLink !== undefined) basicUpdates.registrationLink = String(updates.registrationLink);
  
  // Organizer details
  if (updates.organizerName !== undefined) basicUpdates.organizerName = String(updates.organizerName);
  if (updates.organizerEmail !== undefined) basicUpdates.organizerEmail = String(updates.organizerEmail);
  if (updates.organizerPhone !== undefined) basicUpdates.organizerPhone = String(updates.organizerPhone);
  if (updates.organizerWebsite !== undefined) basicUpdates.organizerWebsite = String(updates.organizerWebsite);
  
  // Requirements and eligibility
  if (updates.requirements !== undefined) basicUpdates.requirements = String(updates.requirements);
  if (updates.eligibility !== undefined) basicUpdates.eligibility = String(updates.eligibility);
  if (updates.teamSize !== undefined) basicUpdates.teamSize = String(updates.teamSize);
  
  // Prize pool
  if (updates.firstPrize !== undefined) basicUpdates.firstPrize = String(updates.firstPrize);
  if (updates.secondPrize !== undefined) basicUpdates.secondPrize = String(updates.secondPrize);
  if (updates.thirdPrize !== undefined) basicUpdates.thirdPrize = String(updates.thirdPrize);
  if (updates.specialPrizes !== undefined) basicUpdates.specialPrizes = String(updates.specialPrizes);
  
  // Timeline and important details
  if (updates.timeline !== undefined) basicUpdates.timeline = String(updates.timeline);
  if (updates.importantNotes !== undefined) basicUpdates.importantNotes = String(updates.importantNotes);
  
  // Additional details
  if (updates.themes !== undefined) basicUpdates.themes = String(updates.themes);
  if (updates.judingCriteria !== undefined) basicUpdates.judingCriteria = String(updates.judingCriteria);
  if (updates.submissionGuidelines !== undefined) basicUpdates.submissionGuidelines = String(updates.submissionGuidelines);

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

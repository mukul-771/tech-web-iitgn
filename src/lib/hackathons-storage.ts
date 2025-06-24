import { put, list } from '@vercel/blob';
import { Hackathon } from './hackathons-data';

// Store hackathons as JSON in Vercel Blob
const HACKATHONS_BLOB_PATH = 'hackathons-data.json';

// Get all hackathons from Vercel Blob
export async function getAllHackathons(): Promise<Record<string, Hackathon>> {
  try {
    const { blobs } = await list({ prefix: HACKATHONS_BLOB_PATH });
    
    if (blobs.length === 0) {
      // If no data exists, return empty object
      return {};
    }
    
    const response = await fetch(blobs[0].url);
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
export async function saveAllHackathons(hackathons: Record<string, Hackathon>): Promise<void> {
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
export async function getHackathonById(id: string): Promise<Hackathon | null> {
  const hackathons = await getAllHackathons();
  return hackathons[id] || null;
}

// Create new hackathon
export async function createHackathon(hackathon: Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hackathon> {
  const hackathons = await getAllHackathons();
  
  // Generate ID from name
  const id = hackathon.name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Ensure unique ID
  let uniqueId = id;
  let counter = 1;
  while (hackathons[uniqueId]) {
    uniqueId = `${id}-${counter}`;
    counter++;
  }
  
  const now = new Date().toISOString();
  const newHackathon: Hackathon = {
    ...hackathon,
    id: uniqueId,
    createdAt: now,
    updatedAt: now,
  };
  
  hackathons[uniqueId] = newHackathon;
  await saveAllHackathons(hackathons);
  
  return newHackathon;
}

// Update existing hackathon
export async function updateHackathon(id: string, updates: Partial<Omit<Hackathon, 'id' | 'createdAt'>>): Promise<Hackathon> {
  const hackathons = await getAllHackathons();
  
  if (!hackathons[id]) {
    throw new Error('Hackathon not found');
  }
  
  const updatedHackathon: Hackathon = {
    ...hackathons[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  hackathons[id] = updatedHackathon;
  await saveAllHackathons(hackathons);
  
  return updatedHackathon;
}

// Delete hackathon
export async function deleteHackathon(id: string): Promise<void> {
  const hackathons = await getAllHackathons();
  
  if (!hackathons[id]) {
    throw new Error('Hackathon not found');
  }
  
  delete hackathons[id];
  await saveAllHackathons(hackathons);
}

// Get hackathons for public display (sorted by date)
export async function getHackathonsForDisplay(): Promise<Hackathon[]> {
  const hackathons = await getAllHackathons();
  return Object.values(hackathons).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get hackathons by status
export async function getHackathonsByStatus(status: Hackathon['status']): Promise<Hackathon[]> {
  const hackathons = await getHackathonsForDisplay();
  return hackathons.filter(hackathon => hackathon.status === status);
}

// Get upcoming hackathons
export async function getUpcomingHackathons(): Promise<Hackathon[]> {
  return getHackathonsByStatus('upcoming');
}

// Get completed hackathons
export async function getCompletedHackathons(): Promise<Hackathon[]> {
  return getHackathonsByStatus('completed');
}

// Get ongoing hackathons
export async function getOngoingHackathons(): Promise<Hackathon[]> {
  return getHackathonsByStatus('ongoing');
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

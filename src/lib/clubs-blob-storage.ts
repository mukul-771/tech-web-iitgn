import { put, list } from '@vercel/blob';
import { Club, defaultClubsData } from './clubs-data';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const CLUBS_BLOB_URL = 'clubs-data.json';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Fallback file-based storage for development
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');

// Ensure data directory exists (development only)
async function ensureDataDir() {
  if (!isDevelopment) return;
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize clubs file if it doesn't exist (development only)
async function initializeClubsFile() {
  if (!isDevelopment) return;
  try {
    await fs.access(CLUBS_FILE);
  } catch {
    await fs.writeFile(CLUBS_FILE, JSON.stringify(defaultClubsData, null, 2));
  }
}

// Get all clubs
export async function getAllClubs(): Promise<Record<string, Club>> {
  try {
    if (isDevelopment) {
      // Use file-based storage in development
      await ensureDataDir();
      await initializeClubsFile();
      
      const data = await fs.readFile(CLUBS_FILE, 'utf-8');
      return JSON.parse(data);
    } else {
      // Use Vercel Blob in production
      if (!BLOB_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not found, using default data');
        return defaultClubsData;
      }

      try {
        // List all blobs to find our clubs data file
        const { blobs } = await list({
          token: BLOB_TOKEN,
          prefix: 'clubs-data'
        });

        // Find the clubs data blob
        const clubsBlob = blobs.find(blob => blob.pathname === CLUBS_BLOB_URL);
        
        if (!clubsBlob) {
          console.log('Clubs blob not found, initializing with default data');
          await saveAllClubs(defaultClubsData);
          return defaultClubsData;
        }

        // Fetch the blob content
        const response = await fetch(clubsBlob.url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch clubs data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Successfully loaded clubs data from blob');
        return data;

      } catch (error) {
        console.error('Error loading clubs from blob:', error);
        console.log('Falling back to default data');
        return defaultClubsData;
      }
    }
  } catch (error) {
    console.error('Error in getAllClubs:', error);
    return defaultClubsData;
  }
}

// Get single club by ID
export async function getClubById(id: string): Promise<Club | null> {
  const clubs = await getAllClubs();
  return clubs[id] || null;
}

// Save all clubs
export async function saveAllClubs(clubs: Record<string, Club>): Promise<void> {
  try {
    console.log('saveAllClubs called, isDevelopment:', isDevelopment);
    
    if (isDevelopment) {
      // Use file-based storage in development
      console.log('Using file-based storage for clubs');
      await ensureDataDir();

      // Create temporary file for atomic write
      const tempFile = `${CLUBS_FILE}.tmp`;
      const data = JSON.stringify(clubs, null, 2);

      // Write to temporary file first
      await fs.writeFile(tempFile, data);

      // Atomically move temp file to final location
      await fs.rename(tempFile, CLUBS_FILE);

      console.log('Clubs data saved successfully (file)');
    } else {
      // Use Vercel Blob in production
      console.log('Using Vercel Blob storage for clubs');
      if (!BLOB_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not found');
        throw new Error('BLOB_READ_WRITE_TOKEN not found');
      }

      try {
        // Delete existing blob first if it exists
        try {
          const { blobs } = await list({
            token: BLOB_TOKEN,
            prefix: 'clubs-data'
          });
          
          const existingBlob = blobs.find(blob => blob.pathname === CLUBS_BLOB_URL);
          if (existingBlob) {
            console.log('Found existing clubs blob, it will be overwritten');
          }
        } catch (listError) {
          console.log('Could not list existing blobs:', listError);
        }

        console.log('Starting blob upload for clubs data...');
        
        // Upload new data
        try {
          const blob = await put(CLUBS_BLOB_URL, JSON.stringify(clubs, null, 2), {
            access: 'public',
            token: BLOB_TOKEN,
            contentType: 'application/json',
            addRandomSuffix: false, // Ensure we overwrite the same blob
            allowOverwrite: true, // Allow overwriting existing clubs.json
          });
          console.log('Clubs data saved successfully to blob:', blob.url);
        } catch (putError) {
          console.error('Failed to save clubs data to blob:', putError);
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
    console.error('Error saving clubs:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      isDevelopment,
      clubsCount: Object.keys(clubs).length
    });

    if (isDevelopment) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(`${CLUBS_FILE}.tmp`);
      } catch {
        // Ignore cleanup errors
      }
    }

    throw new Error(`Failed to save clubs data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create new club
export async function createClub(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<Club> {
  const clubs = await getAllClubs();
  
  const id = generateClubId(club.name);
  const now = new Date().toISOString();
  
  const newClub: Club = {
    ...club,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  clubs[id] = newClub;
  await saveAllClubs(clubs);
  
  return newClub;
}

// Update existing club
export async function updateClub(id: string, updates: Partial<Omit<Club, 'id' | 'createdAt'>>): Promise<Club | null> {
  try {
    console.log('Updating club:', { id, updates });
    const clubs = await getAllClubs();
    
    if (!clubs[id]) {
      console.log('Club not found:', id);
      return null;
    }
    
    const updatedClub: Club = {
      ...clubs[id],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    clubs[id] = updatedClub;
    console.log('Saving updated club data...');
    await saveAllClubs(clubs);
    
    console.log('Club updated successfully:', id);
    return updatedClub;
  } catch (error) {
    console.error('Error in updateClub function:', {
      id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Delete club
export async function deleteClub(id: string): Promise<boolean> {
  const clubs = await getAllClubs();
  
  if (!clubs[id]) {
    return false;
  }
  
  delete clubs[id];
  await saveAllClubs(clubs);
  
  return true;
}

// Generate club ID from name
function generateClubId(name: string): string {
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const timestamp = Date.now().toString().slice(-6);
  return `${baseId}-${timestamp}`;
}

// Get clubs for public display (simplified format)
export async function getClubsForDisplay(): Promise<Array<{
  id: string;
  name: string;
  description: string;
  type: "club" | "hobby-group" | "technical-council-group";
  category: string;
  logoPath?: string;
}>> {
  const clubs = await getAllClubs();
  
  return Object.values(clubs).map(club => ({
    id: club.id,
    name: club.name,
    description: club.description,
    type: club.type,
    category: club.category,
    logoPath: club.logoPath
  }));
}

// Get clubs by type
export async function getClubsByType(type: "club" | "hobby-group" | "technical-council-group"): Promise<Club[]> {
  const clubs = await getAllClubs();
  return Object.values(clubs).filter(club => club.type === type);
}

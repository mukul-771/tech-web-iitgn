import { promises as fs } from 'fs';
import path from 'path';
import { Club, defaultClubsData } from './clubs-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize clubs file if it doesn't exist
async function initializeClubsFile() {
  try {
    await fs.access(CLUBS_FILE);
  } catch {
    await fs.writeFile(CLUBS_FILE, JSON.stringify(defaultClubsData, null, 2));
  }
}

// Get all clubs
export async function getAllClubs(): Promise<Record<string, Club>> {
  try {
    await ensureDataDir();
    await initializeClubsFile();
    
    const data = await fs.readFile(CLUBS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading clubs:', error);
    return defaultClubsData;
  }
}

// Get single club by ID
export async function getClubById(id: string): Promise<Club | null> {
  const clubs = await getAllClubs();
  return clubs[id] || null;
}

// Save all clubs with atomic write operation
export async function saveAllClubs(clubs: Record<string, Club>): Promise<void> {
  try {
    await ensureDataDir();

    // Create temporary file for atomic write
    const tempFile = `${CLUBS_FILE}.tmp`;
    const data = JSON.stringify(clubs, null, 2);

    // Write to temporary file first
    await fs.writeFile(tempFile, data);

    // Atomically move temp file to final location
    await fs.rename(tempFile, CLUBS_FILE);

    console.log('Clubs data saved successfully');
  } catch (error) {
    console.error('Error saving clubs:', error);

    // Clean up temp file if it exists
    try {
      await fs.unlink(`${CLUBS_FILE}.tmp`);
    } catch {
      // Ignore cleanup errors
    }

    throw new Error('Failed to save clubs data');
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
  const clubs = await getAllClubs();
  
  if (!clubs[id]) {
    return null;
  }
  
  const updatedClub: Club = {
    ...clubs[id],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  clubs[id] = updatedClub;
  await saveAllClubs(clubs);
  
  return updatedClub;
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

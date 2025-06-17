import { promises as fs } from 'fs';
import path from 'path';
import { Hackathon, defaultHackathonsData } from './hackathons-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const HACKATHONS_FILE = path.join(DATA_DIR, 'hackathons.json');

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get all hackathons
export async function getAllHackathons(): Promise<Record<string, Hackathon>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(HACKATHONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Hackathons file not found, creating with default data');
    await saveAllHackathons(defaultHackathonsData);
    return defaultHackathonsData;
  }
}

// Get hackathons for public display (array format)
export async function getHackathonsForDisplay(): Promise<Hackathon[]> {
  const hackathons = await getAllHackathons();
  return Object.values(hackathons).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Get hackathon by ID
export async function getHackathonById(id: string): Promise<Hackathon | null> {
  const hackathons = await getAllHackathons();
  return hackathons[id] || null;
}

// Save all hackathons with atomic write operation
export async function saveAllHackathons(hackathons: Record<string, Hackathon>): Promise<void> {
  try {
    await ensureDataDir();
    
    // Create temporary file for atomic write
    const tempFile = `${HACKATHONS_FILE}.tmp`;
    const data = JSON.stringify(hackathons, null, 2);
    
    // Write to temporary file first
    await fs.writeFile(tempFile, data);
    
    // Atomically move temp file to final location
    await fs.rename(tempFile, HACKATHONS_FILE);
    
    console.log('Hackathons data saved successfully');
  } catch (error) {
    console.error('Error saving hackathons:', error);
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(`${HACKATHONS_FILE}.tmp`);
    } catch {
      // Ignore cleanup errors
    }
    
    throw new Error('Failed to save hackathons data');
  }
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

// Update hackathon
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

// Search hackathons
export async function searchHackathons(query: string): Promise<Hackathon[]> {
  const hackathons = await getHackathonsForDisplay();
  const lowercaseQuery = query.toLowerCase();
  
  return hackathons.filter(hackathon => 
    hackathon.name.toLowerCase().includes(lowercaseQuery) ||
    hackathon.description.toLowerCase().includes(lowercaseQuery) ||
    hackathon.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Get hackathons by category
export async function getHackathonsByCategory(category: string): Promise<Hackathon[]> {
  const hackathons = await getHackathonsForDisplay();
  return hackathons.filter(hackathon => hackathon.category === category);
}

// Get hackathon statistics
export async function getHackathonStats(): Promise<{
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  totalParticipants: number;
  totalPrizePool: number;
}> {
  const hackathons = await getHackathonsForDisplay();
  
  const stats = {
    total: hackathons.length,
    upcoming: hackathons.filter(h => h.status === 'upcoming').length,
    ongoing: hackathons.filter(h => h.status === 'ongoing').length,
    completed: hackathons.filter(h => h.status === 'completed').length,
    totalParticipants: 0,
    totalPrizePool: 0
  };
  
  hackathons.forEach(hackathon => {
    // Calculate total participants
    if (hackathon.currentParticipants) {
      const participants = parseInt(hackathon.currentParticipants.replace(/[^0-9]/g, ''));
      if (!isNaN(participants)) {
        stats.totalParticipants += participants;
      }
    }
    
    // Calculate total prize pool
    hackathon.prizes.forEach(prize => {
      const amount = parseInt(prize.amount.replace(/[^0-9]/g, ''));
      if (!isNaN(amount)) {
        stats.totalPrizePool += amount;
      }
    });
  });
  
  return stats;
}

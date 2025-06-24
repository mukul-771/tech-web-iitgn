import { del } from '@vercel/blob';
import { TorqueMagazine, defaultTorqueData } from './torque-data';

// In-memory store for demo (replace with DB in production)
let magazinesStore: Record<string, TorqueMagazine> | null = null;

// Get all magazines
export async function getAllMagazines(): Promise<Record<string, TorqueMagazine>> {
  if (magazinesStore) return magazinesStore;
  // fallback to default data if not initialized
  magazinesStore = { ...defaultTorqueData };
  return magazinesStore;
}

// Get single magazine by ID
export async function getMagazineById(id: string): Promise<TorqueMagazine | null> {
  const magazines = await getAllMagazines();
  return magazines[id] || null;
}

// Get latest magazine
export async function getLatestMagazine(): Promise<TorqueMagazine | null> {
  const magazines = await getAllMagazines();
  const latestMagazine = Object.values(magazines).find(mag => mag.isLatest);
  return latestMagazine || null;
}

// Create new magazine (metadata only)
export async function createMagazine(magazine: Omit<TorqueMagazine, 'id' | 'createdAt' | 'updatedAt'>): Promise<TorqueMagazine> {
  const magazines = await getAllMagazines();
  
  const id = generateMagazineId(magazine.year, magazine.title);
  const now = new Date().toISOString();
  
  const newMagazine: TorqueMagazine = {
    ...magazine,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  magazines[id] = newMagazine;
  
  return newMagazine;
}

// Update existing magazine (metadata only)
export async function updateMagazine(id: string, updates: Partial<Omit<TorqueMagazine, 'id' | 'createdAt'>>): Promise<TorqueMagazine | null> {
  const magazines = await getAllMagazines();
  
  if (!magazines[id]) {
    return null;
  }
  
  const updatedMagazine: TorqueMagazine = {
    ...magazines[id],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  magazines[id] = updatedMagazine;
  
  return updatedMagazine;
}

// Set latest magazine (unsets all others)
export async function setLatestMagazine(id: string): Promise<boolean> {
  const magazines = await getAllMagazines();
  
  if (!magazines[id]) {
    return false;
  }
  
  // Unset all other magazines as latest
  Object.keys(magazines).forEach(key => {
    magazines[key].isLatest = false;
  });
  
  // Set the specified magazine as latest
  magazines[id].isLatest = true;
  magazines[id].updatedAt = new Date().toISOString();
  
  return true;
}

// Delete magazine (delete file from Vercel Blob, remove from memory)
export async function deleteMagazine(id: string): Promise<boolean> {
  const magazines = await getAllMagazines();
  
  if (!magazines[id]) {
    return false;
  }
  
  // Delete the PDF file from Vercel Blob
  try {
    // If filePath is a Vercel Blob URL, extract the key
    const filePath = magazines[id].filePath;
    if (filePath && filePath.startsWith('https://')) {
      // The key is usually the filename at the end of the URL
      const key = filePath.split('/').pop();
      if (key) await del(key);
    }
  } catch (error) {
    console.warn('Could not delete magazine file from Vercel Blob:', error);
  }

  delete magazines[id];
  // In-memory only; in production, delete from DB
  return true;
}

// Generate magazine ID
function generateMagazineId(year: string, title: string): string {
  const baseId = `torque-${year}-${title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30)}`;
  
  return baseId;
}

// Get magazines for public display
export async function getMagazinesForDisplay(): Promise<Array<{
  id: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  downloadUrl: string;
  viewUrl: string;
  coverPhoto?: string;
}>> {
  const magazines = await getAllMagazines();

  return Object.values(magazines)
    .sort((a, b) => parseInt(b.year) - parseInt(a.year))
    .map(magazine => ({
      id: magazine.id,
      year: magazine.year,
      title: magazine.title,
      description: magazine.description,
      pages: magazine.pages,
      articles: magazine.articles,
      featured: magazine.featured,
      downloadUrl: magazine.filePath,
      viewUrl: magazine.filePath,
      coverPhoto: magazine.coverPhoto
    }));
}

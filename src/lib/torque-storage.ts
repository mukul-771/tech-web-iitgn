import { put, del, list } from '@vercel/blob';

// Simple types for magazine data (no MongoDB)
export interface TorqueMagazineData {
  id: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  coverPhoto?: string;
  coverPhotoFileName?: string;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TorqueMagazineInput {
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  coverPhoto?: string;
  coverPhotoFileName?: string;
  isLatest: boolean;
}

// Generate a unique ID for magazines
function generateMagazineId(): string {
  return `mag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Store metadata as JSON in Vercel Blob
async function storeMetadata(id: string, data: TorqueMagazineData): Promise<void> {
  try {
    const metadataPath = `magazines/${id}/metadata.json`;
    await put(metadataPath, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true, // Allow overwriting existing metadata files
    });
  } catch (error) {
    console.error(`Failed to store metadata for magazine ${id}:`, error);
    throw new Error(`Failed to store magazine metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get metadata from Vercel Blob
async function getMetadata(id: string): Promise<TorqueMagazineData | null> {
  try {
    const { blobs } = await list({ prefix: `magazines/${id}/metadata.json` });
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Failed to get metadata for magazine ${id}:`, error);
    return null;
  }
}

// List all magazine metadata files
async function listAllMetadata(): Promise<TorqueMagazineData[]> {
  try {
    const { blobs } = await list({ prefix: 'magazines/' });
    const metadataBlobs = blobs.filter(blob => blob.pathname.endsWith('/metadata.json'));
    
    const magazines: TorqueMagazineData[] = [];
    for (const blob of metadataBlobs) {
      try {
        const response = await fetch(blob.url);
        if (response.ok) {
          const metadata = await response.json();
          magazines.push(metadata);
        }
      } catch (error) {
        console.error(`Failed to fetch metadata from ${blob.url}:`, error);
      }
    }
    
    return magazines;
  } catch (error) {
    console.error('Failed to list magazines:', error);
    return [];
  }
}

// Get all magazines
export async function getAllMagazines(): Promise<Record<string, TorqueMagazineData>> {
  const magazines = await listAllMetadata();
  const result: Record<string, TorqueMagazineData> = {};
  magazines.forEach((mag) => {
    result[mag.id] = mag;
  });
  return result;
}

// Get single magazine by ID
export async function getMagazineById(id: string): Promise<TorqueMagazineData | null> {
  return await getMetadata(id);
}

// Get latest magazine
export async function getLatestMagazine(): Promise<TorqueMagazineData | null> {
  const magazines = await listAllMetadata();
  return magazines.find(mag => mag.isLatest) || null;
}

// Create new magazine
export async function createMagazine(magazine: TorqueMagazineInput): Promise<TorqueMagazineData> {
  const id = generateMagazineId();
  const now = new Date().toISOString();
  
  // If this magazine is set as latest, unset all others first
  if (magazine.isLatest) {
    await unsetAllLatest();
  }
  
  const newMagazine: TorqueMagazineData = {
    ...magazine,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  await storeMetadata(id, newMagazine);
  return newMagazine;
}

// Update existing magazine
export async function updateMagazine(id: string, updates: Partial<TorqueMagazineInput>): Promise<TorqueMagazineData | null> {
  const existing = await getMetadata(id);
  if (!existing) return null;
  
  // If setting this as latest, unset all others first
  if (updates.isLatest === true) {
    await unsetAllLatest();
  }
  
  const updated: TorqueMagazineData = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await storeMetadata(id, updated);
  return updated;
}

// Set a magazine as the latest (and unset all others)
export async function setLatestMagazine(targetId: string): Promise<void> {
  const magazines = await listAllMetadata();
  
  // Check if target magazine exists
  const target = magazines.find(mag => mag.id === targetId);
  if (!target) {
    throw new Error(`Magazine with ID ${targetId} not found`);
  }
  
  // First, unset all magazines as latest
  await unsetAllLatest();
  
  // Then set the target as latest
  const updated = { ...target, isLatest: true, updatedAt: new Date().toISOString() };
  await storeMetadata(targetId, updated);
}

// Helper function to unset all magazines as latest
async function unsetAllLatest(): Promise<void> {
  const magazines = await listAllMetadata();
  
  for (const mag of magazines) {
    if (mag.isLatest) {
      const updated = { ...mag, isLatest: false, updatedAt: new Date().toISOString() };
      await storeMetadata(mag.id, updated);
    }
  }
}

// Delete magazine and all its files
export async function deleteMagazine(id: string): Promise<boolean> {
  try {
    const magazine = await getMetadata(id);
    if (!magazine) return false;
    
    // Delete PDF file
    if (magazine.filePath) {
      try {
        await del(magazine.filePath);
      } catch (error) {
        console.warn(`Could not delete PDF '${magazine.filePath}':`, error);
      }
    }
    
    // Delete cover photo
    if (magazine.coverPhoto) {
      try {
        await del(magazine.coverPhoto);
      } catch (error) {
        console.warn(`Could not delete cover photo '${magazine.coverPhoto}':`, error);
      }
    }
    
    // Delete metadata by listing and deleting the specific file
    try {
      const { blobs } = await list({ prefix: `magazines/${id}/metadata.json` });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch (error) {
      console.warn(`Could not delete metadata for magazine ${id}:`, error);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting magazine ${id}:`, error);
    return false;
  }
}

// Validate and fix latest magazine consistency
export async function ensureOnlyOneLatest(): Promise<void> {
  const magazines = await listAllMetadata();
  const latestMagazines = magazines.filter(mag => mag.isLatest);
  
  if (latestMagazines.length > 1) {
    console.warn(`Found ${latestMagazines.length} magazines marked as latest. Fixing...`);
    
    // Keep the most recently updated one as latest
    const mostRecent = latestMagazines.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
    
    // Unset all others
    await unsetAllLatest();
    
    // Set the most recent as latest
    const updated = { ...mostRecent, isLatest: true, updatedAt: new Date().toISOString() };
    await storeMetadata(mostRecent.id, updated);
    
    console.log(`Set magazine "${mostRecent.title}" (${mostRecent.year}) as the latest`);
  }
}

// Get count of magazines marked as latest (for debugging)
export async function getLatestCount(): Promise<number> {
  const magazines = await listAllMetadata();
  return magazines.filter(mag => mag.isLatest).length;
}

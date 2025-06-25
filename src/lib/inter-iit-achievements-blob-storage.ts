import { put, list } from '@vercel/blob';
import { InterIITAchievement, defaultAchievementsData } from './inter-iit-achievements-data';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Fallback file-based storage for development
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'inter-iit-achievements.json');

// Vercel Blob configuration
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const ACHIEVEMENTS_BLOB_URL = 'inter-iit-achievements-data.json';

// Ensure data directory exists (development only)
async function ensureDataDir() {
  if (!isDevelopment) return;
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize achievements file if it doesn't exist (development only)
async function initializeAchievementsFile() {
  if (!isDevelopment) return;
  try {
    await fs.access(ACHIEVEMENTS_FILE);
  } catch {
    await fs.writeFile(ACHIEVEMENTS_FILE, JSON.stringify(defaultAchievementsData, null, 2));
  }
}

// Get all Inter-IIT achievements
export async function getAllInterIITAchievements(): Promise<Record<string, InterIITAchievement>> {
  try {
    if (isDevelopment) {
      // Use file-based storage in development
      await ensureDataDir();
      await initializeAchievementsFile();
      
      const data = await fs.readFile(ACHIEVEMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    } else {
      // Use Vercel Blob in production
      if (!BLOB_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not found, using default data');
        return defaultAchievementsData;
      }

      try {
        // List all blobs to find our achievements data file
        const { blobs } = await list({
          token: BLOB_TOKEN,
          prefix: 'inter-iit-achievements-data'
        });

        // Find the achievements data blob
        const achievementsBlob = blobs.find(blob => blob.pathname === ACHIEVEMENTS_BLOB_URL);
        
        if (!achievementsBlob) {
          console.log('Achievements blob not found, initializing with default data');
          await saveAllInterIITAchievements(defaultAchievementsData);
          return defaultAchievementsData;
        }

        // Fetch and parse the blob data
        const response = await fetch(achievementsBlob.url);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching achievements from blob:', error);
        console.log('Falling back to default data');
        return defaultAchievementsData;
      }
    }
  } catch (error) {
    console.error('Error in getAllInterIITAchievements:', error);
    return defaultAchievementsData;
  }
}

// Get Inter-IIT achievements for public display (array format)
export async function getInterIITAchievementsForDisplay(): Promise<InterIITAchievement[]> {
  const achievements = await getAllInterIITAchievements();
  return Object.values(achievements)
    .filter(achievement => achievement.status === 'verified') // Only show verified achievements on public pages
    .sort((a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime());
}

// Get Inter-IIT achievement by ID
export async function getInterIITAchievementById(id: string): Promise<InterIITAchievement | null> {
  const achievements = await getAllInterIITAchievements();
  return achievements[id] || null;
}

// Save all Inter-IIT achievements with atomic write operation
export async function saveAllInterIITAchievements(achievements: Record<string, InterIITAchievement>): Promise<void> {
  try {
    console.log('saveAllInterIITAchievements called, isDevelopment:', isDevelopment);
    
    if (isDevelopment) {
      // Use file-based storage in development
      console.log('Using file-based storage for achievements');
      await ensureDataDir();

      // Create temporary file for atomic write
      const tempFile = `${ACHIEVEMENTS_FILE}.tmp`;
      const data = JSON.stringify(achievements, null, 2);

      // Write to temporary file first
      await fs.writeFile(tempFile, data);

      // Atomically move temp file to final location
      await fs.rename(tempFile, ACHIEVEMENTS_FILE);

      console.log('Achievements data saved successfully (file)');
    } else {
      // Use Vercel Blob in production
      console.log('Using Vercel Blob storage for achievements');
      if (!BLOB_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not found');
        throw new Error('BLOB_READ_WRITE_TOKEN not found');
      }

      try {
        // Delete existing blob first if it exists
        try {
          const { blobs } = await list({
            token: BLOB_TOKEN,
            prefix: 'inter-iit-achievements-data'
          });
          
          const existingBlob = blobs.find(blob => blob.pathname === ACHIEVEMENTS_BLOB_URL);
          if (existingBlob) {
            console.log('Found existing achievements blob, it will be overwritten');
          }
        } catch (listError) {
          console.log('Could not list existing blobs:', listError);
        }

        console.log('Starting blob upload for achievements data...');
        
        // Upload new data
        try {
          const blob = await put(ACHIEVEMENTS_BLOB_URL, JSON.stringify(achievements, null, 2), {
            access: 'public',
            token: BLOB_TOKEN,
            contentType: 'application/json',
            addRandomSuffix: false, // Ensure we overwrite the same blob
            allowOverwrite: true, // Allow overwriting existing achievements.json
          });
          console.log('Achievements data saved successfully to blob:', blob.url);
        } catch (putError) {
          console.error('Failed to save achievements data to blob:', putError);
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
    console.error('Error saving achievements:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      isDevelopment,
      achievementsCount: Object.keys(achievements).length
    });

    if (isDevelopment) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(`${ACHIEVEMENTS_FILE}.tmp`);
      } catch {
        // Ignore cleanup errors
      }
    }

    throw new Error(`Failed to save achievements data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create new Inter-IIT achievement
export async function createInterIITAchievement(achievement: Omit<InterIITAchievement, 'id' | 'createdAt' | 'updatedAt'>): Promise<InterIITAchievement> {
  const achievements = await getAllInterIITAchievements();
  
  // Generate ID from competition name and year
  const baseId = `${achievement.competitionName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${achievement.year}`;
  
  // Ensure unique ID
  let uniqueId = baseId;
  let counter = 1;
  while (achievements[uniqueId]) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }
  
  const now = new Date().toISOString();
  const newAchievement: InterIITAchievement = {
    ...achievement,
    id: uniqueId,
    createdAt: now,
    updatedAt: now,
  };
  
  achievements[uniqueId] = newAchievement;
  await saveAllInterIITAchievements(achievements);
  
  return newAchievement;
}

// Update Inter-IIT achievement
export async function updateInterIITAchievement(id: string, updates: Partial<Omit<InterIITAchievement, 'id' | 'createdAt'>>): Promise<InterIITAchievement> {
  const achievements = await getAllInterIITAchievements();
  
  if (!achievements[id]) {
    throw new Error('Inter-IIT achievement not found');
  }
  
  const updatedAchievement: InterIITAchievement = {
    ...achievements[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  achievements[id] = updatedAchievement;
  await saveAllInterIITAchievements(achievements);
  
  return updatedAchievement;
}

// Delete Inter-IIT achievement
export async function deleteInterIITAchievement(id: string): Promise<void> {
  const achievements = await getAllInterIITAchievements();
  
  if (!achievements[id]) {
    throw new Error('Inter-IIT achievement not found');
  }
  
  delete achievements[id];
  await saveAllInterIITAchievements(achievements);
}

// Get achievements by year
export async function getInterIITAchievementsByYear(year: string): Promise<InterIITAchievement[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  return achievements.filter(achievement => achievement.year === year);
}

// Get achievements by type
export async function getInterIITAchievementsByType(type: InterIITAchievement['achievementType']): Promise<InterIITAchievement[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  return achievements.filter(achievement => achievement.achievementType === type);
}

// Get achievements by category
export async function getInterIITAchievementsByCategory(category: string): Promise<InterIITAchievement[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  return achievements.filter(achievement => achievement.competitionCategory === category);
}

// Search achievements
export async function searchInterIITAchievements(query: string): Promise<InterIITAchievement[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  const lowercaseQuery = query.toLowerCase();
  
  return achievements.filter(achievement => 
    achievement.competitionName.toLowerCase().includes(lowercaseQuery) ||
    achievement.achievementDescription.toLowerCase().includes(lowercaseQuery) ||
    achievement.significance.toLowerCase().includes(lowercaseQuery) ||
    achievement.hostIIT.toLowerCase().includes(lowercaseQuery) ||
    achievement.location.toLowerCase().includes(lowercaseQuery) ||
    achievement.teamMembers.some(member => 
      member.name.toLowerCase().includes(lowercaseQuery) ||
      member.email.toLowerCase().includes(lowercaseQuery)
    )
  );
}

// Get Inter-IIT achievements statistics
export async function getInterIITAchievementsStats(): Promise<{
  totalAchievements: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  specialAwards: number;
  rankings: number;
  recognitions: number;
  totalParticipants: number;
  categoriesParticipated: number;
  yearsActive: number;
  averageRanking: number;
}> {
  const achievements = await getInterIITAchievementsForDisplay();
  
  const stats = {
    totalAchievements: achievements.length,
    goldMedals: achievements.filter(a => a.achievementType === 'gold-medal').length,
    silverMedals: achievements.filter(a => a.achievementType === 'silver-medal').length,
    bronzeMedals: achievements.filter(a => a.achievementType === 'bronze-medal').length,
    specialAwards: achievements.filter(a => a.achievementType === 'special-award').length,
    rankings: achievements.filter(a => a.achievementType === 'ranking').length,
    recognitions: achievements.filter(a => a.achievementType === 'recognition').length,
    totalParticipants: 0,
    categoriesParticipated: 0,
    yearsActive: 0,
    averageRanking: 0
  };
  
  // Calculate total unique participants
  const uniqueParticipants = new Set<string>();
  achievements.forEach(achievement => {
    achievement.teamMembers.forEach(member => {
      uniqueParticipants.add(member.rollNumber);
    });
  });
  stats.totalParticipants = uniqueParticipants.size;
  
  // Calculate unique categories
  const uniqueCategories = new Set(achievements.map(a => a.competitionCategory));
  stats.categoriesParticipated = uniqueCategories.size;
  
  // Calculate unique years
  const uniqueYears = new Set(achievements.map(a => a.year));
  stats.yearsActive = uniqueYears.size;
  
  // Calculate average ranking (only for achievements with ranking)
  const rankedAchievements = achievements.filter(a => a.ranking);
  if (rankedAchievements.length > 0) {
    const totalRanking = rankedAchievements.reduce((sum, a) => sum + (a.ranking || 0), 0);
    stats.averageRanking = Math.round(totalRanking / rankedAchievements.length * 100) / 100;
  }
  
  return stats;
}

// Get achievements by Inter-IIT edition
export async function getInterIITAchievementsByEdition(edition: string): Promise<InterIITAchievement[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  return achievements.filter(achievement => achievement.interIITEdition === edition);
}

// Migrate data from file system to Vercel Blob (one-time operation)
export async function migrateInterIITAchievementsFromFileSystem(): Promise<boolean> {
  try {
    // Skip migration in development when Blob is not available
    if (isDevelopment && !BLOB_TOKEN) {
      console.log('Development mode: Blob not available, skipping migration');
      return false;
    }
    
    // Check if data already exists in Blob
    if (!isDevelopment) {
      const { blobs } = await list({
        token: BLOB_TOKEN,
        prefix: 'inter-iit-achievements-data'
      });
      if (blobs.length > 0) {
        console.log('Achievements data already exists in Blob storage, skipping migration');
        return false;
      }
    }
    
    // Try to read from the local achievements.json file
    const fileContent = await fs.readFile(ACHIEVEMENTS_FILE, 'utf8');
    const fileData = JSON.parse(fileContent);
    
    if (Object.keys(fileData).length > 0) {
      await saveAllInterIITAchievements(fileData);
      console.log(`Migrated ${Object.keys(fileData).length} achievements to Vercel Blob`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log('No file system data to migrate or migration failed:', error);
    return false;
  }
}

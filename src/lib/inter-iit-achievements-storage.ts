import { promises as fs } from 'fs';
import path from 'path';
import { InterIITAchievement, defaultAchievementsData } from './inter-iit-achievements-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACHIEVEMENTS_FILE = path.join(DATA_DIR, 'inter-iit-achievements.json');

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get all Inter-IIT achievements
export async function getAllInterIITAchievements(): Promise<Record<string, InterIITAchievement>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ACHIEVEMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Inter-IIT achievements file not found, creating with default data');
    await saveAllInterIITAchievements(defaultAchievementsData);
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
    await ensureDataDir();
    
    // Create temporary file for atomic write
    const tempFile = `${ACHIEVEMENTS_FILE}.tmp`;
    const data = JSON.stringify(achievements, null, 2);
    
    // Write to temporary file first
    await fs.writeFile(tempFile, data);
    
    // Atomically move temp file to final location
    await fs.rename(tempFile, ACHIEVEMENTS_FILE);
    
    console.log('Inter-IIT achievements data saved successfully');
  } catch (error) {
    console.error('Error saving Inter-IIT achievements:', error);
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(`${ACHIEVEMENTS_FILE}.tmp`);
    } catch {
      // Ignore cleanup errors
    }
    
    throw new Error('Failed to save Inter-IIT achievements data');
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
    achievement.interIITEdition.toLowerCase().includes(lowercaseQuery) ||
    achievement.competitionCategory.toLowerCase().includes(lowercaseQuery) ||
    achievement.teamMembers.some(member => member.name.toLowerCase().includes(lowercaseQuery))
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
    stats.averageRanking = Math.round(totalRanking / rankedAchievements.length);
  }
  
  return stats;
}

// Get achievements by Inter-IIT edition
export async function getInterIITAchievementsByEdition(edition: string): Promise<InterIITAchievement[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  return achievements.filter(achievement => achievement.interIITEdition === edition);
}

// Get all unique years
export async function getInterIITAchievementYears(): Promise<string[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  const years = [...new Set(achievements.map(achievement => achievement.year))];
  return years.sort((a, b) => parseInt(b) - parseInt(a));
}

// Get all unique Inter-IIT editions
export async function getInterIITEditions(): Promise<string[]> {
  const achievements = await getInterIITAchievementsForDisplay();
  const editions = [...new Set(achievements.map(achievement => achievement.interIITEdition))];
  return editions.sort();
}

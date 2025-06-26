import { db, interIITAchievements, type InterIITAchievement, type NewInterIITAchievement } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Get all Inter-IIT achievements
export async function getAllInterIITAchievements(): Promise<InterIITAchievement[]> {
  try {
    const achievements = await db.select().from(interIITAchievements);
    return achievements;
  } catch (error) {
    console.error('Error fetching Inter-IIT achievements:', error);
    throw new Error('Failed to fetch Inter-IIT achievements');
  }
}

// Get Inter-IIT achievements for public display (only verified)
export async function getInterIITAchievementsForDisplay(): Promise<InterIITAchievement[]> {
  try {
    const achievements = await db
      .select()
      .from(interIITAchievements)
      .where(eq(interIITAchievements.status, 'verified'));
    
    // Sort by achievement date (most recent first)
    return achievements.sort((a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime());
  } catch (error) {
    console.error('Error fetching achievements for display:', error);
    throw new Error('Failed to fetch achievements for display');
  }
}

// Get Inter-IIT achievement by ID
export async function getInterIITAchievementById(id: string): Promise<InterIITAchievement | null> {
  try {
    const achievement = await db
      .select()
      .from(interIITAchievements)
      .where(eq(interIITAchievements.id, id))
      .limit(1);
    
    return achievement[0] || null;
  } catch (error) {
    console.error('Error fetching Inter-IIT achievement by ID:', error);
    throw new Error('Failed to fetch Inter-IIT achievement');
  }
}

// Create new Inter-IIT achievement
export async function createInterIITAchievement(
  achievement: Omit<NewInterIITAchievement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InterIITAchievement> {
  try {
    // Generate ID from competition name and year
    const baseId = `${achievement.competitionName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${achievement.year}`;
    
    // Check if ID already exists and make it unique
    let uniqueId = baseId;
    let counter = 1;
    
    while (true) {
      const existing = await getInterIITAchievementById(uniqueId);
      if (!existing) break;
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    const newAchievement: NewInterIITAchievement = {
      ...achievement,
      id: uniqueId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(interIITAchievements).values(newAchievement).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating Inter-IIT achievement:', error);
    throw new Error('Failed to create Inter-IIT achievement');
  }
}

// Update Inter-IIT achievement
export async function updateInterIITAchievement(
  id: string,
  updates: Partial<Omit<NewInterIITAchievement, 'id' | 'createdAt'>>
): Promise<InterIITAchievement> {
  try {
    const result = await db
      .update(interIITAchievements)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(interIITAchievements.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('Inter-IIT achievement not found');
    }

    return result[0];
  } catch (error) {
    console.error('Error updating Inter-IIT achievement:', error);
    throw new Error('Failed to update Inter-IIT achievement');
  }
}

// Delete Inter-IIT achievement
export async function deleteInterIITAchievement(id: string): Promise<void> {
  try {
    const result = await db
      .delete(interIITAchievements)
      .where(eq(interIITAchievements.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error('Inter-IIT achievement not found');
    }
  } catch (error) {
    console.error('Error deleting Inter-IIT achievement:', error);
    throw new Error('Failed to delete Inter-IIT achievement');
  }
}

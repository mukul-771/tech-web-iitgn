import { db } from '@/lib/db';
import { clubs, type Club, type NewClub } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get all clubs
export async function getAllClubs(): Promise<Club[]> {
  try {
    const allClubs = await db.select().from(clubs);
    return allClubs;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw new Error('Failed to fetch clubs');
  }
}

// Get club by ID
export async function getClubById(id: string): Promise<Club | null> {
  try {
    const [club] = await db
      .select()
      .from(clubs)
      .where(eq(clubs.id, id))
      .limit(1);
    return club || null;
  } catch (error) {
    console.error('Error fetching club by ID:', error);
    throw new Error('Failed to fetch club');
  }
}

// Create club
export async function createClub(clubData: NewClub): Promise<Club> {
  try {
    const [newClub] = await db
      .insert(clubs)
      .values(clubData)
      .returning();
    return newClub;
  } catch (error) {
    console.error('Error creating club:', error);
    throw new Error('Failed to create club');
  }
}

// Update club
export async function updateClub(id: string, clubData: Partial<NewClub>): Promise<Club> {
  try {
    const [updatedClub] = await db
      .update(clubs)
      .set({ ...clubData, updatedAt: new Date() })
      .where(eq(clubs.id, id))
      .returning();
    
    if (!updatedClub) {
      throw new Error('Club not found');
    }
    
    return updatedClub;
  } catch (error) {
    console.error('Error updating club:', error);
    throw new Error('Failed to update club');
  }
}

// Delete club
export async function deleteClub(id: string): Promise<void> {
  try {
    const result = await db
      .delete(clubs)
      .where(eq(clubs.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Club not found');
    }
  } catch (error) {
    console.error('Error deleting club:', error);
    throw new Error('Failed to delete club');
  }
}

// Get clubs by type
export async function getClubsByType(type: 'club' | 'hobby-group'): Promise<Club[]> {
  try {
    const clubsByType = await db
      .select()
      .from(clubs)
      .where(eq(clubs.type, type));
    return clubsByType;
  } catch (error) {
    console.error('Error fetching clubs by type:', error);
    throw new Error('Failed to fetch clubs by type');
  }
}

// Get clubs by category
export async function getClubsByCategory(category: string): Promise<Club[]> {
  try {
    const clubsByCategory = await db
      .select()
      .from(clubs)
      .where(eq(clubs.category, category));
    return clubsByCategory;
  } catch (error) {
    console.error('Error fetching clubs by category:', error);
    throw new Error('Failed to fetch clubs by category');
  }
}

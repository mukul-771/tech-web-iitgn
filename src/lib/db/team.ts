import { db, teamMembers, type TeamMemberDB, type NewTeamMemberDB } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Get all team members
export async function getAllTeamMembers(): Promise<TeamMemberDB[]> {
  try {
    const members = await db.select().from(teamMembers);
    return members;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw new Error('Failed to fetch team members');
  }
}

// Get team members by category
export async function getTeamMembersByCategory(category: string): Promise<TeamMemberDB[]> {
  try {
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.category, category));
    return members;
  } catch (error) {
    console.error('Error fetching team members by category:', error);
    throw new Error('Failed to fetch team members by category');
  }
}

// Get team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMemberDB | null> {
  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id))
      .limit(1);
    return member || null;
  } catch (error) {
    console.error('Error fetching team member by ID:', error);
    throw new Error('Failed to fetch team member');
  }
}

// Get team member by email
export async function getTeamMemberByEmail(email: string): Promise<TeamMemberDB | null> {
  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.email, email))
      .limit(1);
    return member || null;
  } catch (error) {
    console.error('Error fetching team member by email:', error);
    throw new Error('Failed to fetch team member by email');
  }
}

// Create new team member
export async function createTeamMember(
  member: Omit<NewTeamMemberDB, 'createdAt' | 'updatedAt'>
): Promise<TeamMemberDB> {
  try {
    const [newMember] = await db
      .insert(teamMembers)
      .values({
        ...member,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newMember;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw new Error('Failed to create team member');
  }
}

// Update team member
export async function updateTeamMember(
  id: string,
  updates: Partial<Omit<NewTeamMemberDB, 'id' | 'createdAt'>>
): Promise<TeamMemberDB> {
  try {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, id))
      .returning();
    
    if (!updatedMember) {
      throw new Error('Team member not found');
    }
    
    return updatedMember;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw new Error('Failed to update team member');
  }
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const result = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id));
    
    if (result.rowCount === 0) {
      throw new Error('Team member not found');
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw new Error('Failed to delete team member');
  }
}

// Get leadership team (secretary + coordinators)
export async function getLeadershipTeam(): Promise<TeamMemberDB[]> {
  try {
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isSecretary, true))
      .union(
        db
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.isCoordinator, true))
      );
    return members;
  } catch (error) {
    console.error('Error fetching leadership team:', error);
    throw new Error('Failed to fetch leadership team');
  }
}

// Bulk create team members (for migration)
export async function bulkCreateTeamMembers(
  members: Omit<NewTeamMemberDB, 'createdAt' | 'updatedAt'>[]
): Promise<TeamMemberDB[]> {
  try {
    const now = new Date();
    const membersWithTimestamps = members.map(member => ({
      ...member,
      createdAt: now,
      updatedAt: now,
    }));
    
    const newMembers = await db
      .insert(teamMembers)
      .values(membersWithTimestamps)
      .returning();
    
    return newMembers;
  } catch (error) {
    console.error('Error bulk creating team members:', error);
    throw new Error('Failed to bulk create team members');
  }
}

import { TeamMemberDB, NewTeamMemberDB } from '@/lib/db';
import * as dbTeam from '@/lib/db/team';
import * as blobTeam from '@/lib/team-storage-blob';

// Check if database is available
const isDatabaseAvailable = !!process.env.DATABASE_URL;
const useDatabase = process.env.NODE_ENV === 'production' && isDatabaseAvailable;

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  email: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  category: string;
  photoPath?: string;
  isSecretary: boolean;
  isCoordinator: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamData {
  [id: string]: TeamMember;
}

// Transform database record to frontend format
function dbToFrontend(dbMember: TeamMemberDB): TeamMember {
  return {
    id: dbMember.id,
    name: dbMember.name,
    position: dbMember.position,
    email: dbMember.email,
    initials: dbMember.initials,
    gradientFrom: dbMember.gradientFrom,
    gradientTo: dbMember.gradientTo,
    category: dbMember.category,
    photoPath: dbMember.photoPath || undefined,
    isSecretary: dbMember.isSecretary,
    isCoordinator: dbMember.isCoordinator,
    createdAt: dbMember.createdAt.toISOString(),
    updatedAt: dbMember.updatedAt.toISOString(),
  };
}

// Transform frontend data to database format
function frontendToDb(member: TeamMember): Omit<NewTeamMemberDB, 'createdAt' | 'updatedAt'> {
  return {
    id: member.id,
    name: member.name,
    position: member.position,
    email: member.email,
    initials: member.initials,
    gradientFrom: member.gradientFrom,
    gradientTo: member.gradientTo,
    category: member.category,
    photoPath: member.photoPath || null,
    isSecretary: member.isSecretary,
    isCoordinator: member.isCoordinator,
  };
}

// Get all team members
export async function getAllTeamMembers(): Promise<TeamData> {
  try {
    if (useDatabase) {
      console.log('🗄️ Fetching team members from database...');
      const dbMembers = await dbTeam.getAllTeamMembers();
      const teamData: TeamData = {};
      
      for (const dbMember of dbMembers) {
        const frontendMember = dbToFrontend(dbMember);
        teamData[frontendMember.id] = frontendMember;
      }
      
      return teamData;
    } else {
      console.log('📁 Fetching team members from blob storage...');
      return await blobTeam.getAllTeamMembers();
    }
  } catch (error) {
    console.error('Error fetching team members:', error);
    // Fallback to blob storage if database fails
    if (useDatabase) {
      console.log('Database failed, falling back to blob storage...');
      return await blobTeam.getAllTeamMembers();
    }
    throw error;
  }
}

// Get team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    if (useDatabase) {
      const dbMember = await dbTeam.getTeamMemberById(id);
      return dbMember ? dbToFrontend(dbMember) : null;
    } else {
      const teamData = await blobTeam.getAllTeamMembers();
      return teamData[id] || null;
    }
  } catch (error) {
    console.error('Error fetching team member by ID:', error);
    // Fallback to blob storage if database fails
    if (useDatabase) {
      const teamData = await blobTeam.getAllTeamMembers();
      return teamData[id] || null;
    }
    throw error;
  }
}

// Create team member
export async function createTeamMember(member: Omit<TeamMember, 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
  try {
    const now = new Date().toISOString();
    const fullMember: TeamMember = {
      ...member,
      createdAt: now,
      updatedAt: now,
    };

    if (useDatabase) {
      const dbData = frontendToDb(fullMember);
      const createdDbMember = await dbTeam.createTeamMember(dbData);
      return dbToFrontend(createdDbMember);
    } else {
      await blobTeam.createTeamMember(fullMember);
      return fullMember;
    }
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
}

// Update team member
export async function updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<TeamMember> {
  try {
    if (useDatabase) {
      const dbUpdates: Partial<Omit<NewTeamMemberDB, 'id' | 'createdAt'>> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.initials !== undefined) dbUpdates.initials = updates.initials;
      if (updates.gradientFrom !== undefined) dbUpdates.gradientFrom = updates.gradientFrom;
      if (updates.gradientTo !== undefined) dbUpdates.gradientTo = updates.gradientTo;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.photoPath !== undefined) dbUpdates.photoPath = updates.photoPath || null;
      if (updates.isSecretary !== undefined) dbUpdates.isSecretary = updates.isSecretary;
      if (updates.isCoordinator !== undefined) dbUpdates.isCoordinator = updates.isCoordinator;
      
      const updatedDbMember = await dbTeam.updateTeamMember(id, dbUpdates);
      return dbToFrontend(updatedDbMember);
    } else {
      const updatedMember = await blobTeam.updateTeamMember(id, updates);
      return updatedMember;
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    if (useDatabase) {
      await dbTeam.deleteTeamMember(id);
    } else {
      await blobTeam.deleteTeamMember(id);
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
}

// Get team members by category
export async function getTeamMembersByCategory(category: string): Promise<TeamMember[]> {
  try {
    if (useDatabase) {
      const dbMembers = await dbTeam.getTeamMembersByCategory(category);
      return dbMembers.map(dbToFrontend);
    } else {
      const teamData = await blobTeam.getAllTeamMembers();
      return Object.values(teamData).filter(member => member.category === category);
    }
  } catch (error) {
    console.error('Error fetching team members by category:', error);
    throw error;
  }
}

// Get leadership team
export async function getLeadershipTeam(): Promise<TeamMember[]> {
  try {
    if (useDatabase) {
      const dbMembers = await dbTeam.getLeadershipTeam();
      return dbMembers.map(dbToFrontend);
    } else {
      const teamData = await blobTeam.getAllTeamMembers();
      return Object.values(teamData).filter(member => 
        member.isSecretary || member.isCoordinator
      );
    }
  } catch (error) {
    console.error('Error fetching leadership team:', error);
    throw error;
  }
}

// Migration helper: Check which storage is being used
export function getStorageInfo() {
  return {
    useDatabase,
    isDatabaseAvailable,
    currentStorage: useDatabase ? 'database' : 'blob',
    environment: process.env.NODE_ENV,
  };
}

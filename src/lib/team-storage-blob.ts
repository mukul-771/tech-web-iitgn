import { put, head, list, del } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';

// Check if we're in development and Blob is not available
const isDev = process.env.NODE_ENV === 'development';
const isBlobAvailable = process.env.BLOB_READ_WRITE_TOKEN;
const TEAM_JSON_PATH = path.join(process.cwd(), 'data', 'team.json');
const TEAM_BLOB_FILENAME = 'team-data.json';

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

export async function getAllTeamMembers(): Promise<TeamData> {
  try {
    // If in development and Blob is not available, fallback to JSON file
    if (isDev && !isBlobAvailable) {
      console.log('Development mode: Blob not available, loading team data from JSON file');
      try {
        const data = await fs.readFile(TEAM_JSON_PATH, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.warn('Failed to read JSON file, returning empty data:', error);
        return {};
      }
    }
    
    // Try to fetch from Vercel Blob
    try {
      const { blobs } = await list({ prefix: TEAM_BLOB_FILENAME });
      if (blobs.length === 0) {
        console.log('No team data found in Blob storage, returning empty object');
        return {};
      }
      
      const response = await fetch(blobs[0].url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Failed to fetch from Blob storage, trying JSON fallback:', error);
      // Fallback to JSON file
      try {
        const data = await fs.readFile(TEAM_JSON_PATH, 'utf8');
        return JSON.parse(data);
      } catch {
        return {};
      }
    }
  } catch (error) {
    console.error('Error fetching team data:', error);
    throw error;
  }
}

export async function getTeamMember(id: string): Promise<TeamMember | null> {
  try {
    const allData = await getAllTeamMembers();
    return allData[id] || null;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw new Error('Failed to fetch team member');
  }
}

export async function createTeamMember(memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
  try {
    // Generate ID from name
    const id = memberData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newMember: TeamMember = {
      ...memberData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get current data
    const allData = await getAllTeamMembers();
    
    // Check if member already exists
    if (allData[id]) {
      throw new Error('Team member with this name already exists');
    }
    
    // Add new member
    allData[id] = newMember;
    
    // Save back to storage
    await saveTeamData(allData);
    
    console.log('Team member created:', id);
    return newMember;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
}

export async function updateTeamMember(id: string, updateData: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<TeamMember> {
  try {
    // Get current data
    const allData = await getAllTeamMembers();
    
    // Check if member exists
    if (!allData[id]) {
      throw new Error('Team member not found');
    }
    
    // Update member
    const updatedMember: TeamMember = {
      ...allData[id],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    allData[id] = updatedMember;
    
    // Save back to storage
    await saveTeamData(allData);
    
    console.log('Team member updated:', id);
    return updatedMember;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  try {
    // Get current data
    const allData = await getAllTeamMembers();
    
    // Check if member exists
    if (!allData[id]) {
      throw new Error('Team member not found');
    }
    
    // Delete member
    delete allData[id];
    
    // Save back to storage
    await saveTeamData(allData);
    
    console.log('Team member deleted:', id);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
}

// Helper function to save team data
async function saveTeamData(data: TeamData): Promise<void> {
  if (isDev && !isBlobAvailable) {
    console.log('Development mode: Blob not available, saving team data to JSON file');
    await fs.writeFile(TEAM_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    return;
  }
  
  try {
    // Delete existing blob if it exists
    const { blobs } = await list({ prefix: TEAM_BLOB_FILENAME });
    for (const blob of blobs) {
      await del(blob.url);
    }
    
    // Upload new data to Blob
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    await put(TEAM_BLOB_FILENAME, blob, {
      access: 'public',
    });
    
    console.log('Team data saved to Blob storage');
  } catch (error) {
    console.error('Error saving to Blob storage:', error);
    throw error;
  }
}

// Migration function to move data from JSON to Blob
export async function migrateTeamDataToBlob(): Promise<void> {
  try {
    // Skip migration in development when Blob is not available
    if (isDev && !isBlobAvailable) {
      console.log('Development mode: Blob not available, skipping migration');
      return;
    }
    
    // Check if data already exists in Blob
    const { blobs } = await list({ prefix: TEAM_BLOB_FILENAME });
    if (blobs.length > 0) {
      console.log('Team data already exists in Blob storage, skipping migration');
      return;
    }
    
    // Try to load from JSON file and migrate
    try {
      const data = await fs.readFile(TEAM_JSON_PATH, 'utf8');
      const jsonData = JSON.parse(data);
      await saveTeamData(jsonData);
      console.log('Successfully migrated team data from JSON to Blob storage');
    } catch {
      console.log('Could not read JSON file, initializing empty team data in Blob storage');
      await saveTeamData({});
    }
  } catch (error) {
    console.error('Error during team data migration:', error);
    throw error;
  }
}

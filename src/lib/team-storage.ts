import { promises as fs } from 'fs';
import path from 'path';
import {
  TeamMember,
  defaultTeamData,
  getCategoryFromPosition,
  isSecretaryPosition,
  isCoordinatorPosition
} from './team-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const TEAM_FILE = path.join(DATA_DIR, 'team.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Initialize team file if it doesn't exist
async function initializeTeamFile() {
  try {
    await fs.access(TEAM_FILE);
  } catch {
    await fs.writeFile(TEAM_FILE, JSON.stringify(defaultTeamData, null, 2));
  }
}

// Migrate team member data to ensure correct category mappings
function migrateTeamMemberData(teamMembers: Record<string, TeamMember>): Record<string, TeamMember> {
  const migratedMembers: Record<string, TeamMember> = {};

  for (const [id, member] of Object.entries(teamMembers)) {
    const correctCategory = getCategoryFromPosition(member.position);
    const isSecretary = isSecretaryPosition(member.position);
    const isCoordinator = isCoordinatorPosition(member.position);

    migratedMembers[id] = {
      ...member,
      category: correctCategory,
      isSecretary,
      isCoordinator,
      updatedAt: new Date().toISOString()
    };
  }

  return migratedMembers;
}

// Get all team members
export async function getAllTeamMembers(): Promise<Record<string, TeamMember>> {
  try {
    await ensureDataDir();
    await initializeTeamFile();

    const data = await fs.readFile(TEAM_FILE, 'utf-8');
    const teamMembers = JSON.parse(data);

    // Migrate data to ensure correct mappings
    const migratedMembers = migrateTeamMemberData(teamMembers);

    // Save migrated data if there were changes
    const hasChanges = JSON.stringify(teamMembers) !== JSON.stringify(migratedMembers);
    if (hasChanges) {
      await saveAllTeamMembers(migratedMembers);
    }

    return migratedMembers;
  } catch (error) {
    console.error('Error reading team members:', error);
    return defaultTeamData;
  }
}

// Get single team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const teamMembers = await getAllTeamMembers();
  return teamMembers[id] || null;
}

// Save all team members
export async function saveAllTeamMembers(teamMembers: Record<string, TeamMember>): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(TEAM_FILE, JSON.stringify(teamMembers, null, 2));
  } catch (error) {
    console.error('Error saving team members:', error);
    throw new Error('Failed to save team members');
  }
}

// Create new team member
export async function createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
  const teamMembers = await getAllTeamMembers();

  const id = generateMemberId(member.name);
  const now = new Date().toISOString();

  // Ensure correct category mapping based on position
  const correctCategory = getCategoryFromPosition(member.position);
  const isSecretary = isSecretaryPosition(member.position);
  const isCoordinator = isCoordinatorPosition(member.position);

  const newMember: TeamMember = {
    ...member,
    id,
    category: correctCategory,
    isSecretary,
    isCoordinator,
    createdAt: now,
    updatedAt: now
  };

  teamMembers[id] = newMember;
  await saveAllTeamMembers(teamMembers);

  return newMember;
}

// Update existing team member
export async function updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<TeamMember | null> {
  const teamMembers = await getAllTeamMembers();

  if (!teamMembers[id]) {
    return null;
  }

  // If position is being updated, ensure correct category mapping
  const finalUpdates = updates.position ? {
    ...updates,
    category: getCategoryFromPosition(updates.position),
    isSecretary: isSecretaryPosition(updates.position),
    isCoordinator: isCoordinatorPosition(updates.position)
  } : updates;

  const updatedMember: TeamMember = {
    ...teamMembers[id],
    ...finalUpdates,
    updatedAt: new Date().toISOString()
  };

  teamMembers[id] = updatedMember;
  await saveAllTeamMembers(teamMembers);

  return updatedMember;
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<boolean> {
  const teamMembers = await getAllTeamMembers();

  if (!teamMembers[id]) {
    return false;
  }

  delete teamMembers[id];
  await saveAllTeamMembers(teamMembers);

  return true;
}

// Generate member ID from name
function generateMemberId(name: string): string {
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const timestamp = Date.now().toString().slice(-6);
  return `${baseId}-${timestamp}`;
}

// Get team members by category
export async function getTeamMembersByCategory(category: string): Promise<TeamMember[]> {
  const teamMembers = await getAllTeamMembers();
  return Object.values(teamMembers).filter(member => member.category === category);
}

// Get leadership team (secretary + coordinators)
export async function getLeadershipTeam(): Promise<{
  secretary: TeamMember | null;
  coordinators: TeamMember[];
}> {
  const teamMembers = await getAllTeamMembers();
  const allMembers = Object.values(teamMembers);

  const secretary = allMembers.find(member => member.isSecretary) || null;
  const coordinators = allMembers.filter(member => member.isCoordinator);

  return { secretary, coordinators };
}

// Get team members for public display
export async function getTeamMembersForDisplay(): Promise<Array<{
  id: string;
  name: string;
  position: string;
  email: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  category: string;
  photoPath?: string;
}>> {
  const teamMembers = await getAllTeamMembers();

  return Object.values(teamMembers).map(member => ({
    id: member.id,
    name: member.name,
    position: member.position,
    email: member.email,
    initials: member.initials,
    gradientFrom: member.gradientFrom,
    gradientTo: member.gradientTo,
    category: member.category,
    photoPath: member.photoPath
  }));
}

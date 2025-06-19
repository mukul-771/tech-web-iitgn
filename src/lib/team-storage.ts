import {
  TeamMember,
  defaultTeamData,
  getCategoryFromPosition,
  isSecretaryPosition,
  isCoordinatorPosition
} from './team-data';

const TEAM_COLLECTION = 'team';

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
    const response = await fetch(`/api/team`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch team members');
    }

    const teamMembers: Record<string, TeamMember> = data.members;

    // Migrate data to ensure correct mappings
    const migratedMembers = migrateTeamMemberData(teamMembers);

    // Save migrated data if there were changes
    const hasChanges = JSON.stringify(teamMembers) !== JSON.stringify(migratedMembers);
    if (hasChanges) {
      await saveAllTeamMembers(migratedMembers);
    }

    return migratedMembers;
  } catch (error) {
    console.error('Error fetching team members:', error);
    return defaultTeamData;
  }
}

// Get single team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    const response = await fetch(`/api/team/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch team member');
    }

    return data.member;
  } catch (error) {
    console.error('Error fetching team member by ID:', error);
    return null;
  }
}

// Save all team members (overwrites the collection)
export async function saveAllTeamMembers(teamMembers: Record<string, TeamMember>): Promise<void> {
  try {
    const response = await fetch(`/api/team`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ members: teamMembers })
    });

    if (!response.ok) {
      throw new Error('Failed to save team members');
    }
  } catch (error) {
    console.error('Error saving team members:', error);
  }
}

// Create new team member
export async function createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
  try {
    const response = await fetch(`/api/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(member)
    });

    if (!response.ok) {
      throw new Error('Failed to create team member');
    }

    const data = await response.json();
    return data.member;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
}

// Update existing team member
export async function updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<TeamMember | null> {
  try {
    const response = await fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update team member');
    }

    const data = await response.json();
    return data.member;
  } catch (error) {
    console.error('Error updating team member:', error);
    return null;
  }
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/team/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete team member');
    }

    return true;
  } catch (error) {
    console.error('Error deleting team member:', error);
    return false;
  }
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
  const all = await getAllTeamMembers();
  return Object.values(all).filter(member => member.category === category);
}

// Get leadership team (secretary + coordinators)
export async function getLeadershipTeam(): Promise<{
  secretary: TeamMember | null;
  coordinators: TeamMember[];
}> {
  const all = await getAllTeamMembers();
  const allMembers = Object.values(all);

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
  const all = await getAllTeamMembers();

  return Object.values(all).map(member => ({
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

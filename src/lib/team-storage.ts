import { firestore } from './firebase-admin';
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
  if (!firestore) {
    console.error('Firestore not initialized. Returning default data.');
    return defaultTeamData;
  }

  try {
    const snapshot = await firestore.collection(TEAM_COLLECTION).get();
    if (snapshot.empty) {
      // Optionally seed Firestore with default data if empty
      for (const [id, member] of Object.entries(defaultTeamData)) {
        await firestore.collection(TEAM_COLLECTION).doc(id).set(member);
      }
      return defaultTeamData;
    }

    const teamMembers: Record<string, TeamMember> = {};
    snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      teamMembers[doc.id] = doc.data() as TeamMember;
    });

    // Migrate data to ensure correct mappings
    const migratedMembers = migrateTeamMemberData(teamMembers);

    // Save migrated data if there were changes
    const hasChanges = JSON.stringify(teamMembers) !== JSON.stringify(migratedMembers);
    if (hasChanges) {
      await saveAllTeamMembers(migratedMembers);
    }

    return migratedMembers;
  } catch (error) {
    console.error('Error reading team members from Firestore:', error);
    return defaultTeamData;
  }
}

// Get single team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  if (!firestore) return null;

  try {
    const doc = await firestore.collection(TEAM_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as TeamMember;
  } catch (error) {
    console.error('Error fetching team member by ID:', error);
    return null;
  }
}

// Save all team members (overwrites the collection)
export async function saveAllTeamMembers(teamMembers: Record<string, TeamMember>): Promise<void> {
  if (!firestore) throw new Error('Firestore not initialized');

  const batch = firestore.batch();
  const collectionRef = firestore.collection(TEAM_COLLECTION);

  // Delete all existing docs first
  const snapshot = await collectionRef.get();
  snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => batch.delete(doc.ref));

  // Add new docs
  for (const [id, member] of Object.entries(teamMembers)) {
    batch.set(collectionRef.doc(id), member);
  }
  await batch.commit();
}

// Create new team member
export async function createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
  if (!firestore) throw new Error('Firestore not initialized');

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

  await firestore.collection(TEAM_COLLECTION).doc(id).set(newMember);

  return newMember;
}

// Update existing team member
export async function updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<TeamMember | null> {
  if (!firestore) throw new Error('Firestore not initialized');

  const docRef = firestore.collection(TEAM_COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const existing = doc.data() as TeamMember;

  // If position is being updated, ensure correct category mapping
  const finalUpdates = updates.position ? {
    ...updates,
    category: getCategoryFromPosition(updates.position),
    isSecretary: isSecretaryPosition(updates.position),
    isCoordinator: isCoordinatorPosition(updates.position)
  } : updates;

  const updatedMember: TeamMember = {
    ...existing,
    ...finalUpdates,
    updatedAt: new Date().toISOString()
  };

  await docRef.set(updatedMember);

  return updatedMember;
}

// Delete team member
export async function deleteTeamMember(id: string): Promise<boolean> {
  if (!firestore) throw new Error('Firestore not initialized');

  const docRef = firestore.collection(TEAM_COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return false;

  await docRef.delete();

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

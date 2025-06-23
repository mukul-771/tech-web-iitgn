import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export interface TeamMember {
  id?: string;
  name: string;
  position: string;
  email: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  category: string;
  photoPath?: string;
  isSecretary?: boolean;
  isCoordinator?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all team members (server-side)
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('team').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TeamMember[];
  } catch (error) {
    console.error('Error getting team members:', error);
    throw new Error('Failed to get team members');
  }
}

// Create a team member (server-side)
export async function createTeamMember(data: Omit<TeamMember, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const db = getFirestore();
    const now = new Date().toISOString();
    const docRef = await db.collection('team').add({ ...data, createdAt: now, updatedAt: now });
    return docRef.id;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw new Error('Failed to create team member');
  }
}

// Update a team member (server-side)
export async function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<void> {
  try {
    const db = getFirestore();
    await db.collection('team').doc(id).update({ ...data, updatedAt: new Date().toISOString() });
    console.log('Team member updated successfully:', { id, data });
  } catch (error) {
    console.error('Error updating team member:', error);
    throw new Error(`Failed to update team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete a team member (server-side)
export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const db = getFirestore();
    await db.collection('team').doc(id).delete();
    console.log('Team member deleted successfully:', { id });
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw new Error('Failed to delete team member');
  }
}

// Get a team member by ID (server-side)
export async function getTeamMember(id: string): Promise<TeamMember | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('team').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as TeamMember;
  } catch (error) {
    console.error('Error getting team member:', error);
    throw new Error('Failed to get team member');
  }
}

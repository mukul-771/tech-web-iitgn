import { db } from "./firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

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

// Get all team members
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  if (!db) throw new Error("Firestore not initialized");
  const snapshot = await getDocs(collection(db, "team"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TeamMember[];
}

// Create a team member
export async function createTeamMember(data: Omit<TeamMember, "id" | "createdAt" | "updatedAt">): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, "team"), { ...data, createdAt: now, updatedAt: now });
  return docRef.id;
}

// Update a team member
export async function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, "team", id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
}

// Delete a team member
export async function deleteTeamMember(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, "team", id);
  await deleteDoc(docRef);
}

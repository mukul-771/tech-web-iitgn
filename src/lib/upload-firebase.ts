import { storage } from "./firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sanitizeFirebaseUrl } from "./image-utils";

export async function uploadTeamPhoto(file: File, teamMemberId: string): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not initialized");
  const storageRef = ref(storage, `team/${teamMemberId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return sanitizeFirebaseUrl(url);
}

// Generic upload for any file type/location
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!storage) throw new Error("Firebase Storage not initialized");
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return sanitizeFirebaseUrl(url);
}

import { storage } from "./firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Utility to sanitize Firebase Storage URLs (decode if double-encoded)
function sanitizeFirebaseUrl(url: string): string {
  try {
    // If the URL is double-encoded, decode it once
    const decoded = decodeURIComponent(url);
    // If decoding again changes it, it was double-encoded
    if (decodeURIComponent(decoded) !== decoded) {
      return decodeURIComponent(decoded);
    }
    return decoded;
  } catch {
    return url;
  }
}

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

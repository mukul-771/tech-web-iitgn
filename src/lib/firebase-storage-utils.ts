import { storage } from "./firebase-config";
import { ref, getDownloadURL, listAll } from "firebase/storage";

/**
 * Get a fresh download URL for a Firebase Storage file
 */
export async function getFreshDownloadUrl(storagePath: string): Promise<string | null> {
  if (!storage) {
    console.error("Firebase Storage not initialized");
    return null;
  }

  try {
    const storageRef = ref(storage, storagePath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error getting fresh download URL:", error);
    return null;
  }
}

/**
 * Extract the storage path from a Firebase Storage URL
 */
export function extractStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Firebase Storage URLs have the format: /v0/b/{bucket}/o/{path}
    const match = pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting storage path:", error);
    return null;
  }
}

/**
 * Get a fresh download URL from an existing Firebase Storage URL
 */
export async function refreshFirebaseStorageUrl(oldUrl: string): Promise<string | null> {
  const storagePath = extractStoragePathFromUrl(oldUrl);
  if (!storagePath) {
    console.error("Could not extract storage path from URL:", oldUrl);
    return null;
  }

  return await getFreshDownloadUrl(storagePath);
}

/**
 * List all files in a Firebase Storage directory
 */
export async function listStorageFiles(path: string = "team/"): Promise<string[]> {
  if (!storage) {
    console.error("Firebase Storage not initialized");
    return [];
  }

  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files: string[] = [];
    
    // Add files from current directory
    for (const item of result.items) {
      files.push(item.fullPath);
    }
    
    // Recursively get files from subdirectories
    for (const prefix of result.prefixes) {
      const subFiles = await listStorageFiles(prefix.fullPath + "/");
      files.push(...subFiles);
    }
    
    return files;
  } catch (error) {
    console.error("Error listing storage files:", error);
    return [];
  }
}

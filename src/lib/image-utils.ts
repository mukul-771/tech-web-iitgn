/**
 * Utility functions for working with Firebase storage URLs
 * and other common operations related to image handling
 */

/**
 * Sanitizes a Firebase Storage URL to prevent double-encoding issues.
 * @param url The Firebase Storage URL to sanitize
 * @returns The sanitized URL that can be safely used in img tags and Next.js Image component
 */
export function sanitizeFirebaseUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  try {
    // If URL appears to be a Firebase Storage URL
    if (url.includes("firebasestorage.googleapis.com")) {
      // First decode if the URL contains encoded characters to prevent double-encoding
      let processedUrl = url;
      if (url.includes("%2F") || url.includes("%3A") || url.includes("%3F") || url.includes("%3D")) {
        // Decode it once to handle double-encoding
        processedUrl = decodeURIComponent(url);
      }
      
      // Ensure the URL has the alt=media parameter which is REQUIRED for direct image access
      if (!processedUrl.includes("alt=media")) {
        // Add query parameters to ensure the URL is directly accessible
        const separator = processedUrl.includes("?") ? "&" : "?";
        return `${processedUrl}${separator}alt=media`;
      }
      
      return processedUrl;
    }
    
    // For other URLs, just return as-is
    return url;
  } catch {
    // If decoding fails for any reason, return the original
    return url || "";
  }
}

/**
 * Checks if a URL is a valid Firebase Storage URL
 */
export function isFirebaseStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("firebasestorage.googleapis.com");
}

/**
 * Ensures a Firebase Storage URL has the correct parameters for direct access
 * Useful when uploading images and getting back URLs that might not have access tokens
 */
export function ensureDirectAccessUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  try {
    if (isFirebaseStorageUrl(url)) {
      // First decode if needed to prevent double-encoding issues
      let processedUrl = url;
      if (url.includes("%2F") || url.includes("%3A") || url.includes("%3F") || url.includes("%3D")) {
        processedUrl = decodeURIComponent(url);
      }
      
      // Make sure the URL has the alt=media parameter needed for direct access
      if (!processedUrl.includes("alt=media")) {
        const separator = processedUrl.includes("?") ? "&" : "?";
        return `${processedUrl}${separator}alt=media`;
      }
      
      return processedUrl;
    }
    return url;
  } catch {
    return url || "";
  }
}

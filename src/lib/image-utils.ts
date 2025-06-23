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
      
      // Parse the URL to properly encode the path
      const urlObj = new URL(processedUrl);
      
      // Re-encode the pathname to ensure proper encoding of spaces and special characters
      const pathParts = urlObj.pathname.split('/');
      const encodedPath = pathParts.map(part => 
        part === '' ? '' : encodeURIComponent(decodeURIComponent(part))
      ).join('/');
      urlObj.pathname = encodedPath;
      
      // Ensure the URL has the alt=media parameter which is REQUIRED for direct image access
      if (!urlObj.searchParams.has('alt') || urlObj.searchParams.get('alt') !== 'media') {
        urlObj.searchParams.set('alt', 'media');
      }
      
      return urlObj.toString();
    }
    
    // For other URLs, just return as-is
    return url;
  } catch (error) {
    console.error('Error sanitizing Firebase URL:', error, 'Original URL:', url);
    // If URL parsing fails for any reason, return the original
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
      
      // Parse the URL to properly encode the path
      const urlObj = new URL(processedUrl);
      
      // Re-encode the pathname to ensure proper encoding of spaces and special characters
      const pathParts = urlObj.pathname.split('/');
      const encodedPath = pathParts.map(part => 
        part === '' ? '' : encodeURIComponent(decodeURIComponent(part))
      ).join('/');
      urlObj.pathname = encodedPath;
      
      // Make sure the URL has the alt=media parameter needed for direct access
      if (!urlObj.searchParams.has('alt') || urlObj.searchParams.get('alt') !== 'media') {
        urlObj.searchParams.set('alt', 'media');
      }
      
      return urlObj.toString();
    }
    return url;
  } catch (error) {
    console.error('Error ensuring direct access URL:', error, 'Original URL:', url);
    return url || "";
  }
}

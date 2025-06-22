"use client";

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
      // Try to decode it in case it's double-encoded
      const decoded = decodeURIComponent(url);
      if (decoded !== url && decodeURIComponent(decoded) === decoded) {
        return decoded;
      }
      return url;
    }
    
    // For other URLs, just return as-is
    return url;
  } catch {
    // If decoding fails for any reason, return the original
    console.warn("Failed to sanitize URL:", url);
    return url || "";
  }
}

/**
 * Checks if a URL is a valid Firebase Storage URL
 */
export function isFirebaseStorageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("https://firebasestorage.googleapis.com");
}

/**
 * Gets a relative URL for Firebase Storage URLs to work better with Next.js Image component
 */
export function getOptimizedImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  const sanitized = sanitizeFirebaseUrl(url);
  
  // Log the URL for debugging
  console.debug("Image URL optimized:", {
    original: url,
    sanitized: sanitized,
  });
  
  return sanitized;
}

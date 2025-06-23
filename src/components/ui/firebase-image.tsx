"use client";

import Image, { ImageProps } from "next/image";
import { sanitizeFirebaseUrl } from "@/lib/image-utils";
import { useState, useEffect } from "react";

interface FirebaseImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallback?: string;
}

/**
 * A wrapper around Next.js Image component that properly handles Firebase Storage URLs
 * and provides fallback handling for broken images
 */
export function FirebaseImage({ 
  src, 
  fallback = "/placeholder-avatar.svg",
  alt,
  onError,
  ...props 
}: FirebaseImageProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setImgSrc(fallback);
      setIsLoading(false);
      return;
    }

    const sanitizedUrl = sanitizeFirebaseUrl(src);
    setIsLoading(true);
    
    // Test if the image URL is accessible
    const img = new window.Image();
    img.onload = () => {
      setImgSrc(sanitizedUrl);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      console.warn('Failed to load Firebase Storage image:', sanitizedUrl);
      console.warn('This usually means the file doesn\'t exist or Firebase Storage permissions need to be configured');
      setImgSrc(fallback);
      setIsLoading(false);
      setHasError(true);
    };
    img.src = sanitizedUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Image error:', e);
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
    onError?.(e);
  };

  if (isLoading) {
    // Show a loading placeholder
    return (
      <div 
        className={`${props.className} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center`}
        style={{ width: props.width, height: props.height }}
      >
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
}

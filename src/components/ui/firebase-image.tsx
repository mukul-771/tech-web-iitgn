"use client";

import Image, { ImageProps } from "next/image";
import { sanitizeFirebaseUrl } from "@/lib/image-utils";
import { useState } from "react";

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
  fallback = "/placeholder-avatar.png",
  alt,
  onError,
  ...props 
}: FirebaseImageProps) {
  const [imgSrc, setImgSrc] = useState(() => sanitizeFirebaseUrl(src) || fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
    onError?.(e);
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
}

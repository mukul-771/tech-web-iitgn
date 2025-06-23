"use client";

import Image from "next/image";
import { useState } from "react";

interface TeamMemberImageProps {
  src: string | null | undefined;
  alt: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  width: number;
  height: number;
  className?: string;
  isSecretary?: boolean;
}

/**
 * A component specifically for team member images that shows gradient fallback
 * when Firebase Storage images fail to load
 */
export function TeamMemberImage({ 
  src, 
  alt, 
  initials,
  gradientFrom,
  gradientTo,
  width,
  height,
  className = "",
  isSecretary = false
}: TeamMemberImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  // If no photo path or image failed to load, show gradient
  const showGradient = !src || imageError;

  const gradientSizeClasses = isSecretary 
    ? "text-4xl sm:text-5xl md:text-6xl" 
    : "text-xl sm:text-2xl md:text-2xl lg:text-3xl";

  return (
    <div className={`relative ${className}`}>
      {showGradient ? (
        <div className={`w-full h-full rounded-xl bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center text-white font-bold ${gradientSizeClasses}`}>
          {initials}
        </div>
      ) : (
        <div className="relative">
          <Image
            src={src || "/placeholder-avatar.svg"}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-full object-cover rounded-xl"
            onLoad={handleImageLoad}
            onError={handleImageError}
            unoptimized
          />
          {/* Show gradient overlay if image is loading or failed */}
          {!imageLoaded && (
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center text-white font-bold ${gradientSizeClasses}`}>
              {initials}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

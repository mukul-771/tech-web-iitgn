"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageSliderProps {
  images: Array<string | { url: string; alt: string; caption?: string }>;
  eventTitle: string;
}

export function ImageSlider({ images, eventTitle }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize images to have consistent structure
  const normalizedImages = images.map((img, index) => {
    if (typeof img === 'string') {
      return { url: img, alt: `${eventTitle} image ${index + 1}`, caption: undefined };
    }
    return img;
  });

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsTransitioning(false), 500);
    
    setCurrentIndex(currentIndex === normalizedImages.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, normalizedImages.length, isTransitioning]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsTransitioning(false), 500);
    
    setCurrentIndex(currentIndex === 0 ? normalizedImages.length - 1 : currentIndex - 1);
  }, [currentIndex, normalizedImages.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsTransitioning(false), 500);
    
    setCurrentIndex(index);
  }, [currentIndex, isTransitioning]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || normalizedImages.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, normalizedImages.length, handleNext]);

  if (normalizedImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const currentImage = normalizedImages[currentIndex];

  return (
    <div className="relative w-full max-w-6xl mx-auto group">
      {/* Main Image Container */}
      <div 
        className="relative aspect-[16/10] bg-black rounded-2xl overflow-hidden shadow-2xl"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div 
          className="flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {normalizedImages.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          ))}
        </div>
        
        {/* Navigation Buttons */}
        {normalizedImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white border-0 transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              onClick={() => {
                setIsAutoPlaying(false);
                handlePrevious();
              }}
              disabled={isTransitioning}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white border-0 transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              onClick={() => {
                setIsAutoPlaying(false);
                handleNext();
              }}
              disabled={isTransitioning}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Caption Overlay */}
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <p className="text-white text-sm font-medium">{currentImage.caption}</p>
          </div>
        )}

        {/* Image Counter */}
        {normalizedImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {normalizedImages.length}
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {normalizedImages.length > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {normalizedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip (for large galleries) */}
      {normalizedImages.length > 3 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {normalizedImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-600 opacity-100' 
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

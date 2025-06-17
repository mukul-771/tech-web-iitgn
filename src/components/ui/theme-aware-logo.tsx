"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ThemeAwareLogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export function ThemeAwareLogo({
  width = 32,
  height = 32,
  className = "",
  alt = "Tech@IITGN Logo",
  priority = false,
}: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a placeholder during SSR and initial hydration
  if (!mounted) {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`}
        style={{ width, height }}
        aria-label="Loading logo"
      />
    );
  }

  // Determine which logo to show based on resolved theme
  const logoSrc = resolvedTheme === 'dark' ? '/tech-logo-dark.svg' : '/tech-logo-light.svg';

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${className}`}
      priority={priority}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Support any Firebase Storage URL
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev for Firebase URLs
  },
  // Production optimizations
  serverExternalPackages: ['sharp'],
  // Ensure static files are properly handled
  trailingSlash: false,
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Add specific configurations for Firebase integration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Increase limit for file uploads
    },
  },
};

export default nextConfig;

export interface TorqueMagazine {
  id: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  coverPhoto?: string; // Path to cover photo image
  coverPhotoFileName?: string; // Original filename of cover photo
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

// Default Torque magazines data
export const defaultTorqueData: Record<string, TorqueMagazine> = {
  "torque-2023": {
    id: "torque-2023",
    year: "2023",
    title: "Innovation Unleashed",
    description: "Exploring the frontiers of AI, robotics, and sustainable technology",
    pages: 120,
    articles: 25,
    featured: "AI in Healthcare",
    filePath: "/torque/magazines/torque-2023.pdf",
    fileName: "torque-2023.pdf",
    fileSize: 15728640, // 15MB in bytes
    coverPhoto: "/torque/covers/torque-2023-cover.jpg",
    coverPhotoFileName: "torque-2023-cover.jpg",
    isLatest: true,
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2023-12-01T00:00:00Z"
  },
  "torque-2022": {
    id: "torque-2022",
    year: "2022",
    title: "Digital Transformation",
    description: "How technology is reshaping industries and society",
    pages: 108,
    articles: 22,
    featured: "Blockchain Revolution",
    filePath: "/torque/magazines/torque-2022.pdf",
    fileName: "torque-2022.pdf",
    fileSize: 14680064, // 14MB in bytes
    isLatest: false,
    createdAt: "2022-12-01T00:00:00Z",
    updatedAt: "2022-12-01T00:00:00Z"
  },
  "torque-2021": {
    id: "torque-2021",
    year: "2021",
    title: "Future Forward",
    description: "Student innovations and research breakthroughs",
    pages: 95,
    articles: 20,
    featured: "Quantum Computing",
    filePath: "/torque/magazines/torque-2021.pdf",
    fileName: "torque-2021.pdf",
    fileSize: 12582912, // 12MB in bytes
    isLatest: false,
    createdAt: "2021-12-01T00:00:00Z",
    updatedAt: "2021-12-01T00:00:00Z"
  }
};

// Magazine statistics
export interface TorqueStats {
  totalYears: number;
  totalArticles: number;
  totalPages: number;
  totalDownloads: number;
}

export const defaultTorqueStats: TorqueStats = {
  totalYears: 3,
  totalArticles: 67,
  totalPages: 323,
  totalDownloads: 5000
};

// Allowed file types for magazine uploads
export const allowedFileTypes = [
  'application/pdf'
];

// Allowed image file types for cover photos
export const allowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Maximum file size (50MB in bytes)
export const maxFileSize = 50 * 1024 * 1024;

// Maximum image file size (10MB in bytes)
export const maxImageSize = 10 * 1024 * 1024;

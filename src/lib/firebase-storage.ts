import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  path: string;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// Generate unique filename with timestamp
export function generateFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Short UUID
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  const baseName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  
  const fileName = prefix 
    ? `${prefix}-${timestamp}-${uuid}-${baseName}.${extension}`
    : `${timestamp}-${uuid}-${baseName}.${extension}`;
    
  return fileName;
}

// Upload and optimize image
export async function uploadImageToFirebase(
  fileBuffer: Buffer,
  originalName: string,
  folder: string = 'images',
  options: ImageOptimizationOptions = {}
): Promise<UploadResult> {
  try {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 85,
      format = 'jpeg'
    } = options;
    
    console.log('Starting image optimization:', { originalName, maxWidth, maxHeight, quality, format });
    
    // Create Sharp instance and get metadata first to validate the image
    let sharpInstance = sharp(fileBuffer);
    
    // Get image metadata to understand the input format
    let metadata;
    try {
      metadata = await sharpInstance.metadata();
      console.log('Image metadata:', {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation
      });
    } catch (metadataError) {
      console.error('Failed to read image metadata:', metadataError);
      throw new Error(`Unsupported image format or corrupted file. Please try a standard JPEG or PNG image.`);
    }
    
    // Check if the format is supported
    const supportedFormats = ['jpeg', 'png', 'webp', 'tiff', 'gif', 'bmp'];
    if (!metadata.format || !supportedFormats.includes(metadata.format)) {
      throw new Error(`Unsupported image format: ${metadata.format || 'unknown'}. Please use JPEG, PNG, or WebP.`);
    }
    
    // Create a fresh Sharp instance to avoid any issues with the metadata reading
    sharpInstance = sharp(fileBuffer);
    
    // Remove any problematic metadata and normalize the image
    sharpInstance = sharpInstance.rotate(); // Auto-rotate based on EXIF
    
    console.log('Image validation passed, proceeding with optimization...');
    
    // Resize if needed
    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    // Convert to specified format with quality
    let optimizedBuffer: Buffer;
    let contentType: string;
    let extension: string;
    switch (format) {
      case 'webp':
        optimizedBuffer = await sharpInstance.webp({ quality }).toBuffer();
        contentType = 'image/webp';
        extension = 'webp';
        break;
      case 'png':
        optimizedBuffer = await sharpInstance.png({ quality }).toBuffer();
        contentType = 'image/png';
        extension = 'png';
        break;
      default:
        optimizedBuffer = await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
        contentType = 'image/jpeg';
        extension = 'jpg';
    }
    console.log('Image optimized:', { size: optimizedBuffer.length, contentType, extension });
    
    // Generate filename with correct extension
    const fileName = generateFileName(originalName.replace(/\.[^/.]+$/, `.${extension}`));
    const filePath = `${folder}/${fileName}`;
    
    // Upload to Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    console.log('Uploading to Firebase:', { fileName, filePath, bucket: bucket.name });
    
    // Upload the file
    await file.save(optimizedBuffer, {
      metadata: {
        contentType,
        metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
        }
      },
      public: true, // Make file publicly accessible
    });
    
    console.log('File uploaded successfully:', filePath);
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    return {
      url: publicUrl,
      filename: fileName,
      size: optimizedBuffer.length,
      path: filePath,
    };
  } catch (error) {
    console.error('Error optimizing and uploading image:', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check for specific Firebase errors
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Firebase Storage permission denied. Please check Firebase Storage rules.');
      } else if (error.message.includes('not found')) {
        throw new Error('Firebase Storage bucket not found. Please check your Firebase configuration.');
      } else if (error.message.includes('Bucket is requester pays')) {
        throw new Error('Firebase Storage bucket requires payment. Please check your Firebase billing settings.');
      } else if (error.message.includes('Service account')) {
        throw new Error('Firebase service account authentication failed. Please check your service account key.');
      }
    }
    
    throw new Error(`Failed to optimize and upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

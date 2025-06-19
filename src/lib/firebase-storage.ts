import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

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

// Upload file to Firebase Storage
export async function uploadToFirebase(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  if (!bucket) {
    console.error('Firebase Storage bucket is not initialized.');
    throw new Error('Firebase Storage is not configured. Please set up Firebase credentials.');
  }

  try {
    const filePath = `${folder}/${fileName}`;
    const file = bucket.file(filePath);
    console.log('Uploading to Firebase:', { filePath, contentType, size: fileBuffer.length });
    // Upload file with metadata
    await file.save(fileBuffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });
    // Make file publicly accessible
    await file.makePublic();
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log('Upload successful:', publicUrl);
    return {
      url: publicUrl,
      filename: fileName,
      size: fileBuffer.length,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw new Error('Failed to upload file to Firebase Storage');
  }
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
    console.log('Optimizing image:', { originalName, maxWidth, maxHeight, quality, format });
    // Optimize image using Sharp
    let sharpInstance = sharp(fileBuffer);
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
    return await uploadToFirebase(optimizedBuffer, fileName, contentType, folder);
  } catch (error) {
    console.error('Error optimizing and uploading image:', error);
    throw new Error('Failed to optimize and upload image');
  }
}

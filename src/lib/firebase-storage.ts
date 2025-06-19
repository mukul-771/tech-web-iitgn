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
    return {
      url: '',
      filename: fileName,
      size: optimizedBuffer.length,
      path: `${folder}/${fileName}`,
    };
  } catch (error) {
    console.error('Error optimizing and uploading image:', error);
    throw new Error('Failed to optimize and upload image');
  }
}

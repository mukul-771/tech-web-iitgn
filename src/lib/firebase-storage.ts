import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { convertToSupportedFormat } from './image-format-utils';

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
    
    // First attempt: Use the robust format conversion
    let processedImage;
    try {
      processedImage = await convertToSupportedFormat(fileBuffer);
      console.log('Image format conversion successful:', { 
        finalFormat: processedImage.format,
        originalSize: fileBuffer.length,
        processedSize: processedImage.buffer.length
      });
    } catch (conversionError) {
      console.error('Image format conversion failed:', conversionError);
      
      // FALLBACK 1: Try direct upload without Sharp processing
      console.log('Attempting direct upload without Sharp processing...');
      return await uploadDirectlyToFirebase(fileBuffer, originalName, folder);
    }

    // Second attempt: Use Sharp with the converted image
    let optimizedBuffer: Buffer;
    let contentType: string;
    let extension: string;
    
    try {
      let sharpInstance = sharp(processedImage.buffer);
      
      // Resize if needed
      if (maxWidth || maxHeight) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Convert to specified format with quality
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
      
      console.log('Sharp processing successful:', { size: optimizedBuffer.length, contentType, extension });
      
    } catch (sharpError) {
      console.error('Sharp processing failed:', sharpError);
      
      // FALLBACK 2: Try direct upload with the converted buffer
      console.log('Sharp failed, attempting direct upload with converted buffer...');
      return await uploadDirectlyToFirebase(processedImage.buffer, originalName, folder);
    }
    
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
    
    // FALLBACK 3: Last resort - direct upload of original buffer
    console.log('All processing failed, attempting direct upload of original buffer...');
    try {
      return await uploadDirectlyToFirebase(fileBuffer, originalName, folder);
    } catch (directError) {
      console.error('Direct upload also failed:', directError);
      throw new Error(`All upload attempts failed. Last error: ${directError instanceof Error ? directError.message : 'Unknown error'}`);
    }
  }
}

// Direct upload without any processing
async function uploadDirectlyToFirebase(
  fileBuffer: Buffer,
  originalName: string,
  folder: string = 'images'
): Promise<UploadResult> {
  try {
    console.log('Starting direct upload without processing...', { originalName, size: fileBuffer.length });
    
    // Determine content type from file signature
    let contentType = 'image/jpeg'; // default
    if (fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47) {
      contentType = 'image/png';
    } else if (fileBuffer[8] === 0x57 && fileBuffer[9] === 0x45 && fileBuffer[10] === 0x42 && fileBuffer[11] === 0x50) {
      contentType = 'image/webp';
    }
    
    // Generate filename
    const fileName = generateFileName(originalName, 'direct');
    const filePath = `${folder}/${fileName}`;
    
    // Upload to Firebase Storage
    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    
    console.log('Direct upload to Firebase:', { fileName, filePath, contentType });
    
    await file.save(fileBuffer, {
      metadata: {
        contentType,
        metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          uploadType: 'direct', // Mark as direct upload
        }
      },
      public: true,
    });
    
    console.log('Direct upload successful:', filePath);
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    
    return {
      url: publicUrl,
      filename: fileName,
      size: fileBuffer.length,
      path: filePath,
    };
    
  } catch (error) {
    console.error('Direct upload failed:', error);
    
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
    
    throw new Error(`Direct upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

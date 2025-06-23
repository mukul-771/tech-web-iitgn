import sharp from 'sharp';

export async function convertToSupportedFormat(buffer: Buffer): Promise<{ buffer: Buffer; format: string }> {
  try {
    console.log('Starting image format conversion...', { bufferSize: buffer.length });
    
    // First, validate the buffer
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty or invalid image buffer');
    }
    
    // Check file signatures first
    const validation = validateImageFile(buffer);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid image file');
    }
    
    // Try multiple Sharp configurations to handle problematic images
    const sharpConfigs = [
      { 
        failOnError: false,
        unlimited: true,
        sequentialRead: true,
        density: 72
      },
      { 
        failOnError: false,
        unlimited: true,
        sequentialRead: false,
        pages: 1
      },
      { 
        failOnError: false,
        unlimited: false,
        sequentialRead: true
      }
    ];
    
    let sharpInstance: sharp.Sharp | undefined;
    let configUsed = -1;
    
    for (let i = 0; i < sharpConfigs.length; i++) {
      try {
        sharpInstance = sharp(buffer, sharpConfigs[i]);
        // Test if we can actually use this instance
        await sharpInstance.metadata();
        configUsed = i;
        console.log(`Sharp instance created successfully with config ${i}`);
        break;
      } catch (sharpCreateError) {
        console.error(`Sharp config ${i} failed:`, sharpCreateError);
        if (i === sharpConfigs.length - 1) {
          throw new Error('Unable to process this image file with any Sharp configuration. Please try a different image.');
        }
      }
    }
    
    if (!sharpInstance) {
      throw new Error('Failed to create a working Sharp instance');
    }
    
    // Try to get metadata with retries
    let metadata;
    let metadataAttempts = 0;
    const maxMetadataAttempts = 3;
    
    while (metadataAttempts < maxMetadataAttempts) {
      try {
        metadata = await sharpInstance.metadata();
        console.log('Image metadata retrieved:', {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          size: metadata.size,
          channels: metadata.channels,
          configUsed: configUsed
        });
        break;
      } catch (metadataError) {
        metadataAttempts++;
        console.error(`Metadata attempt ${metadataAttempts} failed:`, metadataError);
        
        if (metadataAttempts >= maxMetadataAttempts) {
          // If we can't read metadata, try force conversion
          console.log('Metadata reading failed, attempting force conversion...');
          return await forceConvertToJPEG(buffer);
        }
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // If it's already a supported format, try to just normalize it
    const supportedFormats = ['jpeg', 'png', 'webp'];
    if (metadata && metadata.format && supportedFormats.includes(metadata.format)) {
      console.log(`Image is already in supported format: ${metadata.format}`);
      
      // Try to normalize the image (remove problematic metadata, fix orientation)
      try {
        const normalizedBuffer = await sharp(buffer)
          .rotate() // Auto-rotate based on EXIF
          .toBuffer();
        
        return { buffer: normalizedBuffer, format: metadata.format };
      } catch (normalizeError) {
        console.error('Normalization failed, trying conversion:', normalizeError);
        // Fall through to conversion
      }
    }
    
    // Convert to JPEG as fallback
    console.log(`Converting from ${metadata?.format || 'unknown'} to JPEG`);
    return await convertToJPEG(buffer);
    
  } catch (error) {
    console.error('Error in format conversion:', error);
    
    // Check if it's a decoder error specifically
    const isDecoderError = error instanceof Error && 
      (error.message.includes('DECODER') || 
       error.message.includes('unsupported') ||
       error.message.includes('decode') ||
       error.message.includes('1E08010C'));
    
    if (isDecoderError) {
      console.log('Decoder error detected, this image cannot be processed by Sharp on this system');
      throw new Error('This image format cannot be processed by the server. Please try converting the image to a standard JPEG or PNG format using an image editor before uploading.');
    }
    
    // Last resort: force convert to JPEG
    try {
      console.log('Attempting force conversion to JPEG...');
      return await forceConvertToJPEG(buffer);
    } catch (forceError) {
      console.error('Force conversion also failed:', forceError);
      throw new Error('Unable to process this image. The file may be corrupted or in an unsupported format. Please try a different image or convert it to JPEG using an image editor.');
    }
  }
}

async function convertToJPEG(buffer: Buffer): Promise<{ buffer: Buffer; format: string }> {
  try {
    const convertedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .jpeg({ 
        quality: 85, 
        progressive: true,
        force: false // Don't force if it's already JPEG
      })
      .toBuffer();
      
    return { buffer: convertedBuffer, format: 'jpeg' };
  } catch (error) {
    console.error('Standard JPEG conversion failed:', error);
    throw error;
  }
}

async function forceConvertToJPEG(buffer: Buffer): Promise<{ buffer: Buffer; format: string }> {
  try {
    console.log('Attempting force conversion with minimal processing...');
    
    // Try multiple approaches for maximum compatibility
    const forceConfigs = [
      // Most permissive config
      { 
        failOnError: false,
        unlimited: true,
        sequentialRead: true,
        pages: 1,
        density: 72
      },
      // Alternative config
      { 
        failOnError: false,
        unlimited: false,
        sequentialRead: false,
        pages: 1
      },
      // Minimal config
      { 
        failOnError: false,
        pages: 1
      }
    ];
    
    for (let i = 0; i < forceConfigs.length; i++) {
      try {
        console.log(`Trying force conversion config ${i}...`);
        
        const convertedBuffer = await sharp(buffer, forceConfigs[i])
          .flatten({ background: '#ffffff' }) // Flatten to white background
          .jpeg({ 
            quality: 85,
            progressive: true,
            force: true // Force JPEG output
          })
          .toBuffer();
        
        console.log(`Force conversion successful with config ${i}`);
        return { buffer: convertedBuffer, format: 'jpeg' };
        
      } catch (configError) {
        console.error(`Force config ${i} failed:`, configError);
        if (i === forceConfigs.length - 1) {
          throw configError;
        }
      }
    }
    
    throw new Error('All force conversion attempts failed');
    
  } catch (error) {
    console.error('Force conversion failed:', error);
    throw new Error('Image file cannot be processed. Please try saving the image in a different format (JPEG or PNG) first.');
  }
}

export function getImageMimeType(format: string): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpeg':
    case 'jpg':
    default:
      return 'image/jpeg';
  }
}

export function validateImageFile(buffer: Buffer): { isValid: boolean; error?: string } {
  try {
    // Check minimum file size (at least 100 bytes)
    if (buffer.length < 100) {
      return { isValid: false, error: 'File too small to be a valid image' };
    }
    
    // Check maximum file size (50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File too large (max 50MB)' };
    }
    
    // Check file signatures (magic numbers)
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    const isBMP = buffer[0] === 0x42 && buffer[1] === 0x4D;
    const isTIFF = (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
                   (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A);
    
    if (isJPEG || isPNG || isWebP || isGIF || isBMP || isTIFF) {
      return { isValid: true };
    }
    
    // Check for HEIC/HEIF (iPhone photos)
    const isHEIC = buffer.slice(4, 8).toString() === 'ftyp' && 
                   (buffer.slice(8, 12).toString() === 'heic' || 
                    buffer.slice(8, 12).toString() === 'heix' ||
                    buffer.slice(8, 12).toString() === 'hevc' ||
                    buffer.slice(8, 12).toString() === 'mif1');
    
    if (isHEIC) {
      return { isValid: false, error: 'HEIC/HEIF format not supported. Please convert to JPEG or PNG first.' };
    }
    
    return { isValid: false, error: 'Unrecognized image format' };
    
  } catch {
    return { isValid: false, error: 'Error validating image file' };
  }
}

import sharp from 'sharp';

export async function convertToSupportedFormat(buffer: Buffer): Promise<{ buffer: Buffer; format: string }> {
  try {
    // Try to get metadata
    const metadata = await sharp(buffer).metadata();
    console.log('Original image metadata:', metadata);
    
    // If it's already a supported format and not corrupted, return as is
    const supportedFormats = ['jpeg', 'png', 'webp'];
    if (metadata.format && supportedFormats.includes(metadata.format)) {
      return { buffer, format: metadata.format };
    }
    
    // Convert unsupported formats to JPEG
    console.log(`Converting from ${metadata.format} to JPEG`);
    const convertedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
      
    return { buffer: convertedBuffer, format: 'jpeg' };
    
  } catch (error) {
    console.error('Error in format conversion:', error);
    
    // Last resort: try to force convert to JPEG
    try {
      console.log('Attempting force conversion to JPEG...');
      const forceConvertedBuffer = await sharp(buffer, { failOnError: false })
        .jpeg({ quality: 85 })
        .toBuffer();
      return { buffer: forceConvertedBuffer, format: 'jpeg' };
    } catch (forceError) {
      console.error('Force conversion also failed:', forceError);
      throw new Error('Unable to process this image. Please try a different image file.');
    }
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

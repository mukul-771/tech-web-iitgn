# 📁 File Storage Migration Guide

## Overview
Migrate from local file storage (`/public` directory) to cloud storage solutions for better scalability, performance, and reliability in production.

---

## 🎯 Recommended File Storage Solutions

### Option 1: Vercel Blob Storage (Recommended)
**Best for**: Vercel deployments, seamless integration
**Pricing**: Pay-per-use, optimized for web

```bash
npm install @vercel/blob
```

### Option 2: AWS S3 + CloudFront
**Best for**: High-scale applications, advanced features
**Pricing**: Very cost-effective for large storage

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Option 3: Cloudinary
**Best for**: Image-heavy applications, automatic optimization
**Pricing**: Free tier available, feature-rich

```bash
npm install cloudinary
```

### Option 4: Google Cloud Storage
**Best for**: Google ecosystem integration
**Pricing**: Competitive pricing, global CDN

```bash
npm install @google-cloud/storage
```

---

## 🔧 Implementation Guide

### Option 1: Vercel Blob Storage Implementation

#### Step 1: Setup Vercel Blob
```typescript
// src/lib/blob-storage.ts
import { put, del, list } from '@vercel/blob';

export async function uploadFile(
  file: File,
  pathname: string
): Promise<{ url: string; pathname: string }> {
  const blob = await put(pathname, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}
```

#### Step 2: Update Upload API
```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { checkAdminAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    const blob = await put(filename, request.body!, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### Step 3: Update Image Upload Component
```typescript
// src/components/admin/ImageUpload.tsx
import { useState } from 'react';

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const filename = `uploads/${Date.now()}-${file.name}`;
      
      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Upload failed');

      const blob = await response.json();
      onUpload(blob.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

### Option 2: AWS S3 Implementation

#### Step 1: AWS Configuration
```typescript
// src/lib/aws-config.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
export const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL;
```

#### Step 2: S3 Upload Functions
```typescript
// src/lib/s3-storage.ts
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, CLOUDFRONT_URL } from './aws-config';

export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  // Return CloudFront URL if available, otherwise S3 URL
  if (CLOUDFRONT_URL) {
    return `${CLOUDFRONT_URL}/${key}`;
  }
  
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

---

### Option 3: Cloudinary Implementation

#### Step 1: Cloudinary Setup
```typescript
// src/lib/cloudinary-config.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };
```

#### Step 2: Cloudinary Upload Functions
```typescript
// src/lib/cloudinary-storage.ts
import { cloudinary } from './cloudinary-config';

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
        });
      }
    ).end(file);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedImageUrl(
  publicId: string,
  transformations?: string
): string {
  return cloudinary.url(publicId, {
    transformation: transformations || 'q_auto,f_auto',
  });
}
```

---

## 🔄 Migration Process

### Step 1: Audit Current Files
```bash
# Create inventory of current files
find public -type f -name "*.jpg" -o -name "*.png" -o -name "*.pdf" > file-inventory.txt
```

### Step 2: Migration Script
```typescript
// scripts/migrate-files.ts
import fs from 'fs';
import path from 'path';
import { uploadToS3 } from '../src/lib/s3-storage'; // or your chosen storage

async function migrateFiles() {
  const publicDir = path.join(process.cwd(), 'public');
  const filesToMigrate = [
    'events',
    'team',
    'torque',
    'logos',
  ];

  for (const folder of filesToMigrate) {
    const folderPath = path.join(publicDir, folder);
    
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath, { recursive: true });
    
    for (const file of files) {
      const filePath = path.join(folderPath, file as string);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const fileBuffer = fs.readFileSync(filePath);
        const key = `${folder}/${file}`;
        const contentType = getContentType(filePath);
        
        try {
          const url = await uploadToS3(fileBuffer, key, contentType);
          console.log(`✅ Migrated: ${filePath} -> ${url}`);
          
          // Update database references
          await updateFileReferences(filePath, url);
        } catch (error) {
          console.error(`❌ Failed to migrate: ${filePath}`, error);
        }
      }
    }
  }
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function updateFileReferences(oldPath: string, newUrl: string) {
  // Update database or JSON files with new URLs
  // This depends on your current storage method
}

migrateFiles().catch(console.error);
```

### Step 3: Update Environment Variables
```env
# For Vercel Blob (automatic with Vercel)
BLOB_READ_WRITE_TOKEN=your-token

# For AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_URL=https://your-distribution.cloudfront.net

# For Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🚀 Production Considerations

### Performance Optimization
- **Image optimization**: Automatic resizing and format conversion
- **CDN distribution**: Global edge caching
- **Lazy loading**: Load images on demand
- **Progressive loading**: Show low-quality placeholders

### Security
- **Access control**: Signed URLs for private files
- **File validation**: Check file types and sizes
- **Virus scanning**: Scan uploaded files
- **Rate limiting**: Prevent abuse

### Monitoring
- **Storage usage**: Track storage costs
- **Transfer bandwidth**: Monitor data transfer
- **Error rates**: Track failed uploads/downloads
- **Performance metrics**: Monitor load times

---

## 📊 Cost Comparison

### Vercel Blob
- **Free tier**: 1GB storage, 100GB bandwidth
- **Pro**: $0.15/GB storage, $0.30/GB bandwidth
- **Best for**: Small to medium applications

### AWS S3 + CloudFront
- **Storage**: $0.023/GB/month
- **Transfer**: $0.085/GB (first 10TB)
- **Best for**: High-traffic applications

### Cloudinary
- **Free tier**: 25GB storage, 25GB bandwidth
- **Paid**: $99/month for 100GB
- **Best for**: Image-heavy applications

---

## 🔧 Rollback Plan

### Backup Strategy
1. **Keep local files**: Don't delete until migration is confirmed
2. **Database backup**: Export file URL mappings
3. **Test thoroughly**: Verify all file access works
4. **Gradual migration**: Migrate in batches

### Rollback Process
1. **Revert code**: Switch back to local file storage
2. **Restore files**: Copy files back to `/public`
3. **Update references**: Restore original file paths
4. **Verify functionality**: Test all file operations

---

**Note**: File storage migration is recommended for production but not required. Your current local storage works well for development and small-scale deployments.

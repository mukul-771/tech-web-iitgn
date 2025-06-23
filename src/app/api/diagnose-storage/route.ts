import { NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

interface DiagnosisResult {
  bucketName: string;
  totalFiles: number;
  files: Array<{
    name: string;
    exists: boolean;
    size: string | number;
    contentType: string;
    created: string;
    publicUrl: string;
    downloadUrl: string | null;
    accessible: boolean;
  }>;
  issues: string[];
}

export async function GET() {
  try {
    console.log('🔍 Diagnosing Firebase Storage from admin...');
    
    if (!adminStorage) {
      return NextResponse.json({ 
        error: 'Firebase Admin Storage not initialized',
        status: 'failed'
      }, { status: 500 });
    }

    const bucket = adminStorage.bucket();
    console.log(`📦 Using bucket: ${bucket.name}`);

    // List files in team folder
    const [files] = await bucket.getFiles({ prefix: 'team/' });
    
    const diagnosis: DiagnosisResult = {
      bucketName: bucket.name,
      totalFiles: files.length,
      files: [],
      issues: []
    };

    if (files.length === 0) {
      diagnosis.issues.push('No files found in team/ folder');
      return NextResponse.json(diagnosis);
    }

    // Check each file
    for (const file of files.slice(0, 10)) { // Limit to first 10 files
      const [metadata] = await file.getMetadata().catch(() => [null]);
      const [exists] = await file.exists();
      
      const fileInfo = {
        name: file.name,
        exists,
        size: metadata?.size || 'unknown',
        contentType: metadata?.contentType || 'unknown',
        created: metadata?.timeCreated || 'unknown',
        publicUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        downloadUrl: null as string | null,
        accessible: false
      };

      // Try to get download URL
      try {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        fileInfo.downloadUrl = url;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        diagnosis.issues.push(`Cannot generate signed URL for ${file.name}: ${errorMessage}`);
      }

      // Test if file is publicly accessible
      try {
        const response = await fetch(fileInfo.publicUrl, { method: 'HEAD' });
        fileInfo.accessible = response.ok;
        if (!response.ok) {
          diagnosis.issues.push(`File ${file.name} not publicly accessible: ${response.status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        diagnosis.issues.push(`Cannot access ${file.name}: ${errorMessage}`);
      }

      diagnosis.files.push(fileInfo);
    }

    return NextResponse.json(diagnosis);

  } catch (error) {
    console.error('Storage diagnosis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : 'unknown';
    
    return NextResponse.json({
      error: errorMessage,
      code: errorCode,
      status: 'failed'
    }, { status: 500 });
  }
}

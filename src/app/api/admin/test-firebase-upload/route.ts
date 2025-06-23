import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from 'sharp';
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
    console.log('Firebase Admin initialized successfully for test');
  } catch (error) {
    console.error('Firebase Admin initialization error in test:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== ISOLATED FIREBASE UPLOAD TEST ===');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('✅ Authentication passed');

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log('✅ File received:', { name: file.name, size: file.size });

    // Convert to buffer and optimize (we know this works)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      console.log('✅ Image optimization successful:', { 
        originalSize: buffer.length, 
        optimizedSize: optimizedBuffer.length 
      });
    } catch (sharpError) {
      console.error('❌ Sharp failed:', sharpError);
      return NextResponse.json({ error: "Sharp processing failed" }, { status: 500 });
    }

    // Test Firebase Storage step by step
    let storage, bucket;
    try {
      storage = getStorage();
      bucket = storage.bucket();
      console.log('✅ Firebase Storage initialized:', { bucketName: bucket.name });
    } catch (storageError) {
      console.error('❌ Firebase Storage init failed:', storageError);
      return NextResponse.json({ 
        error: "Firebase Storage initialization failed",
        details: storageError instanceof Error ? storageError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test bucket access
    try {
      const [bucketExists] = await bucket.exists();
      console.log('✅ Bucket exists check:', bucketExists);
      if (!bucketExists) {
        return NextResponse.json({ error: "Storage bucket does not exist" }, { status: 500 });
      }
    } catch (bucketError) {
      console.error('❌ Bucket access failed:', bucketError);
      return NextResponse.json({ 
        error: "Cannot access storage bucket",
        details: bucketError instanceof Error ? bucketError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test file upload
    const testFileName = `test-upload-${Date.now()}.jpg`;
    const testFilePath = `test/${testFileName}`;
    
    try {
      const fileRef = bucket.file(testFilePath);
      
      console.log('Attempting file upload...', { filePath: testFilePath, size: optimizedBuffer.length });
      
      await fileRef.save(optimizedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            testUpload: 'true'
          }
        },
        public: true,
      });
      
      console.log('✅ File upload successful!');
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFilePath}`;
      
      return NextResponse.json({ 
        success: true,
        message: "Firebase upload test PASSED!",
        steps: {
          auth: "✅ Passed",
          fileReceived: "✅ Passed",
          sharpProcessing: "✅ Passed", 
          firebaseInit: "✅ Passed",
          bucketAccess: "✅ Passed",
          fileUpload: "✅ Passed"
        },
        details: {
          uploadedFile: testFilePath,
          publicUrl: publicUrl,
          originalSize: buffer.length,
          optimizedSize: optimizedBuffer.length,
          bucketName: bucket.name
        }
      });
      
    } catch (uploadError) {
      console.error('❌ File upload failed:', uploadError);
      
      // Check specific error types
      const errorDetails = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
      const suggestions = [];
      
      if (errorDetails.includes('PERMISSION_DENIED')) {
        suggestions.push('Update Firebase Storage rules to allow write access');
        suggestions.push('Check service account permissions');
      } else if (errorDetails.includes('not found')) {
        suggestions.push('Verify Firebase Storage bucket exists');
        suggestions.push('Check NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable');
      } else if (errorDetails.includes('UNAUTHENTICATED')) {
        suggestions.push('Check Firebase service account key is valid');
        suggestions.push('Verify FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
      }
      
      return NextResponse.json({ 
        error: "File upload failed",
        details: errorDetails,
        suggestions: suggestions,
        steps: {
          auth: "✅ Passed",
          fileReceived: "✅ Passed", 
          sharpProcessing: "✅ Passed",
          firebaseInit: "✅ Passed",
          bucketAccess: "✅ Passed",
          fileUpload: "❌ Failed"
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Unexpected error in Firebase upload test:", error);
    return NextResponse.json(
      { 
        error: "Unexpected error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

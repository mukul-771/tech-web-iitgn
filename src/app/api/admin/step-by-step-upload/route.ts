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
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== STEP-BY-STEP UPLOAD DEBUG ===');
    
    // Step 1: Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('✅ Step 1: Authentication passed', { email: session.user.email });

    // Step 2: Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log('✅ Step 2: File received', { name: file.name, size: file.size, type: file.type });

    // Step 3: Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Step 3: File converted to buffer', { bufferSize: buffer.length });

    // Step 4: Test Sharp optimization
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      console.log('✅ Step 4: Image optimization successful', { 
        originalSize: buffer.length, 
        optimizedSize: optimizedBuffer.length 
      });
    } catch (sharpError) {
      console.error('❌ Step 4: Sharp optimization failed', sharpError);
      return NextResponse.json({ 
        error: "Image optimization failed",
        step: "Sharp processing",
        details: sharpError instanceof Error ? sharpError.message : 'Unknown Sharp error'
      }, { status: 500 });
    }

    // Step 5: Test Firebase Storage connection
    let storage, bucket;
    try {
      storage = getStorage();
      bucket = storage.bucket();
      console.log('✅ Step 5: Firebase Storage initialized', { bucketName: bucket.name });
    } catch (firebaseError) {
      console.error('❌ Step 5: Firebase Storage initialization failed', firebaseError);
      return NextResponse.json({ 
        error: "Firebase Storage initialization failed",
        step: "Firebase connection",
        details: firebaseError instanceof Error ? firebaseError.message : 'Unknown Firebase error'
      }, { status: 500 });
    }

    // Step 6: Try to upload
    const fileName = `test-upload-${Date.now()}.jpg`;
    const filePath = `test/${fileName}`;
    
    try {
      const file = bucket.file(filePath);
      await file.save(optimizedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            originalName: fileName,
            uploadedAt: new Date().toISOString(),
          }
        },
        public: true,
      });
      console.log('✅ Step 6: File upload successful', { filePath });
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      return NextResponse.json({ 
        success: true,
        message: "Full upload test passed!",
        url: publicUrl,
        filePath: filePath,
        steps: {
          auth: "✅ Passed",
          fileReceived: "✅ Passed", 
          bufferConversion: "✅ Passed",
          imageOptimization: "✅ Passed",
          firebaseConnection: "✅ Passed",
          fileUpload: "✅ Passed"
        }
      });
      
    } catch (uploadError) {
      console.error('❌ Step 6: File upload failed', uploadError);
      return NextResponse.json({ 
        error: "File upload failed",
        step: "Firebase upload",
        details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Unexpected error in step-by-step upload:", error);
    return NextResponse.json(
      { 
        error: "Unexpected error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

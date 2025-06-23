import { NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { initializeApp, getApps, cert } from "firebase-admin/app";

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

export async function GET() {
  try {
    // Test Firebase Admin connection
    const storage = getStorage();
    const bucket = storage.bucket();
    
    // Try to list files (this tests permissions)
    const [files] = await bucket.getFiles({ maxResults: 1 });
    
    // Test basic bucket access
    const bucketExists = await bucket.exists();
    
    return NextResponse.json({
      success: true,
      firebase: {
        bucketName: bucket.name,
        bucketExists: bucketExists[0],
        filesCount: files.length,
        serviceAccountConfigured: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Firebase test error:", error);
    return NextResponse.json(
      {
        error: `Firebase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          serviceAccountConfigured: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        }
      },
      { status: 500 }
    );
  }
}

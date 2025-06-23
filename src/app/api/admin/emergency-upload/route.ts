import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';

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

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }

  try {
    const adminEmailsPath = path.join(process.cwd(), 'data', 'admin-emails.json');
    const adminEmails = JSON.parse(fs.readFileSync(adminEmailsPath, 'utf8'));
    return adminEmails.emails.includes(session.user.email);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Emergency upload that bypasses Sharp completely
export async function POST(request: NextRequest) {
  try {
    console.log('Emergency upload endpoint called');

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('Emergency upload - file received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Basic validation
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    if (buffer.length > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    // Basic file signature validation
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (!isJPEG && !isPNG && !isWebP) {
      return NextResponse.json({ error: "Unsupported file format. Only JPEG, PNG, and WebP are supported in emergency mode." }, { status: 400 });
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `emergency-${timestamp}.${extension}`;
    const filePath = `emergency-uploads/${safeFileName}`;

    console.log('Emergency upload - uploading to Firebase:', { filePath, size: buffer.length });

    // Upload directly to Firebase without Sharp processing
    const storage = getStorage();
    const bucket = storage.bucket();
    const firebaseFile = bucket.file(filePath);

    // Determine content type
    let contentType = 'image/jpeg';
    if (isPNG) contentType = 'image/png';
    if (isWebP) contentType = 'image/webp';

    await firebaseFile.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          emergencyUpload: 'true'
        }
      },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log('Emergency upload successful:', { url: publicUrl, size: buffer.length });

    return NextResponse.json({
      success: true,
      message: "Emergency upload successful (no image processing applied)",
      url: publicUrl,
      fileName: safeFileName,
      size: buffer.length,
      contentType: contentType,
      note: "This image was uploaded without optimization. Consider re-uploading through the regular upload process once the decoder issue is resolved."
    });

  } catch (error) {
    console.error("Emergency upload error:", error);
    return NextResponse.json(
      { 
        error: `Emergency upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateTeamMember } from "@/lib/team-firebase-admin";
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { v4 as uuidv4 } from 'uuid';
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

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  return `${timestamp}-${uuid}-${baseName}.${extension}`;
}

// Direct upload without Sharp processing
export async function POST(request: NextRequest) {
  try {
    console.log('No-Sharp upload endpoint called');

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const memberId = formData.get("memberId") as string;
    const isSecretary = formData.get("isSecretary") === "true";

    if (!file || !memberId) {
      return NextResponse.json({ error: "Missing file or member ID" }, { status: 400 });
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      memberId,
      isSecretary
    });

    // Basic file validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Basic file signature validation
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (!isJPEG && !isPNG && !isWebP) {
      return NextResponse.json({ error: "File signature validation failed. File may be corrupted." }, { status: 400 });
    }

    // Determine content type and folder
    let contentType = file.type;
    if (isJPEG) contentType = 'image/jpeg';
    if (isPNG) contentType = 'image/png';
    if (isWebP) contentType = 'image/webp';

    const folder = isSecretary ? "team/secretaries" : "team";
    const fileName = generateFileName(file.name);
    const filePath = `${folder}/${fileName}`;

    console.log('Uploading directly to Firebase:', { filePath, contentType, size: buffer.length });

    // Upload directly to Firebase Storage without any processing
    const storage = getStorage();
    const bucket = storage.bucket();
    const firebaseFile = bucket.file(filePath);

    await firebaseFile.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          uploadType: 'no-sharp-processing',
          memberId: memberId
        }
      },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log('Direct upload successful, updating team member...', { url: publicUrl, memberId });

    // Update the team member's photo URL
    try {
      await updateTeamMember(memberId, { photoPath: publicUrl });
      console.log('Team member updated successfully');
    } catch (updateError) {
      console.error('Team member update failed:', updateError);
      return NextResponse.json({ 
        error: `Upload successful but team member update failed: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`,
        url: publicUrl,
        note: "Image was uploaded successfully but database update failed. You may need to manually update the team member's photo path."
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Photo uploaded successfully without image processing",
      url: publicUrl,
      fileName: fileName,
      size: buffer.length,
      contentType: contentType,
      note: "This image was uploaded without optimization or resizing. Original quality preserved."
    });

  } catch (error) {
    console.error("No-Sharp upload error:", error);
    return NextResponse.json(
      { 
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

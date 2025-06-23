import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from 'fs';
import path from 'path';

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
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  return `temp-${timestamp}-${baseName}.${extension}`;
}

// Test upload without Firebase Admin (returns upload instructions for client-side)
export async function POST(request: NextRequest) {
  try {
    console.log('Client-side upload prep endpoint called');

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('File received for client-side upload prep:', {
      name: file.name,
      size: file.size,
      type: file.type
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

    // Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Basic file signature validation
    const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (!isJPEG && !isPNG && !isWebP) {
      return NextResponse.json({ error: "File signature validation failed. File may be corrupted." }, { status: 400 });
    }

    // Generate suggested filename and path
    const fileName = generateFileName(file.name);
    const suggestedPath = `temp-uploads/${fileName}`;

    // Return upload instructions (client-side Firebase can handle the actual upload)
    return NextResponse.json({
      success: true,
      message: "File validated successfully - ready for client-side upload",
      fileInfo: {
        originalName: file.name,
        suggestedFileName: fileName,
        suggestedPath: suggestedPath,
        size: file.size,
        validatedSignature: isJPEG ? 'JPEG' : isPNG ? 'PNG' : 'WebP'
      },
      uploadInstructions: {
        method: "Use client-side Firebase Storage upload",
        path: suggestedPath,
        contentType: file.type,
        note: "This bypasses server-side Firebase Admin authentication issues"
      },
      environmentInfo: {
        hasClientFirebaseConfig: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        ),
        bucketName: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      }
    });

  } catch (error) {
    console.error("Client-side upload prep error:", error);
    return NextResponse.json(
      { 
        error: `Upload prep failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

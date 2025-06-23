import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToFirebase } from "@/lib/firebase-storage";
import { validateImageFile, convertToSupportedFormat } from "@/lib/image-format-utils";
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

// Simple upload test without team member update
export async function POST(request: NextRequest) {
  try {
    console.log('Simple upload test endpoint called');

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use improved image validation
    const validation = validateImageFile(buffer);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    // Convert to supported format if needed
    let processedImage;
    try {
      processedImage = await convertToSupportedFormat(buffer);
      console.log('Image format conversion successful:', { 
        finalFormat: processedImage.format,
        originalSize: buffer.length,
        processedSize: processedImage.buffer.length
      });
    } catch (conversionError) {
      console.error('Image format conversion failed:', conversionError);
      return NextResponse.json({ 
        error: conversionError instanceof Error ? conversionError.message : 'Image format conversion failed'
      }, { status: 400 });
    }

    // Generate test filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `test-${timestamp}.${extension}`;

    console.log('Starting Firebase upload test...', { safeFileName });

    // Upload to Firebase Storage
    const result = await uploadImageToFirebase(
      processedImage.buffer, 
      safeFileName, 
      'test-uploads',
      {
        quality: 85,
        maxWidth: 800,
        maxHeight: 800
      }
    );

    console.log('Simple upload test successful:', { url: result.url });

    return NextResponse.json({
      success: true,
      message: "Simple upload test successful",
      url: result.url,
      fileName: result.filename,
      size: result.size,
      originalSize: buffer.length,
      processedSize: processedImage.buffer.length,
      format: processedImage.format
    });

  } catch (error) {
    console.error("Simple upload test error:", error);
    return NextResponse.json(
      { 
        error: `Simple upload test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}

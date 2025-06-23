import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToFirebase } from "@/lib/firebase-storage";
import { updateTeamMember } from "@/lib/team-firebase";
import { validateImageFile, convertToSupportedFormat } from "@/lib/image-format-utils";
import fs from 'fs';
import path from 'path';

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }

  // Check if email is in admin list
  try {
    const adminEmailsPath = path.join(process.cwd(), 'data', 'admin-emails.json');
    const adminEmails = JSON.parse(fs.readFileSync(adminEmailsPath, 'utf8'));
    return adminEmails.emails.includes(session.user.email);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// POST /api/admin/team/upload-photo - Upload team member photo
export async function POST(request: NextRequest) {
  try {
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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    // Additional validation: check if it's actually an image by reading the first few bytes
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
        originalFormat: 'detected', 
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

    console.log('File validation and processing passed:', { 
      name: file.name, 
      size: file.size, 
      type: file.type,
      finalFormat: processedImage.format,
      processedSize: processedImage.buffer.length
    });

    // Determine the folder based on role
    const folder = isSecretary ? "team/secretaries" : "team";
    
    // Create a safe filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `${memberId}-${timestamp}.${fileExtension}`;

    // Upload to Firebase Storage (using processed image buffer)
    const result = await uploadImageToFirebase(
      processedImage.buffer, 
      safeFileName, 
      folder, 
      {
        quality: 85,
        maxWidth: 800,
        maxHeight: 800
      }
    );

    // Update the team member's photo URL in the database
    await updateTeamMember(memberId, { photoPath: result.url });

    return NextResponse.json({ 
      success: true, 
      url: result.url,
      filePath: result.path
    });

  } catch (error) {
    console.error("Error uploading team photo:", error);
    return NextResponse.json(
      { error: `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/team/upload-photo - Delete team member photo
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    return NextResponse.json({ message: "Photo deleted successfully" });

  } catch (error) {
    console.error("Error deleting team photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

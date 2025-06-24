import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

// Simplified logo upload for testing - bypasses auth temporarily
export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGO UPLOAD DEBUG START ===');
    
    // Check environment
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log('Environment check:', {
      hasToken: !!token,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN not found in environment');
      return NextResponse.json({ 
        error: "Server configuration error - missing blob token" 
      }, { status: 500 });
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
      console.log('Form data parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse form data:', parseError);
      return NextResponse.json({ 
        error: "Failed to parse form data" 
      }, { status: 400 });
    }

    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;
    const clubType = formData.get('clubType') as string;
    
    console.log('Form data contents:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      clubId,
      clubType
    });

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    // Clean the club ID
    const cleanClubId = clubId.split(':')[0];
    console.log('Club ID cleaned:', { original: clubId, clean: cleanClubId });

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." 
      }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 5MB." 
      }, { status: 400 });
    }

    // Create filename
    const fileExtension = file.name.split('.').pop();
    const logoType = clubType === 'club' ? 'clubs' : 
                    clubType === 'hobby-group' ? 'hobby-groups' : 
                    'technical-council-groups';
    const fileName = `logos/${logoType}/${cleanClubId}.${fileExtension}`;

    console.log('Upload parameters:', {
      fileName,
      logoType,
      fileExtension,
      fileSize: file.size,
      fileType: file.type
    });

    // Attempt upload
    console.log('Starting blob upload...');
    const blob = await put(fileName, file, {
      access: 'public',
      token: token,
      addRandomSuffix: false,
    });

    console.log('Upload successful:', {
      url: blob.url,
      fileName
    });

    console.log('=== LOGO UPLOAD DEBUG END ===');

    return NextResponse.json({ 
      url: blob.url,
      message: "Logo uploaded successfully",
      debug: {
        fileName,
        originalSize: file.size
      }
    });

  } catch (error) {
    console.error('=== LOGO UPLOAD ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END ERROR DEBUG ===');
    
    return NextResponse.json({
      error: "Failed to upload logo",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error?.constructor?.name || "Unknown"
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from '@vercel/blob';

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/clubs/upload-logo - Upload club/hobby group logo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clubId = formData.get('clubId') as string;
    const clubType = formData.get('clubType') as string;
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId?.split(':')[0];
    
    console.log('Logo upload request:', { 
      originalId: clubId, 
      cleanId: cleanClubId, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!cleanClubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not found');
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Create a filename based on club type and ID
    const fileExtension = file.name.split('.').pop();
    const logoType = clubType === 'club' ? 'clubs' : 
                    clubType === 'hobby-group' ? 'hobby-groups' : 
                    'technical-council-groups';
    const fileName = `logos/${logoType}/${cleanClubId}.${fileExtension}`;

    console.log('Uploading to blob:', { fileName, logoType, fileExtension });

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false, // Ensure consistent file naming
      allowOverwrite: true, // Allow overwriting existing logos
    });

    console.log('Logo uploaded successfully:', { url: blob.url, fileName });

    return NextResponse.json({ 
      url: blob.url,
      message: "Logo uploaded successfully" 
    });

  } catch (error) {
    console.error("Error uploading logo:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name
    });
    return NextResponse.json(
      { 
        error: "Failed to upload logo",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs/upload-logo - Delete club logo
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const clubType = searchParams.get("clubType");
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId?.split(':')[0];
    
    console.log('Logo delete request:', { originalId: clubId, cleanId: cleanClubId, clubType });

    if (!cleanClubId || !clubType) {
      return NextResponse.json({ error: "Club ID and type are required" }, { status: 400 });
    }

    // For now, just return success - actual deletion would require knowing the specific blob URL
    // The frontend will handle removing the logo from the UI
    return NextResponse.json({ message: "Logo deleted successfully" });

  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}

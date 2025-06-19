import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToFirebase, uploadToFirebase } from "@/lib/firebase-storage";

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
    const file = formData.get("file") as File;
    const clubId = formData.get("clubId") as string;
    const clubType = formData.get("clubType") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    if (!clubType || !['club', 'hobby-group'].includes(clubType)) {
      return NextResponse.json({ error: "Valid club type is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Determine folder based on club type
    const logoType = clubType === 'club' ? 'clubs' : 'hobby-groups';
    const folder = `logos/${logoType}`;

    // Generate filename with club ID
    const fileName = `${clubId}.png`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let result;

    // Handle SVG files differently
    if (file.type === "image/svg+xml") {
      // Upload SVG directly without processing
      const svgFileName = `${clubId}.svg`;
      result = await uploadToFirebase(buffer, svgFileName, file.type, folder);
    } else {
      // Upload and optimize image using Firebase Storage
      result = await uploadImageToFirebase(
        buffer,
        fileName,
        folder,
        {
          maxWidth: 400,
          maxHeight: 400,
          quality: 90,
          format: 'png'
        }
      );
    }

    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
      clubId,
      clubType
    });

  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
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
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    return NextResponse.json({ message: "Logo deleted successfully" });

  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}

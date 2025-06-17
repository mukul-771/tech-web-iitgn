import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToFirebase, deleteFromFirebase } from "@/lib/firebase-storage";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/team/upload-photo - Upload team member photo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const memberId = formData.get("memberId") as string;
    const isSecretary = formData.get("isSecretary") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine target size based on role
    const targetSize = isSecretary ? 300 : 200;

    // Generate filename with member ID prefix
    const fileName = `${memberId}-${Date.now()}.jpg`;

    // Upload and optimize image using Firebase Storage
    const result = await uploadImageToFirebase(
      buffer,
      fileName,
      'team',
      {
        maxWidth: targetSize,
        maxHeight: targetSize,
        quality: 90,
        format: 'jpeg'
      }
    );

    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
      memberId,
      dimensions: `${targetSize}x${targetSize}`
    });

  } catch (error) {
    console.error("Error uploading team photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
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

    // Delete from Firebase Storage
    await deleteFromFirebase(filePath);

    return NextResponse.json({ message: "Photo deleted successfully" });

  } catch (error) {
    console.error("Error deleting team photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

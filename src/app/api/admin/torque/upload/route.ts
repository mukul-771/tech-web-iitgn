import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToFirebase } from "@/lib/firebase-storage";
import { allowedFileTypes, maxFileSize } from "@/lib/torque-data";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/torque/upload - Upload magazine file
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const year = formData.get("year") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!year) {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `torque-${year}-${timestamp}-${originalName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Firebase Storage
    const result = await uploadToFirebase(
      buffer,
      fileName,
      file.type,
      'torque/magazines'
    );

    return NextResponse.json({
      fileName: result.filename,
      filePath: result.url,
      fileSize: result.size,
      year,
      message: "File uploaded successfully"
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

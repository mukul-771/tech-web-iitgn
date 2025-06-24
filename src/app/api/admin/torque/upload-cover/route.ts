import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/torque/upload-cover - Upload magazine cover photo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const magazineId = formData.get("magazineId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!magazineId) {
      return NextResponse.json({ error: "Magazine ID is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size too large. Maximum size is 10MB" }, { status: 400 });
    }

    // Create covers directory if it doesn't exist
    const coversDir = path.join(process.cwd(), "public", "torque", "covers");
    try {
      await fs.access(coversDir);
    } catch {
      await fs.mkdir(coversDir, { recursive: true });
    }

    // Get file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Generate filename based on magazine ID
    const fileName = `${magazineId}-cover.${extension}`;
    const filePath = path.join(coversDir, fileName);

    // Delete existing cover photo if it exists
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of extensions) {
      const existingFile = path.join(coversDir, `${magazineId}-cover.${ext}`);
      try {
        await fs.access(existingFile);
        await fs.unlink(existingFile);
      } catch {
        // File doesn't exist, continue
      }
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return file info
    return NextResponse.json({
      filePath: `/torque/covers/${fileName}`,
      fileName: file.name
    });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    return NextResponse.json(
      { error: "Failed to upload cover photo" },
      { status: 500 }
    );
  }
}

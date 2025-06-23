import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Basic file validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Test just the image optimization without Firebase upload
    
    try {
      // Try to optimize the image
      const optimizedBuffer = await sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      console.log('Image optimization successful:', {
        originalSize: buffer.length,
        optimizedSize: optimizedBuffer.length,
        fileName: file.name,
        fileType: file.type
      });

      return NextResponse.json({ 
        success: true,
        message: "Image optimization test passed",
        details: {
          originalSize: buffer.length,
          optimizedSize: optimizedBuffer.length,
          fileName: file.name,
          fileType: file.type,
          userEmail: session.user.email
        }
      });

    } catch (sharpError) {
      console.error('Sharp optimization error:', sharpError);
      return NextResponse.json({ 
        error: "Image optimization failed",
        details: sharpError instanceof Error ? sharpError.message : 'Unknown Sharp error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Upload test error:", error);
    return NextResponse.json(
      { 
        error: "Upload test failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

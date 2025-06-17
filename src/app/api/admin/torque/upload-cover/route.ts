import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImageToFirebase } from '@/lib/firebase-storage';
import { allowedImageTypes, maxImageSize } from '@/lib/torque-data';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const magazineId = formData.get('magazineId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!magazineId) {
      return NextResponse.json(
        { error: 'Magazine ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedImageTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxImageSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxImageSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate filename for cover
    const fileName = `${magazineId}-cover.jpg`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload and optimize cover image using Firebase Storage
    const result = await uploadImageToFirebase(
      buffer,
      fileName,
      'torque/covers',
      {
        maxWidth: 800,
        maxHeight: 1200,
        quality: 85,
        format: 'jpeg'
      }
    );

    return NextResponse.json({
      success: true,
      filePath: result.url,
      fileName: result.filename,
      fileSize: result.size
    });

  } catch (error) {
    console.error('Error uploading cover photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload cover photo' },
      { status: 500 }
    );
  }
}

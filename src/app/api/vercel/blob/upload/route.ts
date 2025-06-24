import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
 
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
 
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Validate that the user is authenticated (you can add your auth logic here)
        // For now, we'll allow all uploads but you should add proper authentication
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max file size
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: do something after upload completes
        console.log('blob upload completed', blob);
      },
    });
 
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 400 }
    );
  }
}

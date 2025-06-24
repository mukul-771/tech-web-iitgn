// Simple test endpoint to verify Vercel Blob functionality
import { NextResponse } from "next/server";
import { put } from '@vercel/blob';

export async function GET() {
  try {
    console.log('Testing Vercel Blob configuration...');
    
    // Check if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!token);
    
    if (!token) {
      return NextResponse.json({ 
        error: "BLOB_READ_WRITE_TOKEN not configured",
        hasToken: false 
      }, { status: 500 });
    }

    // Try a simple test upload
    const testData = JSON.stringify({ test: "blob functionality test", timestamp: new Date().toISOString() });
    
    const blob = await put('test-blob.json', testData, {
      access: 'public',
      token: token,
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    console.log('Test blob upload successful:', blob.url);

    return NextResponse.json({
      success: true,
      message: "Vercel Blob is working correctly",
      testBlobUrl: blob.url,
      hasToken: true
    });

  } catch (error) {
    console.error('Blob test failed:', error);
    return NextResponse.json({
      error: "Blob test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
    }, { status: 500 });
  }
}

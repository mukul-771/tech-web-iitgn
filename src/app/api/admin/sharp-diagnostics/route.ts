import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }

  try {
    const adminEmailsPath = path.join(process.cwd(), 'data', 'admin-emails.json');
    const adminEmails = JSON.parse(fs.readFileSync(adminEmailsPath, 'utf8'));
    return adminEmails.emails.includes(session.user.email);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Test Sharp configuration and capabilities
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const diagnostics: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version,
    };

    // Test Sharp basic functionality
    try {
      diagnostics.sharp = {
        available: true,
        version: sharp.versions?.sharp || 'unknown',
        libvips: sharp.versions?.vips || 'unknown',
        formats: {}
      };

      // Test format support
      const testFormats = ['jpeg', 'png', 'webp', 'tiff', 'gif'];
      const formats: Record<string, unknown> = {};
      
      for (const format of testFormats) {
        try {
          const testBuffer = await sharp({
            create: {
              width: 10,
              height: 10,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          }).jpeg().toBuffer(); // Always use jpeg for the test
          
          formats[format] = {
            supported: true,
            testSize: testBuffer.length
          };
        } catch (formatError) {
          formats[format] = {
            supported: false,
            error: formatError instanceof Error ? formatError.message : 'Unknown error'
          };
        }
      }
      
      (diagnostics.sharp as Record<string, unknown>).formats = formats;

      // Test decoder configurations
      const decoderTests = [
        { name: 'default', config: {} },
        { name: 'failOnError_false', config: { failOnError: false } },
        { name: 'unlimited_true', config: { unlimited: true } },
        { name: 'sequentialRead_true', config: { sequentialRead: true } },
        { name: 'all_permissive', config: { failOnError: false, unlimited: true, sequentialRead: true } }
      ];

      const decoderResults: Record<string, unknown> = {};

      // Create a simple test image buffer
      const simpleTestBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 100, g: 150, b: 200 }
        }
      }).jpeg().toBuffer();

      for (const test of decoderTests) {
        try {
          const testInstance = sharp(simpleTestBuffer, test.config);
          const metadata = await testInstance.metadata();
          
          decoderResults[test.name] = {
            success: true,
            metadata: {
              format: metadata.format,
              width: metadata.width,
              height: metadata.height
            }
          };
        } catch (testError) {
          decoderResults[test.name] = {
            success: false,
            error: testError instanceof Error ? testError.message : 'Unknown error'
          };
        }
      }
      
      (diagnostics.sharp as Record<string, unknown>).decoderTests = decoderResults;

    } catch (sharpError) {
      diagnostics.sharp = {
        available: false,
        error: sharpError instanceof Error ? sharpError.message : 'Unknown Sharp error',
        stack: sharpError instanceof Error ? sharpError.stack : undefined
      };
    }

    // Environment variables check
    diagnostics.environment = {
      hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      isVercel: !!process.env.VERCEL
    };

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error("Sharp diagnostics error:", error);
    return NextResponse.json(
      { 
        error: `Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

// Test Firebase service account configuration
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const diagnostics: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Check environment variables
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const hasStorageBucket = !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    diagnostics.environment = {
      hasServiceAccountKey,
      hasStorageBucket,
      keyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
      bucketName: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'not set'
    };

    // Try to parse the service account key
    if (hasServiceAccountKey) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
        diagnostics.serviceAccount = {
          hasProjectId: !!serviceAccount.project_id,
          hasPrivateKey: !!serviceAccount.private_key,
          hasClientEmail: !!serviceAccount.client_email,
          hasClientId: !!serviceAccount.client_id,
          keyType: serviceAccount.type || 'unknown',
          projectId: serviceAccount.project_id || 'not set',
          clientEmail: serviceAccount.client_email || 'not set',
          privateKeyStart: serviceAccount.private_key ? serviceAccount.private_key.substring(0, 50) + '...' : 'not found'
        };

        // Validate private key format
        if (serviceAccount.private_key) {
          const validKeyStart = serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----');
          const validKeyEnd = serviceAccount.private_key.includes('-----END PRIVATE KEY-----');
          diagnostics.serviceAccount.privateKeyValid = validKeyStart && validKeyEnd;
        }

      } catch (parseError) {
        diagnostics.serviceAccount = {
          parseError: parseError instanceof Error ? parseError.message : 'Failed to parse service account key'
        };
      }
    }

    // Try basic Firebase Admin initialization test (without actual operations)
    try {
      const { initializeApp, getApps } = await import('firebase-admin/app');
      const appsInitialized = getApps().length;
      diagnostics.firebaseAdmin = {
        appsInitialized,
        canImport: true
      };
    } catch (importError) {
      diagnostics.firebaseAdmin = {
        canImport: false,
        importError: importError instanceof Error ? importError.message : 'Failed to import Firebase Admin'
      };
    }

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error("Service account diagnostics error:", error);
    return NextResponse.json(
      { 
        error: `Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

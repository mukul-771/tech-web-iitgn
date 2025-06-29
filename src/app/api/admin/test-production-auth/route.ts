import { NextResponse } from "next/server";
import { getAdminEmails } from "@/lib/admin-emails-blob-storage";

export async function GET() {
  try {
    console.log('🔍 Testing production admin email loading...');
    
    // This uses the actual production function that auth.ts uses
    const adminEmailsData = await getAdminEmails();
    
    return NextResponse.json({
      success: true,
      emailCount: adminEmailsData.emails.length,
      emails: adminEmailsData.emails,
      lastModified: adminEmailsData.lastModified,
      modifiedBy: adminEmailsData.modifiedBy,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN
    });
    
  } catch (error) {
    console.error('❌ Production admin email test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN
    });
  }
}

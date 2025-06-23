import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Read admin emails
    let adminEmails: string[] = [];
    try {
      const adminEmailsPath = path.join(process.cwd(), 'data', 'admin-emails.json');
      const adminData = JSON.parse(fs.readFileSync(adminEmailsPath, 'utf8'));
      adminEmails = adminData.emails || [];
    } catch (error) {
      console.error('Error reading admin emails:', error);
    }

    const userEmail = session?.user?.email;
    const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

    return NextResponse.json({
      session: {
        exists: !!session,
        user: session?.user ? {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        } : null
      },
      adminEmails: adminEmails,
      isAdmin,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in debug-auth:", error);
    return NextResponse.json(
      { error: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

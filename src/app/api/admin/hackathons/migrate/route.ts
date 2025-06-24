import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { migrateFromFileSystem } from '@/lib/hackathons-storage';

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

export async function POST() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const migrated = await migrateFromFileSystem();
    
    if (migrated) {
      return NextResponse.json({ 
        message: "Successfully migrated hackathons from file system to Vercel Blob",
        migrated: true 
      });
    } else {
      return NextResponse.json({ 
        message: "No data to migrate or already migrated",
        migrated: false 
      });
    }
  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}

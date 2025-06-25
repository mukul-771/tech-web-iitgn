import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { migrateInterIITAchievementsFromFileSystem } from '@/lib/inter-iit-achievements-blob-storage';

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

    const migrated = await migrateInterIITAchievementsFromFileSystem();
    
    if (migrated) {
      return NextResponse.json({ 
        message: "Successfully migrated Inter-IIT achievements from file system to Vercel Blob",
        migrated: true 
      });
    } else {
      return NextResponse.json({ 
        message: "No data to migrate or already migrated",
        migrated: false 
      });
    }
  } catch (error) {
    console.error('Error during Inter-IIT achievements migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 }
    );
  }
}

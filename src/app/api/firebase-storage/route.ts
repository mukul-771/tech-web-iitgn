import { NextRequest, NextResponse } from "next/server";
import { listStorageFiles, getFreshDownloadUrl } from "@/lib/firebase-storage-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      // List all files in team storage
      const files = await listStorageFiles("team/");
      return NextResponse.json({ files });
    }

    if (action === 'refresh' && searchParams.get('path')) {
      // Get fresh download URL for a specific file
      const path = searchParams.get('path')!;
      const url = await getFreshDownloadUrl(path);
      return NextResponse.json({ path, url });
    }

    if (action === 'refresh-all') {
      // Get fresh URLs for all team files
      const files = await listStorageFiles("team/");
      const refreshedUrls: Record<string, string | null> = {};

      for (const file of files) {
        try {
          const url = await getFreshDownloadUrl(file);
          refreshedUrls[file] = url;
        } catch (error) {
          console.error(`Error refreshing URL for ${file}:`, error);
          refreshedUrls[file] = null;
        }
      }

      return NextResponse.json({ refreshedUrls });
    }

    return NextResponse.json({ error: "Invalid action. Use 'list', 'refresh', or 'refresh-all'" }, { status: 400 });
  } catch (error) {
    console.error("Error in Firebase Storage API:", error);
    return NextResponse.json(
      { error: "Failed to process Firebase Storage request" },
      { status: 500 }
    );
  }
}

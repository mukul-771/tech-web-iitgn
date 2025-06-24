import { NextResponse } from "next/server";
import { getLatestMagazine } from "@/lib/torque-storage";

// GET /api/torque/latest - Get the latest magazine for public display
export async function GET() {
  try {
    const latestMagazine = await getLatestMagazine();
    
    if (!latestMagazine) {
      return NextResponse.json(null);
    }

    // Return only public information
    const publicMagazine = {
      id: latestMagazine.id,
      year: latestMagazine.year,
      title: latestMagazine.title,
      description: latestMagazine.description,
      pages: latestMagazine.pages,
      articles: latestMagazine.articles,
      featured: latestMagazine.featured,
      downloadUrl: latestMagazine.filePath,
      viewUrl: latestMagazine.filePath,
      coverPhoto: latestMagazine.coverPhoto
    };

    return NextResponse.json(publicMagazine);
  } catch (error) {
    console.error("Error fetching latest magazine:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest magazine" },
      { status: 500 }
    );
  }
}

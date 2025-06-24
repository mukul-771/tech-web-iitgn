import { NextResponse } from "next/server";
import { getAllMagazines } from "@/lib/torque-storage";

// GET /api/torque - Get all magazines for public display
export async function GET() {
  try {
    const magazinesObj = await getAllMagazines();
    
    // Convert object to array and transform for public consumption
    const magazines = Object.values(magazinesObj).map(magazine => ({
      id: magazine.id,
      year: magazine.year,
      title: magazine.title,
      description: magazine.description,
      pages: magazine.pages,
      articles: magazine.articles,
      featured: magazine.featured,
      downloadUrl: magazine.filePath,
      viewUrl: magazine.filePath,
      coverPhoto: magazine.coverPhoto
    }));
    
    return NextResponse.json(magazines);
  } catch (error) {
    console.error("Error fetching magazines:", error);
    return NextResponse.json(
      { error: "Failed to fetch magazines" },
      { status: 500 }
    );
  }
}

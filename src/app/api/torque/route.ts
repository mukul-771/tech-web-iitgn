import { NextResponse } from "next/server";
import { getMagazinesForDisplay } from "@/lib/torque-storage";

// GET /api/torque - Get all magazines for public display
export async function GET() {
  try {
    const magazines = await getMagazinesForDisplay();
    return NextResponse.json(magazines);
  } catch (error) {
    console.error("Error fetching magazines:", error);
    return NextResponse.json(
      { error: "Failed to fetch magazines" },
      { status: 500 }
    );
  }
}

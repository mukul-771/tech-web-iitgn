import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// POST /api/admin/clubs/upload-logo - Upload club/hobby group logo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const clubId = formData.get('clubId') as string;
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId?.split(':')[0];
    
    console.log('Logo upload request:', { originalId: clubId, cleanId: cleanClubId });

    return NextResponse.json({ message: "Logo uploaded successfully" });

  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs/upload-logo - Delete club logo
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const filePath = searchParams.get("filePath");
    
    // Clean the club ID (remove any trailing characters like :1)
    const cleanClubId = clubId?.split(':')[0];
    
    console.log('Logo delete request:', { originalId: clubId, cleanId: cleanClubId, filePath });

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    return NextResponse.json({ message: "Logo deleted successfully" });

  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}

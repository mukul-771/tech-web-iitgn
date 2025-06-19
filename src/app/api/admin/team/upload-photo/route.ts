import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// DELETE /api/admin/team/upload-photo - Delete team member photo
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }

    // Delete from Firebase Storage
    await deleteFromFirebase(filePath);

    return NextResponse.json({ message: "Photo deleted successfully" });

  } catch (error) {
    console.error("Error deleting team photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      session: session,
      isAdmin: session?.user?.isAdmin || false,
      user: session?.user || null
    });
  } catch (error) {
    console.error("Error checking auth:", error);
    return NextResponse.json(
      { error: "Failed to check auth" },
      { status: 500 }
    );
  }
}

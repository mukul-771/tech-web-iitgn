import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/torque/upload - Upload magazine file
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Upload logic has been moved to the client-side." },
    { status: 400 }
  );
}

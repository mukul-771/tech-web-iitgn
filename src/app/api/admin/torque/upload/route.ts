// This endpoint is deprecated and should not be used. All uploads should go directly to Vercel Blob from the client.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Direct file uploads to this endpoint are not supported. Please upload directly to Vercel Blob from the client.' }, { status: 400 });
}

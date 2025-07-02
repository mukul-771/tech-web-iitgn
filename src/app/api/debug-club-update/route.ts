import { NextRequest, NextResponse } from "next/server";
import { updateClub } from "@/lib/db/clubs";

// Debug endpoint to test club updates without authentication
export async function PUT(request: NextRequest) {
  try {
    console.log('=== DEBUG CLUB UPDATE START ===');
    
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    
    console.log('Club ID from query:', clubId);
    
    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    // Clean the club ID
    const cleanClubId = clubId.split(':')[0];
    console.log('Clean club ID:', cleanClubId);

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
      console.log('Body keys:', Object.keys(body));
      console.log('Body content:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Attempt update
    console.log('Attempting club update...');
    const updatedClub = await updateClub(cleanClubId, body);

    if (!updatedClub) {
      console.log('Club not found');
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    console.log('Club updated successfully');
    console.log('=== DEBUG CLUB UPDATE END ===');

    return NextResponse.json({ 
      success: true,
      message: "Club updated successfully",
      club: updatedClub
    });

  } catch (error) {
    console.error('=== DEBUG CLUB UPDATE ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END ERROR DEBUG ===');
    
    return NextResponse.json({
      error: "Failed to update club",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error?.constructor?.name || "Unknown"
    }, { status: 500 });
  }
}

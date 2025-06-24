import { NextResponse } from 'next/server';
import { getHackathonsForDisplay } from '@/lib/hackathons-storage';
import { getHackathonsVisibility } from '@/lib/site-settings';

export async function GET() {
  try {
    // Check if hackathons section is visible
    const isVisible = await getHackathonsVisibility();

    if (!isVisible) {
      return NextResponse.json(
        { error: 'Hackathons section is currently disabled' },
        { status: 404 }
      );
    }

    const hackathons = await getHackathonsForDisplay();
    return NextResponse.json({
      hackathons,
      visible: isVisible
    });
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    );
  }
}

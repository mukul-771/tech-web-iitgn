import { NextResponse } from 'next/server';
import { getContactInfo } from '@/lib/contact-storage';

// GET - Public endpoint to fetch contact information for the footer
export async function GET() {
  try {
    const contactInfo = await getContactInfo();
    
    // Return only the necessary public information
    return NextResponse.json({
      address: contactInfo.address,
      phone: contactInfo.phone,
      email: contactInfo.email,
      socialMedia: contactInfo.socialMedia
    });
  } catch (error) {
    console.error('Error fetching public contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact information' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getContactInfo, saveContactInfo, updateContactField } from '@/lib/contact-storage';

// GET - Fetch contact information
export async function GET() {
  try {
    const contactInfo = await getContactInfo();
    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact information' },
      { status: 500 }
    );
  }
}

// PUT - Update contact information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contactInfo, field, value } = body;

    let updatedContact;

    if (contactInfo) {
      // Full contact info update
      updatedContact = await saveContactInfo({
        ...contactInfo,
        modifiedBy: session.user.email || 'Unknown Admin'
      });
    } else if (field && value !== undefined) {
      // Single field update
      updatedContact = await updateContactField(
        field,
        value,
        session.user.email || 'Unknown Admin'
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      contactInfo: updatedContact
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    return NextResponse.json(
      { error: 'Failed to update contact information' },
      { status: 500 }
    );
  }
}

// POST - Reset to default contact information
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Reset to default by creating a new contact info with current timestamp
    const defaultContact = {
      address: {
        street: "323, Acad Block 4, IIT Gandhinagar",
        city: "Palaj, Gandhinagar",
        state: "Gujarat",
        postalCode: "382355",
        country: "India"
      },
      phone: "+91-79-2395-2001",
      email: "technical.secretary@iitgn.ac.in",
      socialMedia: {
        instagram: "https://www.instagram.com/tech_iitgn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
        youtube: "https://www.youtube.com/@tech_iitgn",
        linkedin: "https://www.linkedin.com/school/tech-council-iitgn/",
        facebook: "https://www.facebook.com/tech.iitgn"
      },
      lastModified: new Date().toISOString(),
      modifiedBy: session.user.email || 'Unknown Admin'
    };

    const updatedContact = await saveContactInfo(defaultContact);

    return NextResponse.json({
      success: true,
      contactInfo: updatedContact
    });
  } catch (error) {
    console.error('Error resetting contact info:', error);
    return NextResponse.json(
      { error: 'Failed to reset contact information' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSiteSettings, updateSetting } from '@/lib/site-settings';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

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
    const { setting, value } = body;
    
    if (!setting || value === undefined) {
      return NextResponse.json(
        { error: 'Setting and value are required' },
        { status: 400 }
      );
    }
    
    // Validate setting key
    const validSettings = ['hackathonsVisible'];
    if (!validSettings.includes(setting)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      );
    }
    
    const modifiedBy = session.user.email || session.user.name || 'admin';
    const updatedSettings = await updateSetting(setting, value, modifiedBy);
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

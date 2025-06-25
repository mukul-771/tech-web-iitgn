import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminEmails } from '@/lib/admin-emails-blob-storage'
import { getSiteSettings } from '@/lib/site-settings'
import { getContactInfo } from '@/lib/contact-storage'
import { getBlobSettings } from '@/lib/blob-storage'

// GET - Export all data as backup
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Collect all data for backup
    const backupData = {
      adminEmails: await getAdminEmails(),
      siteSettings: getSiteSettings(),
      contactInfo: await getContactInfo(),
      blobSettings: getBlobSettings(),
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.email || session.user.name || 'Unknown Admin'
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `tech-website-backup-${timestamp}.json`

    // Return as downloadable file
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBlobSettings, updateBlobSettings, resetBlobSettings } from '@/lib/blob-storage'

// GET - Retrieve blob settings
export async function GET() {
  try {
    const settings = getBlobSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching blob settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blob settings' },
      { status: 500 }
    )
  }
}

// PUT - Update blob settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    if (!body.color || typeof body.color !== 'string') {
      return NextResponse.json(
        { error: 'Color is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate hex color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(body.color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Must be a valid hex color (e.g., #06b6d4)' },
        { status: 400 }
      )
    }

    const updatedSettings = updateBlobSettings({
      color: body.color
    })

    return NextResponse.json({
      message: 'Blob settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error updating blob settings:', error)
    return NextResponse.json(
      { error: 'Failed to update blob settings' },
      { status: 500 }
    )
  }
}

// DELETE - Reset blob settings to default
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const defaultSettings = resetBlobSettings()

    return NextResponse.json({
      message: 'Blob settings reset to default successfully',
      settings: defaultSettings
    })
  } catch (error) {
    console.error('Error resetting blob settings:', error)
    return NextResponse.json(
      { error: 'Failed to reset blob settings' },
      { status: 500 }
    )
  }
}

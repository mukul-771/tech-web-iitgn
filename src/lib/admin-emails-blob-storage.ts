import { put } from '@vercel/blob'

export interface AdminEmailsData {
  emails: string[]
  lastModified: string
  modifiedBy: string
  createdAt: string
  updatedAt: string
}

// Default admin emails
const defaultAdminEmails: AdminEmailsData = {
  emails: [
    "mukul.meena@iitgn.ac.in",
    "technical.secretary@iitgn.ac.in",
  ],
  lastModified: new Date().toISOString(),
  modifiedBy: 'system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const BLOB_FILENAME = 'admin-emails.json'

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// Development fallback using local file system
async function getAdminEmailsFromFile(): Promise<AdminEmailsData> {
  if (isDevelopment) {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'data', 'admin-emails.json')
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch {
      await saveAdminEmailsToFile(defaultAdminEmails)
      return defaultAdminEmails
    }
  }
  throw new Error('Not in development mode')
}

async function saveAdminEmailsToFile(data: AdminEmailsData): Promise<void> {
  if (isDevelopment) {
    const fs = await import('fs/promises')
    const path = await import('path')
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, 'admin-emails.json')
    
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  }
}

// Get admin emails from blob storage or file system
export async function getAdminEmails(): Promise<AdminEmailsData> {
  try {
    if (isDevelopment) {
      return await getAdminEmailsFromFile()
    }

    // Production: use blob storage
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('BLOB_READ_WRITE_TOKEN not found, using default admin emails')
      return defaultAdminEmails
    }

    try {
      const response = await fetch(`https://b7ajqrsrmgst9onj.public.blob.vercel-storage.com/${BLOB_FILENAME}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.warn('Failed to fetch admin emails from blob storage:', error)
    }

    // If blob doesn't exist or fetch fails, return defaults
    return defaultAdminEmails
  } catch (error) {
    console.error('Error getting admin emails:', error)
    return defaultAdminEmails
  }
}

// Save admin emails to blob storage or file system
export async function saveAdminEmails(adminEmailsData: AdminEmailsData): Promise<void> {
  try {
    if (isDevelopment) {
      await saveAdminEmailsToFile(adminEmailsData)
      return
    }

    // Production: use blob storage
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN not configured')
    }

    const blob = await put(BLOB_FILENAME, JSON.stringify(adminEmailsData, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    console.log('Admin emails saved to blob storage:', blob.url)
  } catch (error) {
    console.error('Error saving admin emails:', error)
    throw new Error('Failed to save admin emails')
  }
}

// Add admin email
export async function addAdminEmail(email: string, modifiedBy: string = 'system'): Promise<AdminEmailsData> {
  try {
    const adminEmailsData = await getAdminEmails()
    
    if (adminEmailsData.emails.includes(email)) {
      throw new Error('Email already exists in admin list')
    }

    const updatedData: AdminEmailsData = {
      ...adminEmailsData,
      emails: [...adminEmailsData.emails, email],
      lastModified: new Date().toISOString(),
      modifiedBy,
      updatedAt: new Date().toISOString()
    }

    await saveAdminEmails(updatedData)
    return updatedData
  } catch (error) {
    console.error('Error adding admin email:', error)
    throw error
  }
}

// Remove admin email
export async function removeAdminEmail(email: string, modifiedBy: string = 'system'): Promise<AdminEmailsData> {
  try {
    const adminEmailsData = await getAdminEmails()
    
    // Prevent removing the last admin email
    if (adminEmailsData.emails.length <= 1) {
      throw new Error('Cannot remove the last admin email')
    }

    const updatedEmails = adminEmailsData.emails.filter(e => e !== email)
    
    if (updatedEmails.length === adminEmailsData.emails.length) {
      throw new Error('Email not found in admin list')
    }

    const updatedData: AdminEmailsData = {
      ...adminEmailsData,
      emails: updatedEmails,
      lastModified: new Date().toISOString(),
      modifiedBy,
      updatedAt: new Date().toISOString()
    }

    await saveAdminEmails(updatedData)
    return updatedData
  } catch (error) {
    console.error('Error removing admin email:', error)
    throw error
  }
}

// Update all admin emails
export async function updateAdminEmails(emails: string[], modifiedBy: string = 'system'): Promise<AdminEmailsData> {
  try {
    if (!emails || emails.length === 0) {
      throw new Error('At least one admin email is required')
    }

    // Remove duplicates and filter out empty strings
    const uniqueEmails = [...new Set(emails.filter(email => email.trim()))]
    
    if (uniqueEmails.length === 0) {
      throw new Error('At least one valid admin email is required')
    }

    const adminEmailsData = await getAdminEmails()
    const updatedData: AdminEmailsData = {
      ...adminEmailsData,
      emails: uniqueEmails,
      lastModified: new Date().toISOString(),
      modifiedBy,
      updatedAt: new Date().toISOString()
    }

    await saveAdminEmails(updatedData)
    return updatedData
  } catch (error) {
    console.error('Error updating admin emails:', error)
    throw error
  }
}

// Check if email is admin
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const adminEmailsData = await getAdminEmails()
    return adminEmailsData.emails.includes(email)
  } catch (error) {
    console.error('Error checking admin email:', error)
    return false
  }
}

import { put } from '@vercel/blob'

export interface BlobSettings {
  color: string
  lastUpdated: string
}

// Default blob settings
const DEFAULT_BLOB_SETTINGS: BlobSettings = {
  color: '#06b6d4', // Cyan-teal: optimal color theory choice
  lastUpdated: new Date().toISOString()
}

const BLOB_FILENAME = 'blob-settings.json'

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// Development fallback using local file system
async function getBlobSettingsFromFile(): Promise<BlobSettings> {
  if (isDevelopment) {
    try {
      const fs = await import('fs')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'data', 'blob-settings.json')
      
      if (!fs.existsSync(filePath)) {
        await saveBlobSettingsToFile(DEFAULT_BLOB_SETTINGS)
        return DEFAULT_BLOB_SETTINGS
      }
      
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    } catch {
      await saveBlobSettingsToFile(DEFAULT_BLOB_SETTINGS)
      return DEFAULT_BLOB_SETTINGS
    }
  }
  throw new Error('Not in development mode')
}

async function saveBlobSettingsToFile(settings: BlobSettings): Promise<void> {
  if (isDevelopment) {
    const fs = await import('fs')
    const path = await import('path')
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, 'blob-settings.json')
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2))
  }
}

// Get blob settings
export function getBlobSettings(): BlobSettings {
  try {
    if (isDevelopment) {
      // In development, use synchronous file operations
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'data', 'blob-settings.json')
      
      if (!fs.existsSync(filePath)) {
        const dataDir = path.join(process.cwd(), 'data')
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true })
        }
        fs.writeFileSync(filePath, JSON.stringify(DEFAULT_BLOB_SETTINGS, null, 2))
        return DEFAULT_BLOB_SETTINGS
      }
      
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }

    // In production, return defaults (blob settings are mainly for development)
    return DEFAULT_BLOB_SETTINGS
  } catch (error) {
    console.error('Error reading blob settings:', error)
    return DEFAULT_BLOB_SETTINGS
  }
}

// Update blob settings
export function updateBlobSettings(newSettings: Partial<BlobSettings>): BlobSettings {
  try {
    const currentSettings = getBlobSettings()
    const updatedSettings: BlobSettings = {
      ...currentSettings,
      ...newSettings,
      lastUpdated: new Date().toISOString()
    }
    
    // Validate color format (hex color)
    if (updatedSettings.color && !/^#[0-9A-Fa-f]{6}$/.test(updatedSettings.color)) {
      throw new Error('Invalid color format. Must be a valid hex color (e.g., #06b6d4)')
    }

    if (isDevelopment) {
      const fs = require('fs')
      const path = require('path')
      const dataDir = path.join(process.cwd(), 'data')
      const filePath = path.join(dataDir, 'blob-settings.json')
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      // Write to file atomically
      const tempFile = filePath + '.tmp'
      fs.writeFileSync(tempFile, JSON.stringify(updatedSettings, null, 2))
      fs.renameSync(tempFile, filePath)
    }
    
    // In production, blob settings are mainly cosmetic, so just return the updated settings
    return updatedSettings
  } catch (error) {
    console.error('Error updating blob settings:', error)
    throw error
  }
}

// Reset blob settings to default
export function resetBlobSettings(): BlobSettings {
  try {
    if (isDevelopment) {
      const fs = require('fs')
      const path = require('path')
      const dataDir = path.join(process.cwd(), 'data')
      const filePath = path.join(dataDir, 'blob-settings.json')
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_BLOB_SETTINGS, null, 2))
    }
    
    return DEFAULT_BLOB_SETTINGS
  } catch (error) {
    console.error('Error resetting blob settings:', error)
    throw error
  }
}

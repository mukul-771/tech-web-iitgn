import fs from 'fs'
import path from 'path'

export interface BlobSettings {
  color: string
  lastUpdated: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const BLOB_FILE = path.join(DATA_DIR, 'blob-settings.json')

// Default blob settings
const DEFAULT_BLOB_SETTINGS: BlobSettings = {
  color: '#06b6d4', // Cyan-teal: optimal color theory choice
  lastUpdated: new Date().toISOString()
}

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

// Ensure data directory exists (development only)
function ensureDataDir() {
  if (isDevelopment && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// In-memory storage for production environments
let productionBlobSettings: BlobSettings = { ...DEFAULT_BLOB_SETTINGS }

// Get blob settings
export function getBlobSettings(): BlobSettings {
  try {
    if (!isDevelopment) {
      // In production, return in-memory settings
      return productionBlobSettings
    }

    ensureDataDir()
    
    if (!fs.existsSync(BLOB_FILE)) {
      // Create default file if it doesn't exist
      fs.writeFileSync(BLOB_FILE, JSON.stringify(DEFAULT_BLOB_SETTINGS, null, 2))
      return DEFAULT_BLOB_SETTINGS
    }
    
    const data = fs.readFileSync(BLOB_FILE, 'utf8')
    const settings = JSON.parse(data)
    
    // Validate settings structure
    if (!settings.color || typeof settings.color !== 'string') {
      return DEFAULT_BLOB_SETTINGS
    }
    
    return settings
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
      ensureDataDir()
      
      // Write to file atomically
      const tempFile = BLOB_FILE + '.tmp'
      fs.writeFileSync(tempFile, JSON.stringify(updatedSettings, null, 2))
      fs.renameSync(tempFile, BLOB_FILE)
    } else {
      // In production, update in-memory storage
      productionBlobSettings = updatedSettings
    }
    
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
      ensureDataDir()
      fs.writeFileSync(BLOB_FILE, JSON.stringify(DEFAULT_BLOB_SETTINGS, null, 2))
    } else {
      // In production, reset in-memory storage
      productionBlobSettings = { ...DEFAULT_BLOB_SETTINGS }
    }
    
    return DEFAULT_BLOB_SETTINGS
  } catch (error) {
    console.error('Error resetting blob settings:', error)
    throw error
  }
}

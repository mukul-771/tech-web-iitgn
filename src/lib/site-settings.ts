import { promises as fs } from 'fs';
import path from 'path';

export interface SiteSettings {
  hackathonsVisible: boolean;
  lastModified: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'site-settings.json');

// Default settings
const defaultSettings: SiteSettings = {
  hackathonsVisible: true,
  lastModified: new Date().toISOString(),
  modifiedBy: 'system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get site settings
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Site settings file not found, creating with default settings');
    await saveSiteSettings(defaultSettings);
    return defaultSettings;
  }
}

// Save site settings with atomic write operation
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    await ensureDataDir();
    
    // Create temporary file for atomic write
    const tempFile = `${SETTINGS_FILE}.tmp`;
    const data = JSON.stringify(settings, null, 2);
    
    // Write to temporary file first
    await fs.writeFile(tempFile, data);
    
    // Atomically move temp file to final location
    await fs.rename(tempFile, SETTINGS_FILE);
    
    console.log('Site settings saved successfully');
  } catch (error) {
    console.error('Error saving site settings:', error);
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(`${SETTINGS_FILE}.tmp`);
    } catch {
      // Ignore cleanup errors
    }
    
    throw new Error('Failed to save site settings');
  }
}

// Update specific setting
export async function updateSetting(
  key: keyof Omit<SiteSettings, 'lastModified' | 'modifiedBy' | 'createdAt' | 'updatedAt'>,
  value: any,
  modifiedBy: string
): Promise<SiteSettings> {
  const settings = await getSiteSettings();
  
  const updatedSettings: SiteSettings = {
    ...settings,
    [key]: value,
    lastModified: new Date().toISOString(),
    modifiedBy,
    updatedAt: new Date().toISOString()
  };
  
  await saveSiteSettings(updatedSettings);
  return updatedSettings;
}

// Get hackathons visibility status
export async function getHackathonsVisibility(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.hackathonsVisible;
}

// Toggle hackathons visibility
export async function toggleHackathonsVisibility(modifiedBy: string): Promise<boolean> {
  const settings = await getSiteSettings();
  const newVisibility = !settings.hackathonsVisible;
  
  await updateSetting('hackathonsVisible', newVisibility, modifiedBy);
  return newVisibility;
}

// Set hackathons visibility
export async function setHackathonsVisibility(visible: boolean, modifiedBy: string): Promise<boolean> {
  await updateSetting('hackathonsVisible', visible, modifiedBy);
  return visible;
}

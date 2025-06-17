import { promises as fs } from 'fs';
import path from 'path';

export interface AdminEmailsData {
  emails: string[];
  lastModified: string;
  modifiedBy: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ADMIN_EMAILS_FILE = path.join(DATA_DIR, 'admin-emails.json');

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
};

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get admin emails
export async function getAdminEmails(): Promise<AdminEmailsData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ADMIN_EMAILS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Admin emails file not found, creating with default emails');
    await saveAdminEmails(defaultAdminEmails);
    return defaultAdminEmails;
  }
}

// Save admin emails with atomic write operation
export async function saveAdminEmails(adminEmailsData: AdminEmailsData): Promise<void> {
  try {
    await ensureDataDir();
    
    // Create temporary file for atomic write
    const tempFile = `${ADMIN_EMAILS_FILE}.tmp`;
    const data = JSON.stringify(adminEmailsData, null, 2);
    
    // Write to temporary file first
    await fs.writeFile(tempFile, data);
    
    // Atomically move temp file to final location
    await fs.rename(tempFile, ADMIN_EMAILS_FILE);
    
    console.log('Admin emails saved successfully');
  } catch (error) {
    console.error('Error saving admin emails:', error);
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(`${ADMIN_EMAILS_FILE}.tmp`);
    } catch {
      // Ignore cleanup errors
    }
    
    throw new Error('Failed to save admin emails');
  }
}

// Add admin email
export async function addAdminEmail(email: string, modifiedBy: string): Promise<AdminEmailsData> {
  const adminEmailsData = await getAdminEmails();
  
  // Check if email already exists
  if (adminEmailsData.emails.includes(email)) {
    throw new Error('Email already exists in admin list');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  const updatedData: AdminEmailsData = {
    ...adminEmailsData,
    emails: [...adminEmailsData.emails, email],
    lastModified: new Date().toISOString(),
    modifiedBy,
    updatedAt: new Date().toISOString()
  };
  
  await saveAdminEmails(updatedData);
  return updatedData;
}

// Remove admin email
export async function removeAdminEmail(email: string, modifiedBy: string): Promise<AdminEmailsData> {
  const adminEmailsData = await getAdminEmails();
  
  // Check if email exists
  if (!adminEmailsData.emails.includes(email)) {
    throw new Error('Email not found in admin list');
  }
  
  // Prevent removing the last admin email
  if (adminEmailsData.emails.length <= 1) {
    throw new Error('Cannot remove the last admin email');
  }
  
  const updatedData: AdminEmailsData = {
    ...adminEmailsData,
    emails: adminEmailsData.emails.filter(e => e !== email),
    lastModified: new Date().toISOString(),
    modifiedBy,
    updatedAt: new Date().toISOString()
  };
  
  await saveAdminEmails(updatedData);
  return updatedData;
}

// Update all admin emails
export async function updateAdminEmails(emails: string[], modifiedBy: string): Promise<AdminEmailsData> {
  // Validate that at least one email is provided
  if (!emails || emails.length === 0) {
    throw new Error('At least one admin email is required');
  }
  
  // Validate email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const email of emails) {
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }
  
  // Remove duplicates
  const uniqueEmails = [...new Set(emails)];
  
  const adminEmailsData = await getAdminEmails();
  const updatedData: AdminEmailsData = {
    ...adminEmailsData,
    emails: uniqueEmails,
    lastModified: new Date().toISOString(),
    modifiedBy,
    updatedAt: new Date().toISOString()
  };
  
  await saveAdminEmails(updatedData);
  return updatedData;
}

// Check if email is admin
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const adminEmailsData = await getAdminEmails();
    return adminEmailsData.emails.includes(email);
  } catch (error) {
    console.error('Error checking admin email:', error);
    return false;
  }
}

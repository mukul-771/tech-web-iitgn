import { del } from '@vercel/blob';
import { dbConnect } from './mongodb';
import { TorqueMagazine, ITorqueMagazine } from './torque-magazine.model';

// Get all magazines
export async function getAllMagazines(): Promise<Record<string, ITorqueMagazine>> {
  await dbConnect();
  const mags = await TorqueMagazine.find({}).lean();
  const result: Record<string, ITorqueMagazine> = {};
  mags.forEach((mag) => {
    result[mag._id.toString()] = mag;
  });
  return result;
}

// Get single magazine by ID
export async function getMagazineById(id: string): Promise<ITorqueMagazine | null> {
  await dbConnect();
  return TorqueMagazine.findById(id).lean();
}

// Get latest magazine
export async function getLatestMagazine(): Promise<ITorqueMagazine | null> {
  await dbConnect();
  return TorqueMagazine.findOne({ isLatest: true }).lean();
}

// Create new magazine (metadata only)
export async function createMagazine(magazine: Omit<ITorqueMagazine, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITorqueMagazine> {
  await dbConnect();
  if (magazine.isLatest) {
    await TorqueMagazine.updateMany({}, { isLatest: false });
  }
  const now = new Date().toISOString();
  const newMag = await TorqueMagazine.create({
    ...magazine,
    createdAt: now,
    updatedAt: now,
  });
  return newMag.toObject();
}

// Update existing magazine (metadata only)
export async function updateMagazine(id: string, updates: Partial<Omit<ITorqueMagazine, '_id' | 'createdAt'>>): Promise<ITorqueMagazine | null> {
  await dbConnect();
  if (updates.isLatest) {
    await TorqueMagazine.updateMany({}, { isLatest: false });
  }
  const updated = await TorqueMagazine.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date().toISOString() },
    { new: true }
  ).lean();
  return updated;
}

// Set latest magazine (unsets all others)
export async function setLatestMagazine(id: string): Promise<boolean> {
  await dbConnect();
  const mag = await TorqueMagazine.findById(id);
  if (!mag) return false;
  await TorqueMagazine.updateMany({}, { isLatest: false });
  mag.isLatest = true;
  mag.updatedAt = new Date().toISOString();
  await mag.save();
  return true;
}

// Delete magazine (delete file from Vercel Blob, remove from DB)
export async function deleteMagazine(id: string): Promise<boolean> {
  await dbConnect();
  const mag = await TorqueMagazine.findById(id);
  if (!mag) return false;
  try {
    if (mag.filePath) {
      await del(mag.filePath);
    }
  } catch (error) {
    console.warn(`Could not delete file '${mag.filePath}' from Vercel Blob:`, error);
  }
  await TorqueMagazine.findByIdAndDelete(id);
  return true;
}

// Generate magazine ID (not used with MongoDB _id, but kept for compatibility)
function generateMagazineId(year: string, title: string): string {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  const baseId = `torque-${year}-${safeTitle}`;
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseId}-${randomSuffix}`;
}

// Get magazines for public display
export async function getMagazinesForDisplay(): Promise<Array<{
  id: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  downloadUrl: string;
  viewUrl: string;
  coverPhoto?: string;
}>> {
  await dbConnect();
  const mags = await TorqueMagazine.find({}).sort({ year: -1 }).lean();
  return mags.map((mag) => ({
    id: mag._id.toString(),
    year: mag.year,
    title: mag.title,
    description: mag.description,
    pages: mag.pages,
    articles: mag.articles,
    featured: mag.featured,
    downloadUrl: mag.filePath,
    viewUrl: mag.filePath,
    coverPhoto: mag.coverPhoto,
  }));
}

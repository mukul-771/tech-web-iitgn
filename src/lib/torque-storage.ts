import { del } from '@vercel/blob';
import { dbConnect } from './mongodb';
import { TorqueMagazine, TorqueMagazineInput, TorqueMagazineData } from './torque-magazine.model';

// Get all magazines
export async function getAllMagazines(): Promise<Record<string, TorqueMagazineData>> {
  await dbConnect();
  const mags = (await TorqueMagazine.find({}).lean()) as unknown as TorqueMagazineData[];
  const result: Record<string, TorqueMagazineData> = {};
  mags.forEach((mag) => {
    result[String(mag._id)] = { ...mag, _id: String(mag._id) };
  });
  return result;
}

// Get single magazine by ID
export async function getMagazineById(id: string): Promise<TorqueMagazineData | null> {
  await dbConnect();
  const mag = (await TorqueMagazine.findById(id).lean()) as TorqueMagazineData | null;
  return mag ? { ...mag, _id: String(mag._id) } : null;
}

// Get latest magazine
export async function getLatestMagazine(): Promise<TorqueMagazineData | null> {
  await dbConnect();
  const mag = (await TorqueMagazine.findOne({ isLatest: true }).lean()) as TorqueMagazineData | null;
  return mag ? { ...mag, _id: String(mag._id) } : null;
}

// Create new magazine (metadata only)
export async function createMagazine(magazine: TorqueMagazineInput): Promise<TorqueMagazineData> {
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
  const obj = newMag.toObject() as TorqueMagazineData;
  return { ...obj, _id: String(obj._id) };
}

// Update existing magazine (metadata only)
export async function updateMagazine(id: string, updates: Partial<TorqueMagazineInput>): Promise<TorqueMagazineData | null> {
  await dbConnect();
  if (updates.isLatest) {
    await TorqueMagazine.updateMany({}, { isLatest: false });
  }
  const updated = (await TorqueMagazine.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date().toISOString() },
    { new: true }
  ).lean()) as TorqueMagazineData | null;
  return updated ? { ...updated, _id: String(updated._id) } : null;
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
  const mags = (await TorqueMagazine.find({}).sort({ year: -1 }).lean()) as unknown as TorqueMagazineData[];
  return mags.map((mag) => ({
    id: String(mag._id),
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

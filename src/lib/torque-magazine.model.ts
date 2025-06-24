import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ITorqueMagazine extends Document {
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  filePath: string;
  coverPhoto?: string;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

const TorqueMagazineSchema = new Schema<ITorqueMagazine>({
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  pages: { type: Number, required: true },
  articles: { type: Number, required: true },
  featured: { type: String, required: true },
  filePath: { type: String, required: true },
  coverPhoto: { type: String },
  isLatest: { type: Boolean, default: false },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const TorqueMagazine = models.TorqueMagazine || model<ITorqueMagazine>('TorqueMagazine', TorqueMagazineSchema);

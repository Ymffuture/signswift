// models/User.ts
import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  idNumber?: string;
  idImageUrl?: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String },
  email: { type: String, unique: true, index: true },
  passwordHash: { type: String },
  idNumber: { type: String },
  idImageUrl: { type: String },
}, { timestamps: true });

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

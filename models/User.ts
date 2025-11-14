// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  idNumber: string
  idImageUrl: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    idNumber: { type: String, required: true },
    idImageUrl: { type: String, required: true },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User

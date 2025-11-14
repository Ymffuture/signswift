// models/Contract.ts
import mongoose, { Document, Types } from 'mongoose';

export interface IContract extends Document {
  code: string;
  title: string;
  text: string;
  creator?: Types.ObjectId;
  creatorSnapshot?: Record<string, any>;
  creatorSignatureUrl?: string;
  signer?: Types.ObjectId;
  signerSnapshot?: Record<string, any>;
  signerSignatureUrl?: string;
  status: 'pending' | 'partially_signed' | 'signed';
  pdfUrl?: string;
  pdfHash?: string;
}

const ContractSchema = new mongoose.Schema<IContract>({
  code: { type: String, unique: true, index: true },
  title: String,
  text: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorSnapshot: Object,
  creatorSignatureUrl: String,
  signer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signerSnapshot: Object,
  signerSignatureUrl: String,
  status: { type: String, enum: ['pending', 'partially_signed', 'signed'], default: 'pending' },
  pdfUrl: String,
  pdfHash: String,
}, { timestamps: true });

export default (mongoose.models.Contract as mongoose.Model<IContract>) || mongoose.model<IContract>('Contract', ContractSchema);

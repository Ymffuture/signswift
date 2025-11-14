// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import UserModel from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setTokenCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  await dbConnect();
  const user = await UserModel.findOne({ email }).lean();
  if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, (user as any).passwordHash);
  if (!isMatch) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  setTokenCookie(res, token);
  return res.status(200).json({ ok: true, user: { id: user._id, name: user.name, email: user.email, idNumber: (user as any).idNumber, idImageUrl: (user as any).idImageUrl } });
}

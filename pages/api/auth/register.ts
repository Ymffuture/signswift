// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import UserModel from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, password, idNumber, idImageUrl } = req.body;
  await dbConnect();
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await UserModel.create({ name, email, passwordHash, idNumber, idImageUrl });
    return res.status(201).json({ ok: true, userId: user._id });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ ok: false, message: err.message });
  }
}

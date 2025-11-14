// pages/api/contracts/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import ContractModel from '../../../models/Contract';
import crypto from 'crypto';
import { getUserFromReq } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { title, text } = req.body;
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });
  await dbConnect();
  try {
    const code = crypto.randomBytes(3).toString('hex');
    const contract = await ContractModel.create({ code, title, text, creator: user._id });
    return res.status(201).json({ ok: true, contractId: contract._id, code });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ ok: false, message: err.message });
  }
}

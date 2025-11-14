// pages/api/contracts/get/[code].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../../lib/dbConnect';
import ContractModel from '../../../../models/Contract';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query as { code: string };
  await dbConnect();
  const contract = await ContractModel.findOne({ code }).populate('creator signer').lean();
  if (!contract) return res.status(404).json({ ok: false });
  return res.status(200).json({ ok: true, contract });
}

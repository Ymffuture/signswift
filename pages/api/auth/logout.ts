// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '../../../lib/auth';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  removeTokenCookie(res);
  return res.status(200).json({ ok: true });
}

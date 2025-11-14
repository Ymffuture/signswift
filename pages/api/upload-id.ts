// pages/api/upload-id.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../utils/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { dataUrl } = req.body;
    if (!dataUrl) return res.status(400).json({ ok: false, message: 'No dataUrl provided' });
    const result = await cloudinary.uploader.upload(dataUrl, { folder: 'ids', resource_type: 'image' });
    return res.status(200).json({ ok: true, url: result.secure_url });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

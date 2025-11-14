// pages/api/contracts/sign.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import ContractModel from '../../../models/Contract';
import { getUserFromReq } from '../../../lib/auth';
import cloudinary from '../../../utils/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { contractId, signatureDataUrl } = req.body;
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });
  await dbConnect();
  try {
    const contract = await ContractModel.findById(contractId);
    if (!contract) return res.status(404).json({ ok: false });
    const uploadRes = await cloudinary.uploader.upload(signatureDataUrl, { folder: 'signatures', resource_type: 'image' });
    if (!contract.creatorSignatureUrl && String(contract.creator) === String(user._id)) {
      contract.creatorSignatureUrl = uploadRes.secure_url;
      contract.creatorSnapshot = { name: user.name, idNumber: (user as any).idNumber, idImageUrl: (user as any).idImageUrl };
      contract.status = contract.signerSignatureUrl ? 'signed' : 'partially_signed';
    } else {
      contract.signer = user._id;
      contract.signerSignatureUrl = uploadRes.secure_url;
      contract.signerSnapshot = { name: user.name, idNumber: (user as any).idNumber, idImageUrl: (user as any).idImageUrl };
      contract.status = contract.creatorSignatureUrl ? 'signed' : 'partially_signed';
    }
    await contract.save();
    return res.status(200).json({ ok: true, contract });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ ok: false, message: err.message });
  }
}

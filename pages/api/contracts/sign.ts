// pages/api/contracts/sign.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import ContractModel from '../../../models/Contract';
import { getUserFromReq } from '../../../lib/auth';
import cloudinary from '../../../utils/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { contractId, signatureDataUrl } = req.body;

  try {
    // FIX 1: connect first
    await dbConnect();

    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const contract = await ContractModel.findById(contractId);
    if (!contract) return res.status(404).json({ ok: false, message: "Contract not found" });

    const isCreator = String(contract.creator) === String(user._id);
    const hasCreatorSigned = !!contract.creatorSignatureUrl;
    const hasSignerSigned = !!contract.signerSignatureUrl;

    const uploadRes = await cloudinary.uploader.upload(signatureDataUrl, {
      folder: 'signatures',
      resource_type: 'image'
    });

    // ------- SIGNING LOGIC -------
    if (isCreator) {
      if (hasCreatorSigned)
        return res.status(400).json({ ok: false, message: "Creator already signed" });

      contract.creatorSignatureUrl = uploadRes.secure_url;
      contract.creatorSnapshot = {
        name: user.name,
        idNumber: (user as any).idNumber,
        idImageUrl: (user as any).idImageUrl,
      };

    } else {
      if (hasSignerSigned)
        return res.status(400).json({ ok: false, message: "Signer already signed" });

      contract.signer = user._id;
      contract.signerSignatureUrl = uploadRes.secure_url;
      contract.signerSnapshot = {
        name: user.name,
        idNumber: (user as any).idNumber,
        idImageUrl: (user as any).idImageUrl,
      };
    }

    // Status update
    contract.status = contract.creatorSignatureUrl && contract.signerSignatureUrl
      ? "signed"
      : "partially_signed";

    await contract.save();

    return res.status(200).json({ ok: true, contract });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

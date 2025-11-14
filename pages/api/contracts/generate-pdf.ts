// pages/api/contracts/generate-pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../lib/dbConnect';
import ContractModel from '../../../models/Contract';
import { getUserFromReq } from '../../../lib/auth';
import crypto from 'crypto';
import cloudinary from '../../../utils/cloudinary';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { contractId } = req.body;
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false });
  await dbConnect();
  const contract = await ContractModel.findById(contractId).populate('creator signer').lean();
  if (!contract) return res.status(404).json({ ok: false });
  try {
    const html = `
      <html><head><meta charset="utf-8"><style>body{font-family:Arial,Helvetica,sans-serif;padding:24px} .sig{width:240px}</style></head>
      <body>
        <h1>${escapeHtml(contract.title)}</h1>
        <pre>${escapeHtml(contract.text)}</pre>
        <h3>Creator</h3>
        <div>Name: ${escapeHtml(contract.creatorSnapshot?.name || '')}</div>
        <div>ID: ${escapeHtml(contract.creatorSnapshot?.idNumber || '')}</div>
        ${contract.creatorSignatureUrl ? `<img class="sig" src="${contract.creatorSignatureUrl}" />` : ''}
        <h3>Signer</h3>
        <div>Name: ${escapeHtml(contract.signerSnapshot?.name || contract.signer?.name || '')}</div>
        <div>ID: ${escapeHtml(contract.signerSnapshot?.idNumber || '')}</div>
        ${contract.signerSignatureUrl ? `<img class="sig" src="${contract.signerSignatureUrl}" />` : ''}
      </body></html>
    `;

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'contracts', resource_type: 'raw', public_id: `contract-${contract.code}` }, (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(pdfBuffer);
    });

    await dbConnect();
    await ContractModel.findByIdAndUpdate(contractId, { pdfUrl: uploadResult.secure_url, pdfHash: hash });

    return res.status(200).json({ ok: true, pdfUrl: uploadResult.secure_url, hash });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

function escapeHtml(str = '') { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// pages/contract/[code].tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from '../../lib/axiosClient';
import SignPad from '../../components/SignPad';

export default function ContractPage() {
  const [contract,setContract]=useState<any>(null);
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const code = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  useEffect(()=>{ fetchContract(); }, []);
  const fetchContract = async () => { try { const resp = await axios.get('/api/contracts/get/' + code); setContract(resp.data.contract); } catch (err) { console.error(err); } };

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;
    try { const resp = await axios.post('/api/auth/login',{ email,password }); setCurrentUser(resp.data.user); alert('Logged in'); } catch (err: any) { alert(err?.response?.data?.message||err.message); }
  };

  const handleSaveSignature = async (dataUrl: string | null) => {
    if (!dataUrl) return alert('Please sign');
    setLoading(true);
    try {
      const resp = await axios.post('/api/contracts/sign',{ contractId: contract._id, signatureDataUrl: dataUrl });
      setContract(resp.data.contract);
      alert('Signed');
    } catch (err: any) { alert(err?.response?.data?.message||err.message); }
    setLoading(false);
  };

  const generateServerPdf = async () => {
    try {
      const resp = await axios.post('/api/contracts/generate-pdf',{ contractId: contract._id });
      alert('PDF generated: ' + resp.data.pdfUrl + '\nHash: ' + resp.data.hash);
    } catch (err: any) { alert(err?.response?.data?.message||err.message); }
  };

  if (!contract) return <div className="p-8">Loading...</div>;
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold">{contract.title}</h1>
      <div className="mt-4 p-6 bg-white border rounded shadow">
        <div className="mb-4"><strong>Contract code:</strong> {contract.code}</div>
        <div className="mb-4 whitespace-pre-wrap">{contract.text}</div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Creator</h3>
            <div>Name: {contract.creator?.name}</div>
            <div>ID: {contract.creatorSnapshot?.idNumber || contract.creator?.idNumber}</div>
            { (contract.creatorSnapshot?.idImageUrl || contract.creator?.idImageUrl) && <img src={contract.creatorSnapshot?.idImageUrl || contract.creator?.idImageUrl} alt="ID" className="mt-2 w-40" /> }
            <div className="mt-2">Signature:</div>
            {contract.creatorSignatureUrl ? <img src={contract.creatorSignatureUrl} className="w-48 mt-2" /> : <div className="text-sm text-gray-500">Not signed</div>}
          </div>
          <div>
            <h3 className="font-medium">Signer</h3>
            <div>Name: {contract.signerSnapshot?.name || contract.signer?.name || '-'}</div>
            <div>ID: {contract.signerSnapshot?.idNumber || contract.signer?.idNumber || '-'}</div>
            { (contract.signerSnapshot?.idImageUrl || contract.signer?.idImageUrl) && <img src={contract.signerSnapshot?.idImageUrl || contract.signer?.idImageUrl} alt="ID" className="mt-2 w-40" /> }
            <div className="mt-2">Signature:</div>
            {contract.signerSignatureUrl ? <img src={contract.signerSignatureUrl} className="w-48 mt-2" /> : <div className="text-sm text-gray-500">Not signed</div>}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <form onSubmit={login} className="flex gap-2">
            <input name="email" placeholder="Email" className="p-2 border rounded" />
            <input name="password" placeholder="Password" type="password" className="p-2 border rounded" />
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Login</button>
          </form>
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Sign this contract</h4>
          <SignPad onSave={handleSaveSignature} />
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={generateServerPdf} className="px-4 py-2 bg-green-600 text-white rounded">Generate Signed PDF (server)</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-600 text-white rounded">Print (browser)</button>
        </div>
      </div>
    </div>
  );
}

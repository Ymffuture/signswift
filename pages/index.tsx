// pages/index.tsx
import React, { useState } from 'react';
import axios from '../lib/axiosClient';
import UploadId from '../components/UploadId';

export default function Home() {
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [idNumber,setIdNumber]=useState('');
  const [idImageUrl,setIdImageUrl]=useState('');
  const [code,setCode]=useState('');

  const register = async () => {
    try {
      await axios.post('/api/auth/register',{ name,email,password,idNumber,idImageUrl });
      alert('Registered. Please login.');
    } catch (err: any) { alert(err?.response?.data?.message||err.message); }
  };
  const login = async () => {
    try {
      await axios.post('/api/auth/login',{ email,password });
      alert('Logged in');
    } catch (err: any) { alert(err?.response?.data?.message||err.message); }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Contract Sign Demo (secure)</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Register</h2>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded mb-2" />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded mb-2" />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 border rounded mb-2" />
          <input value={idNumber} onChange={e=>setIdNumber(e.target.value)} placeholder="ID number" className="w-full p-2 border rounded mb-2" />
          <label className="block mb-2">Upload ID image:</label>
          <UploadId onUploaded={(url)=>setIdImageUrl(url)} />
          {idImageUrl && <img src={idImageUrl} className="mt-2 w-40" alt="ID" />}
          <button onClick={register} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">Register</button>
        </div>
        <div>
          <h2 className="font-semibold">Login & Create Contract</h2>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded mb-2" />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 border rounded mb-2" />
          <button onClick={login} className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
          <div className="mt-4">
            <h3 className="font-medium">Create Contract (after login)</h3>
            <CreateContract setCode={setCode} />
            <div className="mt-4">
              <label>Access Contract with code:</label>
              <input value={code} onChange={e=>setCode(e.target.value)} className="w-full p-2 border rounded" />
              <a href={`/contract/${code}`} className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded">Open contract</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateContract({ setCode }: { setCode: (c: string) => void }) {
  const [title,setTitle]=React.useState('Agreement');
  const [text,setText]=React.useState('This is the agreement text...');
  const create = async () => {
    try {
      const resp = await axios.post('/api/contracts/create',{ title,text });
      setCode(resp.data.code);
      alert('Contract created: ' + resp.data.code);
    } catch (err: any) { alert(err?.response?.data?.message||err.message); }
  };
  return (
    <div className="mt-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded mb-2" />
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-2 border rounded h-24" />
      <button onClick={create} className="mt-2 px-3 py-1 bg-purple-600 text-white rounded">Create</button>
    </div>
  );
}

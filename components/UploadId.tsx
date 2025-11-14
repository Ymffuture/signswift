// components/UploadId.tsx
import React, { useState } from 'react';
import axios from 'axios';

type Props = { onUploaded: (url: string) => void };

export default function UploadId({ onUploaded }: Props) {
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setLoading(true);
      try {
        const dataUrl = reader.result;
        const resp = await axios.post('/api/upload-id', { dataUrl });
        onUploaded(resp.data.url);
      } catch (err: any) {
        alert(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handle} />
      {loading && <div>Uploading...</div>}
    </div>
  );
}

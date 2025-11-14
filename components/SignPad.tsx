// components/SignPad.tsx
import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

type Props = { onSave: (dataUrl: string | null) => void; height?: number };

export default function SignPad({ onSave, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = (canvas.offsetWidth || 400) * ratio;
    canvas.height = height * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    const pad = new SignaturePad(canvas, { backgroundColor: 'rgba(255,255,255,0)', penColor: 'black' });
    padRef.current = pad;
    return () => pad.off && pad.off();
  }, [height]);

  const clear = () => padRef.current?.clear();
  const save = () => {
    if (!padRef.current || padRef.current.isEmpty()) return onSave(null);
    onSave(padRef.current.toDataURL('image/png'));
  };

  return (
    <div className="border rounded p-2 bg-white">
      <div style={{ height }} className="w-full">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={clear} className="px-3 py-1 bg-gray-200 rounded">Clear</button>
        <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
      </div>
    </div>
  );
}

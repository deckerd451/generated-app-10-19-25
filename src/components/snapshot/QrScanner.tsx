import React from 'react';
import { Scanner as ReactQrScanner } from '@yudiel/react-qr-scanner';
interface QrScannerProps {
  onScan: (result: string) => void;
  onError: (error: any) => void;
}
export const QrScanner: React.FC<QrScannerProps> = ({ onScan, onError }) => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square overflow-hidden rounded-lg bg-black">
      <ReactQrScanner
        onResult={(result) => onScan(result.getText())}
        onError={onError}
        containerStyle={{ width: '100%', height: '100%', paddingTop: '0' }}
        videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1.5 rounded-lg text-center pointer-events-none">
        Point camera at a CYNQ Snapshot
      </div>
    </div>
  );
};
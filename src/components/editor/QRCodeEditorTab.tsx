import React from 'react';
import { QrCode } from 'lucide-react';
import type { FlyerContent } from '../../types';

interface QRCodeEditorTabProps {
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function QRCodeEditorTab({ content, onChangeContent }: QRCodeEditorTabProps) {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#0D4D5E]" />
          QR Code Dinamico
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Genera un QR code personalizzato per reindirizzare i clienti all'offerta online.
        </p>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900">Attiva QR Code nel Flyer</label>
          <input
            type="checkbox"
            checked={content.qrCode.enabled}
            onChange={(e) => onChangeContent({
              qrCode: { ...content.qrCode, enabled: e.target.checked },
            })}
            className="w-4 h-4 accent-[#0D4D5E] rounded cursor-pointer"
          />
        </div>

        {content.qrCode.enabled && (
          <>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Link / URL dell'Offerta</label>
              <input
                type="text"
                value={content.qrCode.url}
                onChange={(e) => onChangeContent({
                  qrCode: { ...content.qrCode, url: e.target.value },
                })}
                placeholder="https://www.dolomitinordicski.com/offerta"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Etichetta Sotto QR Code</label>
              <input
                type="text"
                value={content.qrCode.label}
                onChange={(e) => onChangeContent({
                  qrCode: { ...content.qrCode, label: e.target.value },
                })}
                placeholder="Scansiona per prenotare"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

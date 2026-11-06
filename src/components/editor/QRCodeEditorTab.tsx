import React from 'react';
import { QrCode } from 'lucide-react';
import type { FlyerContent } from '../../types';

interface QRCodeEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function QRCodeEditorTab({ uiLanguage, content, onChangeContent }: QRCodeEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#0D4D5E]" />
          {ui('QR-Code', 'Codice QR')}
        </h3>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-900">{ui('QR-Code im Flyer anzeigen', 'Mostra codice QR nel flyer')}</label>
          <input
            type="checkbox"
            checked={content.qrCode?.enabled === true}
            onChange={(e) => onChangeContent({
              qrCode: { enabled: e.target.checked, url: content.qrCode?.url ?? '', label: content.qrCode?.label ?? '', fgColor: content.qrCode?.fgColor ?? '#0D4D5E', bgColor: content.qrCode?.bgColor ?? '#FFFFFF', centerLogo: content.qrCode?.centerLogo ?? 'none', position: content.qrCode?.position ?? 'bottom_right' },
            })}
            className="w-4 h-4 accent-[#0D4D5E] rounded cursor-pointer"
          />
        </div>

        {content.qrCode?.enabled && (
          <>
            <div>
              <label className="block text-slate-700 font-bold mb-1">{ui('Zieladresse (URL)', 'Indirizzo di destinazione (URL)')}</label>
              <input
                type="text"
                value={content.qrCode?.url ?? ''}
                onChange={(e) => onChangeContent({
                  qrCode: { ...content.qrCode!, url: e.target.value },
                })}
                placeholder="https://www.dolomitinordicski.com/offerta"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">{ui('Beschriftung unter dem QR-Code', 'Didascalia sotto il codice QR')}</label>
              <input
                type="text"
                value={content.qrCode?.label ?? ''}
                onChange={(e) => onChangeContent({
                  qrCode: { ...content.qrCode!, label: e.target.value },
                })}
                placeholder={ui("Scannen für weitere Informationen", "Scansiona per maggiori informazioni")}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

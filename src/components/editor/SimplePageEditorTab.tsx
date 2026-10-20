import React from 'react';
import { WandSparkles } from 'lucide-react';
import type { FlyerContent } from '../../types';
import type { FlyerProductDefinition } from '../../model/flyerProductModel';

interface SimplePageEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  product?: FlyerProductDefinition;
  onChangeFormat?: (format: FlyerContent['format']) => void;
  onToggleOrientation?: () => void;
  onMakeItPerfect?: () => void;
}

export function SimplePageEditorTab({
  uiLanguage, content, product, onChangeContent, onChangeFormat, onToggleOrientation, onMakeItPerfect,
}: SimplePageEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam">{ui('Seitenformat & Layout', 'Formato e impaginazione')}</h3>
        <p className="text-xs text-slate-500">{ui('Nur vom DNS-Modell freigegebene Optionen.', 'Solo le opzioni ammesse dal modello DNS.')}</p>
      </div>
      {product && (
        <>
          <div className="flex gap-2">
            {product.pagePolicy.formats.map(format => (
              <button key={format} type="button" onClick={() => onChangeFormat?.(format)}
                aria-pressed={content.format === format}
                className={`flex-1 border px-2 py-2 text-xs font-bold rounded ${content.format === format ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]' : 'bg-white text-slate-700 border-slate-200'}`}>
                {format}
              </button>
            ))}
          </div>
          {product.pagePolicy.orientations.length > 1 && (
            <div className="flex gap-2">
              {product.pagePolicy.orientations.map(orientation => (
                <button key={orientation} type="button"
                  onClick={() => { if (content.orientation !== orientation) onToggleOrientation?.(); }}
                  aria-pressed={content.orientation === orientation}
                  className={`flex-1 border px-2 py-2 text-xs font-semibold rounded ${content.orientation === orientation ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]' : 'bg-white text-slate-700 border-slate-200'}`}>
                  {orientation === 'portrait' ? ui('Hochformat', 'Verticale') : ui('Querformat', 'Orizzontale')}
                </button>
              ))}
            </div>
          )}
          {product.type === 'dns_price_list' && (
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-[#0D4D5E]">{ui('Grafikelement · Langläufer', 'Elemento grafico · Sciatore')}</h4>
              <p className="text-[11px] text-slate-500">{ui('Position des optionalen DNS-Langläufers.', 'Posizione dello sciatore DNS opzionale.')}</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['none', ui('Ausblenden', 'Nascondi')],
                  ['top_left', ui('Oben links', 'Alto sinistra')],
                  ['top_right', ui('Oben rechts', 'Alto destra')],
                  ['bottom_left', ui('Unten links', 'Basso sinistra')],
                  ['bottom_right', ui('Unten rechts', 'Basso destra')],
                ] as const).map(([position, label]) => (
                  <button key={position} type="button" aria-pressed={(content.dnsSkierCorner ?? 'none') === position}
                    onClick={() => onChangeContent({ dnsSkierCorner: position })}
                    className={`border rounded px-2 py-2 text-[11px] font-bold ${(content.dnsSkierCorner ?? 'none') === position ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.pagePolicy.magicLayout && (
            <button type="button" onClick={onMakeItPerfect} disabled={!onMakeItPerfect}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0D4D5E] text-white rounded px-3 py-2.5 text-xs font-bold disabled:opacity-50">
              <WandSparkles className="w-4 h-4" /> Make It Perfect
            </button>
          )}
        </>
      )}
    </section>
  );
}

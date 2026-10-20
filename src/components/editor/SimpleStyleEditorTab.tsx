import React from 'react';
import type { FlyerContent } from '../../types';
import type { FlyerProductDefinition } from '../../model/flyerProductModel';
import { WandSparkles } from 'lucide-react';

interface SimpleStyleEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  product?: FlyerProductDefinition;
  onChangeFormat?: (format: FlyerContent['format']) => void;
  onToggleOrientation?: () => void;
  onMakeItPerfect?: () => void;
}

export function SimpleStyleEditorTab({ uiLanguage, content, onChangeContent, product, onChangeFormat, onToggleOrientation, onMakeItPerfect }: SimpleStyleEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam">{ui('Farben', 'Colori')}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {ui(
            'Der Layoutstil ist festgelegt. Du kannst nur die freigegebenen Farbakzente anpassen.',
            'Lo stile del layout è fisso. Puoi modificare solo i colori consentiti.'
          )}
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{ui('Hauptfarbe', 'Colore principale')}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.customPrimaryColor || '#0D4D5E'}
            onChange={e => onChangeContent({ customPrimaryColor: e.target.value })}
            className="w-12 h-9 rounded border border-slate-200 bg-white"
          />
          <input
            value={content.customPrimaryColor || '#0D4D5E'}
            onChange={e => onChangeContent({ customPrimaryColor: e.target.value })}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
          />
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{ui('Akzentfarbe', 'Colore accento')}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.customAccentColor || '#AAD0D1'}
            onChange={e => onChangeContent({ customAccentColor: e.target.value })}
            className="w-12 h-9 rounded border border-slate-200 bg-white"
          />
          <input
            value={content.customAccentColor || '#AAD0D1'}
            onChange={e => onChangeContent({ customAccentColor: e.target.value })}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
          />
        </div>
      </label>

      {product && (
        <section className="border-t border-slate-200 pt-4 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{ui('Seitenformat & Layout', 'Formato e impaginazione')}</h3>
            <p className="text-xs text-slate-500">{ui('Nur vom DNS-Modell freigegebene Optionen.', 'Solo le opzioni ammesse dal modello DNS.')}</p>
          </div>
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
          {product.pagePolicy.magicLayout && (
            <button type="button" onClick={onMakeItPerfect} disabled={!onMakeItPerfect}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0D4D5E] text-white rounded px-3 py-2.5 text-xs font-bold disabled:opacity-50">
              <WandSparkles className="w-4 h-4" /> Make It Perfect
            </button>
          )}
        </section>
      )}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
        {ui('Layout, Blöcke und Grafikstil werden vom DNS-Template gesteuert.', 'Layout, blocchi e stile grafico sono gestiti dal template DNS.')}
      </div>
    </div>
  );
}

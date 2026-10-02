import React from 'react';
import type { FlyerContent } from '../../types';

interface SimpleStyleEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function SimpleStyleEditorTab({ uiLanguage, content, onChangeContent }: SimpleStyleEditorTabProps) {
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

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
        {ui('Layout, Blöcke und Grafikstil werden vom DNS-Template gesteuert.', 'Layout, blocchi e stile grafico sono gestiti dal template DNS.')}
      </div>
    </div>
  );
}

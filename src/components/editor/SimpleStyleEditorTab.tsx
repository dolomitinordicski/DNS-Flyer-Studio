import React from 'react';
import type { BrandColorScheme, FlyerContent } from '../../types';

interface SimpleStyleEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

/** Three approved DNS identity colors: change the presentation preset, never individual HEX values. */
const DNS_PRESETS: { id: BrandColorScheme; color: string; label: string }[] = [
  { id: 'frosted_ice', color: '#0D4D5E', label: 'Frosted Ice' },
  { id: 'nordic_sky', color: '#417483', label: 'Nordic Sky' },
  { id: 'deep_glacier', color: '#AAD0D1', label: 'Deep Glacier' },
];

export function SimpleStyleEditorTab({ uiLanguage, content, onChangeContent }: SimpleStyleEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const active = DNS_PRESETS.some(p => p.id === content.themeColor) ? content.themeColor : 'frosted_ice';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 font-vietnam">{ui('DNS-Farbvarianten', 'Varianti colori DNS')}</h3>
      <div className="grid grid-cols-1 gap-2">
        {DNS_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={active === preset.id}
            onClick={() => onChangeContent({ themeColor: preset.id, customColors: undefined, customPrimaryColor: '', customAccentColor: '' })}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${active === preset.id ? 'border-[#0D4D5E] bg-[#EDF5F5] ring-1 ring-[#0D4D5E]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
          >
            <span className="h-9 w-9 rounded-md border border-slate-200 shrink-0" style={{ backgroundColor: preset.color }} />
            <span className="flex-1 font-semibold text-xs text-slate-900">{preset.label}</span>
            <span className="text-[10px] font-mono text-slate-500">{preset.color}</span>
            {active === preset.id && <span className="font-bold text-[#0D4D5E]">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Check, MapPin, ShieldCheck, Upload } from 'lucide-react';
import type { FlyerContent } from '../../types';
import { REGIONAL_LOGOS } from '../../data/regionalLogos';
import { OFFICIAL_ASSET_PATHS } from '../CorporateVectors';

interface RegionEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function RegionEditorTab({ uiLanguage, content, onChangeContent }: RegionEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0D4D5E]" />
          Regione & Partner Dolomiti NordicSki
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Seleziona la regione o il consorzio turistico che pubblica la locandina.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {REGIONAL_LOGOS.map((reg) => {
          const isSelectedRegion = content.regionId === reg.id;
          const activeLogoOpt = reg.logos?.find(l => l.id === (content.selectedRegionLogoId || reg.logos?.[0]?.id)) || reg.logos?.[0];
          const activeSrc = isSelectedRegion && activeLogoOpt
            ? (activeLogoOpt.logoWhiteSrc || activeLogoOpt.logoSrc)
            : (reg.logoWhiteSrc || reg.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe);
          const activeSecondarySrc = isSelectedRegion && activeLogoOpt
            ? (activeLogoOpt.secondaryLogoWhiteSrc || activeLogoOpt.secondaryLogoSrc)
            : (reg.secondaryLogoWhiteSrc || reg.secondaryLogoSrc);

          return (
            <div
              key={reg.id}
              onClick={() => {
                if (!isSelectedRegion) {
                  onChangeContent({
                    regionId: reg.id,
                    selectedRegionLogoId: reg.logos?.[0]?.id || 'primary',
                  });
                }
              }}
              className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                isSelectedRegion
                  ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg flex items-center justify-center shrink-0 min-w-[60px] h-9 bg-white border border-slate-200 shadow-2xs gap-1">
                    <img src={activeSrc} alt={reg.name} className="h-6 w-auto max-w-[80px] object-contain shrink-0" />
                    {activeSecondarySrc && (
                      <img src={activeSecondarySrc} alt={`${reg.name} Secondary`} className="h-6 w-auto max-w-[80px] object-contain shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className={`font-bold text-xs font-vietnam ${isSelectedRegion ? 'text-white' : 'text-slate-900'}`}>{reg.name}</div>
                    <div className={`text-[10px] ${isSelectedRegion ? 'text-slate-200' : 'text-slate-500'}`}>{reg.subTitle}</div>
                  </div>
                </div>
                {isSelectedRegion && <Check className="w-4 h-4 text-[#AAD0D1] shrink-0" />}
              </div>

              {isSelectedRegion && reg.logos && reg.logos.length > 1 && (
                <div className="mt-1 pt-2.5 border-t border-white/20 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider font-vietnam">
                    Scegli Opzione Logo Regionale:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {reg.logos.map((logoOpt) => {
                      const isSelectedLogo = (content.selectedRegionLogoId || reg.logos![0].id) === logoOpt.id;
                      return (
                        <button
                          key={logoOpt.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeContent({ selectedRegionLogoId: logoOpt.id });
                          }}
                          className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                            isSelectedLogo
                              ? 'bg-white text-[#0D4D5E] border-white shadow-sm font-bold ring-2 ring-white/50'
                              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                          }`}
                        >
                          <div className={`p-1 rounded flex items-center justify-center shrink-0 h-8 ${isSelectedLogo ? 'bg-slate-100' : 'bg-white/90'}`}>
                            <img src={logoOpt.logoSrc} alt={logoOpt.name} className="h-6 w-auto max-w-full object-contain" />
                            {logoOpt.secondaryLogoSrc && (
                              <img src={logoOpt.secondaryLogoSrc} alt={`${logoOpt.name} Secondary`} className="h-6 w-auto max-w-full object-contain ml-1" />
                            )}
                          </div>
                          <span className="text-[10px] leading-tight font-vietnam">{logoOpt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="block text-slate-900 font-bold text-xs font-vietnam">
            Logo Regionale Personalizzato (PNG / Immagine)
          </label>
          {content.customRegionalLogoUrl && (
            <button type="button" onClick={() => onChangeContent({ customRegionalLogoUrl: undefined })} className="text-[10px] text-red-600 hover:underline font-bold">
              Reset Logo Predefinito
            </button>
          )}
        </div>
        <p className="text-[10.5px] text-slate-500 leading-snug">
          Se il logo della regione non è in formato vettoriale SVG, puoi caricare o incollare un'immagine normale in formato <strong>PNG o JPG</strong>.
        </p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={content.customRegionalLogoUrl || ''}
            onChange={(e) => onChangeContent({ customRegionalLogoUrl: e.target.value })}
            placeholder="https://.../logo.png o carica file"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#0D4D5E]"
          />
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/png, image/jpeg, image/svg+xml, image/webp';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                  if (readerEvent.target?.result) {
                    onChangeContent({ customRegionalLogoUrl: readerEvent.target.result as string });
                  }
                };
                reader.readAsDataURL(file);
              };
              input.click();
            }}
            className="px-3 py-1.5 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-lg text-[10.5px] font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#AAD0D1]" />
            <span>{ui('Laden', 'Carica')} PNG</span>
          </button>
        </div>
        {content.customRegionalLogoUrl && (
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
              <img src={content.customRegionalLogoUrl} alt="Logo Regionale Personalizzato" className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">Logo PNG Personalizzato Attivo</span>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="font-bold text-slate-800 text-xs font-vietnam flex items-center justify-between">
          <span>Grandezza Logo Regionale</span>
          <span className="text-[#0D4D5E] font-extrabold">{content.regionalLogoScale || 100}%</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="60"
            max="180"
            step="5"
            value={content.regionalLogoScale || 100}
            onChange={(e) => onChangeContent({ regionalLogoScale: parseInt(e.target.value, 10) })}
            className="flex-1 accent-[#0D4D5E] cursor-pointer"
          />
          <div className="flex items-center gap-1">
            {[75, 100, 125, 150].map((scaleVal) => (
              <button
                key={scaleVal}
                type="button"
                onClick={() => onChangeContent({ regionalLogoScale: scaleVal })}
                className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                  (content.regionalLogoScale || 100) === scaleVal
                    ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {scaleVal}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
        <label className="block text-slate-800 font-bold text-xs font-vietnam">Sfondo Contenitore / Badge Logo Regionale</label>
        <p className="text-[10.5px] text-slate-500 leading-snug">
          Scegli se applicare uno sfondo scuro, chiaro o trasparente al badge del logo.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'auto', label: 'Automatico', sub: 'Scuro nei temi scuri' },
            { id: 'dark', label: 'Scuro', sub: 'Sfondo scuro' },
            { id: 'light', label: 'Chiaro', sub: 'Sfondo bianco' },
            { id: 'none', label: 'Nessuno', sub: 'Trasparente' },
          ].map((opt) => {
            const isSelected = (content.logoBadgeBgStyle || 'auto') === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeContent({ logoBadgeBgStyle: opt.id as FlyerContent['logoBadgeBgStyle'] })}
                className={`p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px] font-vietnam">{opt.label}</div>
                <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{opt.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
        <label className="block text-slate-800 font-bold text-xs font-vietnam">Posizione Logo Generale Dolomiti NordicSki</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'header', label: 'In Alto (Header)', sub: 'In testata con logo regionale' },
            { id: 'footer_left', label: 'In Basso a Sinistra', sub: 'Nel footer in basso' },
            { id: 'hidden', label: 'Nascosto', sub: 'Rimuovi logo DNS' },
          ].map((pos) => {
            const isSelected = (content.dnsLogoPlacement || 'header') === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => onChangeContent({ dnsLogoPlacement: pos.id as FlyerContent['dnsLogoPlacement'] })}
                className={`p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-[11px] font-vietnam">{pos.label}</div>
                <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{pos.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs">
        <div className="font-bold text-[#0D4D5E] font-vietnam flex items-center gap-1.5 mb-0.5">
          <ShieldCheck className="w-4 h-4 text-[#0D4D5E]" />
          Loghi Ufficiali Dolomiti NordicSki
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Tutte le 8 regioni utilizzano il logo e l'emblema ufficiale Dolomiti NordicSki (Langläufer & Kurve).
        </p>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-slate-700 font-bold">Nome Personalizzato Regione (Opzionale)</label>
        <input
          type="text"
          value={content.customRegionName || ''}
          onChange={(e) => onChangeContent({ customRegionName: e.target.value })}
          placeholder="Lascia vuoto per usare il nome standard"
          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
        />
      </div>
    </div>
  );
}

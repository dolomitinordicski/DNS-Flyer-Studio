import React from 'react';
import {
  Cloud,
  Image as ImageIcon,
  Layout,
  LayoutTemplate,
  MapPin,
  Palette,
  QrCode,
  Sparkles,
  Type,
  Dumbbell,
} from 'lucide-react';

export type LegacyEditorTabId =
  | 'templates'
  | 'style_variant'
  | 'graphic_elements'
  | 'content'
  | 'region'
  | 'images'
  | 'style'
  | 'icons'
  | 'qr';

interface LegacyEditorChromeProps {
  uiLanguage: 'de' | 'it';
  activeTab: LegacyEditorTabId;
  onTabChange: (tab: LegacyEditorTabId) => void;
  onOpenSavedDesignsModal: () => void;
  onMakeItPerfect?: () => void;
  onExitLegacy?: () => void;
}

export function LegacyEditorChrome({
  uiLanguage,
  activeTab,
  onTabChange,
  onOpenSavedDesignsModal,
  onMakeItPerfect,
  onExitLegacy,
}: LegacyEditorChromeProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const tabs = [
    { id: 'templates' as const, label: ui('Vorlagen', 'Modelli'), icon: LayoutTemplate },
    { id: 'style_variant' as const, label: ui('Layout', 'Stile'), icon: Layout },
    { id: 'graphic_elements' as const, label: ui('Grafikelemente', 'Elementi grafici'), icon: Sparkles },
    { id: 'content' as const, label: ui('Texte', 'Testi'), icon: Type },
    { id: 'region' as const, label: ui('Gebiet', 'Regione'), icon: MapPin },
    { id: 'images' as const, label: ui('Bilder', 'Immagini'), icon: ImageIcon },
    { id: 'style' as const, label: ui('Farben', 'Colori'), icon: Palette },
    { id: 'icons' as const, label: ui('Icons', 'Icone'), icon: Dumbbell },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode },
  ];

  return (
    <>
      <div className="bg-[#0D4D5E] px-3.5 py-2 text-white flex flex-col gap-2 border-b border-[#0D4D5E]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#AAD0D1] animate-pulse" />
            <span className="text-xs font-bold font-vietnam">Legacy Studio · Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            {onExitLegacy && (
              <button
                type="button"
                onClick={onExitLegacy}
                className="px-2.5 py-1 bg-[#AAD0D1] text-slate-950 rounded-lg text-[10px] font-black"
              >
                {ui('ZURÜCK', 'SEMPLICE')}
              </button>
            )}
            <button
              onClick={onOpenSavedDesignsModal}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>{ui('Gespeicherte Designs', 'Design Salvati')}</span>
              <span className="bg-[#AAD0D1] text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
                Legacy
              </span>
            </button>
          </div>
        </div>

        {onMakeItPerfect && (
          <button
            onClick={onMakeItPerfect}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all border border-amber-300 transform active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>{ui('LAYOUT OPTIMIEREN', 'PERFEZIONA GRAFICA')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 bg-[#F4F9FA] p-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                isActive
                  ? 'bg-[#0D4D5E] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#AAD0D1]' : 'text-[#0D4D5E]'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

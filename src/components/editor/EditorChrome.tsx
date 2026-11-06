import React from 'react';
import {
  Cloud,
  Image as ImageIcon,
  LayoutTemplate,
  PanelLeftClose,
  PanelsTopLeft,
  Palette,
  QrCode,
  Type,
} from 'lucide-react';

export type EditorTabId =
  | 'templates'
  | 'content'
  | 'images'
  | 'style'
  | 'layout'
  | 'qr';

interface EditorChromeProps {
  uiLanguage: 'de' | 'it';
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
  readOnly?: boolean;
  disableImageTab?: boolean;
  onCollapse: () => void;
}

export function EditorChrome({
  uiLanguage,
  activeTab,
  onTabChange,
  readOnly = false,
  disableImageTab = false,
  onCollapse,
}: EditorChromeProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const tabs = [
    { id: 'templates' as const, label: ui('Flyer', 'Flyer'), icon: LayoutTemplate },
    { id: 'content' as const, label: ui('Inhalte', 'Contenuti'), icon: Type },
    { id: 'images' as const, label: ui('Bild', 'Immagine'), icon: ImageIcon },
    { id: 'style' as const, label: ui('Farben', 'Colori'), icon: Palette },
    { id: 'layout' as const, label: 'Layout', icon: PanelsTopLeft },
    { id: 'qr' as const, label: 'QR', icon: QrCode },
  ];

  return (
    <>
      <div className="bg-[#0D4D5E] px-3.5 py-2 text-white flex items-center justify-between border-b border-[#0D4D5E]/80">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-[#AAD0D1]" />
          <div>
            <div className="text-xs font-bold font-vietnam">DNS Core · Flyer Studio</div>
            <div className="text-[9px] text-white/60">
              {ui('Kontrollierter Editor', 'Editor controllato')}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          aria-label={ui('Editor ausblenden', 'Nascondi pannello editor')}
          title={ui('Editor ausblenden', 'Nascondi pannello editor')}
          aria-expanded="true"
          className="group relative ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-[#D9EFF0] shadow-sm transition-colors hover:border-white/55 hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <PanelLeftClose aria-hidden="true" className="h-[19px] w-[19px]" />
        </button>
      </div>

      <div className={`grid ${readOnly ? 'grid-cols-1' : 'grid-cols-6'} gap-1 bg-[#F4F9FA] p-2 border-b border-slate-200`}>
        {tabs.filter(tab => !readOnly || tab.id === 'templates').map((tab) => {
          const Icon = tab.icon;
          const disabled = tab.id === 'images' && disableImageTab;
          const isActive = !disabled && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => { if (!disabled) onTabChange(tab.id); }}
              disabled={disabled}
              title={disabled ? ui("Für Ticketmodelle nicht verfügbar", "Non disponibile per i biglietti") : undefined}
              className={`flex flex-col items-center justify-center gap-1 px-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                disabled
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-55'
                  : isActive
                    ? 'bg-[#0D4D5E] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${disabled ? 'text-slate-400' : isActive ? 'text-[#AAD0D1]' : 'text-[#0D4D5E]'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

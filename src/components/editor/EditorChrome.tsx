import React from 'react';
import {
  Cloud,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  QrCode,
  Type,
} from 'lucide-react';

export type EditorTabId =
  | 'templates'
  | 'content'
  | 'images'
  | 'style'
  | 'qr';

interface EditorChromeProps {
  uiLanguage: 'de' | 'it';
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
  onOpenSavedDesignsModal: () => void;
}

export function EditorChrome({
  uiLanguage,
  activeTab,
  onTabChange,
  onOpenSavedDesignsModal,
}: EditorChromeProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const tabs = [
    { id: 'templates' as const, label: ui('Flyer', 'Flyer'), icon: LayoutTemplate },
    { id: 'content' as const, label: ui('Inhalte', 'Contenuti'), icon: Type },
    { id: 'images' as const, label: ui('Bild', 'Immagine'), icon: ImageIcon },
    { id: 'style' as const, label: ui('Farben', 'Colori'), icon: Palette },
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
          onClick={onOpenSavedDesignsModal}
          className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold text-white border border-white/20 transition-all"
        >
          {ui('Meine Flyer', 'I miei flyer')}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1 bg-[#F4F9FA] p-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
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

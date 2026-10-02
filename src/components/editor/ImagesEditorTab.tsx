import React from 'react';
import { Image as ImageIcon, Maximize2, Trash2, Upload } from 'lucide-react';
import type { FlyerContent, SectionVisibility } from '../../types';

const STOCK_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', label: 'Pista Fondo Soleggiata' },
  { id: '2', url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80', label: 'Atleta Skating Neve' },
  { id: '3', url: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80', label: 'Famiglia Fondo Vette' },
  { id: '4', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', label: 'Rifugio & Chalet Neve' },
  { id: '5', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', label: 'Pista Notturna Fiaccole' },
  { id: '6', url: 'https://images.unsplash.com/photo-1482867996988-29ec3a0f128f?auto=format&fit=crop&w=1200&q=80', label: 'Vette Dolomitiche UNESCO' },
];

interface ImagesEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  currentVis: SectionVisibility;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImportedImage: (url: string) => void;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function ImagesEditorTab({
  uiLanguage,
  content,
  currentVis,
  fileInputRef,
  onFileUpload,
  onRemoveImportedImage,
  onChangeContent,
}: ImagesEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#0D4D5E]" />
          Gestione Immagini & Upload
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {ui('Laden', 'Carica')} foto personalizzate dal tuo dispositivo oppure scegli dalla galleria stock Dolomiti.
        </p>
      </div>

      <div className="bg-[#0D4D5E]/10 p-3.5 rounded-xl border border-[#0D4D5E]/30 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-slate-900 font-bold font-vietnam text-xs flex items-center gap-1.5 cursor-pointer">
            <ImageIcon className="w-4 h-4 text-[#0D4D5E]" />
            <span>Mostra Immagine sotto l'Header</span>
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentVis.heroImage !== false}
              onChange={(e) => {
                const updatedVis = { ...currentVis, heroImage: e.target.checked };
                onChangeContent({ sectionVisibility: updatedVis, visibility: updatedVis });
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
          </label>
        </div>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <label className="block text-slate-900 font-bold font-vietnam flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#0D4D5E]" />
          {ui('Laden', 'Carica')} Immagine Locale
        </label>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-4 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-xl font-bold font-vietnam flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Upload className="w-4 h-4 text-[#AAD0D1]" />
          <span>Seleziona Foto dal Computer</span>
        </button>
      </div>

      {content.importedImages && content.importedImages.length > 0 && (
        <div className="space-y-2">
          <label className="block text-slate-900 font-bold font-vietnam">
            Le Tue Immagini ({content.importedImages.length})
          </label>
          <div className="grid grid-cols-2 gap-2">
            {content.importedImages.map((imgUrl, idx) => (
              <div
                key={`custom_${idx}`}
                onClick={() => onChangeContent({ heroImageUrl: imgUrl })}
                className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-video group ${
                  content.heroImageUrl === imgUrl ? 'border-[#0D4D5E] shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img src={imgUrl} alt={`Custom upload ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-between p-2">
                  <span className="text-[9px] font-bold text-white">{ui('Geladen', 'Caricata')}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImportedImage(imgUrl);
                    }}
                    className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    title="Elimina immagine"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-slate-700 font-bold">Oppure Inserisci URL Immagine</label>
        <input
          type="text"
          value={content.heroImageUrl}
          onChange={(e) => onChangeContent({ heroImageUrl: e.target.value })}
          placeholder="https://..."
          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
        />
      </div>

      <div>
        <label className="block text-slate-700 font-bold mb-2">Galleria Immagini Suggerite</label>
        <div className="grid grid-cols-2 gap-2">
          {STOCK_IMAGES.map((img) => (
            <div
              key={img.id}
              onClick={() => onChangeContent({ heroImageUrl: img.url })}
              className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-video group ${
                content.heroImageUrl === img.url ? 'border-[#0D4D5E] shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-end p-1">
                <span className="text-[9px] font-bold text-white line-clamp-1">{img.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
        <label className="block text-slate-700 font-bold">Posizione Immagine Principale</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChangeContent({ heroImagePosition: 'top' })}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              content.heroImagePosition === 'top' ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Top Banner
          </button>
          <button
            onClick={() => onChangeContent({ heroImagePosition: 'background' })}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
              content.heroImagePosition === 'background' ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Sfondo Totale
          </button>
        </div>

        {content.heroImagePosition === 'background' && (
          <div className="mt-3">
            <div className="flex justify-between text-slate-600 text-[11px] mb-1 font-medium">
              <span>Trasparenza Overlay Sfondo</span>
              <span className="font-bold text-[#0D4D5E]">{content.heroOverlayOpacity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              value={content.heroOverlayOpacity}
              onChange={(e) => onChangeContent({ heroOverlayOpacity: parseInt(e.target.value) })}
              className="w-full accent-[#0D4D5E]"
            />
          </div>
        )}
      </div>

      <div className="bg-[#0D4D5E]/5 p-3.5 rounded-xl border border-[#0D4D5E]/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-slate-900 font-bold font-vietnam text-xs flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-[#0D4D5E]" />
            <span>Estensione Altezza Immagine Header</span>
          </label>
          <span className="font-black text-xs text-[#0D4D5E] bg-[#0D4D5E]/10 px-2 py-0.5 rounded font-vietnam">
            {content.heroImageHeightPx ? `${content.heroImageHeightPx} px` : 'Flessibile Auto'}
          </span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <input
            type="range"
            min={50}
            max={600}
            step={5}
            value={content.heroImageHeightPx || 180}
            onChange={(e) => onChangeContent({ heroImageHeightPx: parseInt(e.target.value) })}
            className="flex-1 accent-[#0D4D5E]"
          />
          <button
            type="button"
            onClick={() => onChangeContent({ heroImageHeightPx: undefined })}
            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-black rounded-md transition-all shrink-0 font-vietnam"
          >
            Reset Auto
          </button>
        </div>
      </div>
    </div>
  );
}

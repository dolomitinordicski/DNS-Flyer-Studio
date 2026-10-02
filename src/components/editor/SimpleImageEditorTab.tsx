import React, { useRef } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import type { FlyerContent } from '../../types';

interface SimpleImageEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function SimpleImageEditorTab({
  uiLanguage,
  content,
  onChangeContent,
}: SimpleImageEditorTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;

  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result;
      if (typeof url === 'string') {
        onChangeContent({
          heroImageUrl: url,
          importedImages: [url, ...(content.importedImages ?? [])],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam">{ui('Titelbild', 'Immagine principale')}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {ui('Ändere nur das Hauptbild des Flyers.', 'Modifica solo l’immagine principale del flyer.')}
        </p>
      </div>

      <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        {content.heroImageUrl ? (
          <img src={content.heroImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={upload} className="hidden" />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full py-2.5 bg-[#0D4D5E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4 text-[#AAD0D1]" />
        {ui('Bild ändern', 'Cambia immagine')}
      </button>

      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">URL</span>
        <input
          value={content.heroImageUrl || ''}
          onChange={e => onChangeContent({ heroImageUrl: e.target.value })}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
          placeholder="https://..."
        />
      </label>
    </div>
  );
}

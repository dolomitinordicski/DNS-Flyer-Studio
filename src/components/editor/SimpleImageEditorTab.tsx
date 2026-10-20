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
  const dragRef = useRef<{ x: number; y: number; focusX: number; focusY: number } | null>(null);
  const clamp = (value: number) => Math.max(0, Math.min(100, value));
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

      <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 select-none touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={e => { if (!content.heroImageUrl) return; dragRef.current = { x: e.clientX, y: e.clientY, focusX: content.heroImageFocusX ?? 50, focusY: content.heroImageFocusY ?? 50 }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const drag = dragRef.current; if (!drag) return; const rect = e.currentTarget.getBoundingClientRect(); onChangeContent({ heroImageFocusX: clamp(drag.focusX - 100 * (e.clientX - drag.x) / rect.width), heroImageFocusY: clamp(drag.focusY - 100 * (e.clientY - drag.y) / rect.height) }); }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}>
        {content.heroImageUrl ? (
          <img src={content.heroImageUrl} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-600">{ui("Bild im Rahmen ziehen, um den Ausschnitt zu wählen.", "Trascina la foto nel riquadro per scegliere l’inquadratura.")}</p>
      <button type="button" onClick={() => onChangeContent({ heroImageFocusX: 50, heroImageFocusY: 50 })} className="text-xs underline text-[#0D4D5E]">{ui("Ausschnitt zentrieren", "Centra inquadratura")}</button>
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

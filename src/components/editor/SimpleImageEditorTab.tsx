import React, { useEffect, useRef, useState } from 'react';
import { listFlyerImages, uploadFlyerImage, type FlyerImageAsset } from '../../data/flyerImageLibrary';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { clearTemporaryFlyerImage, setTemporaryFlyerImage } from '../../data/temporaryFlyerImage';
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
  const [library, setLibrary] = useState<FlyerImageAsset[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [libraryError, setLibraryError] = useState('');
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(false);
  const operationEpoch = useRef(0);
  useEffect(() => {
    setBusy(false);
    setLoadingLibrary(false);
    setError('');
    setPendingPhoto(false);
    return () => {
      operationEpoch.current += 1;
      clearTemporaryFlyerImage();
    };
  }, [content.regionId]);
  // Keep existing draft image references usable, even if Storage's list API
  // is unavailable (e.g. storage/retry-limit-exceeded).
  useEffect(() => {
    const urls = [content.heroImageUrl, ...(content.importedImages ?? [])]
      .filter((url): url is string => !!url && /^https?:\/\//.test(url));
    setLibrary(previous => {
      const existing = new Map(previous.map(item => [item.url, item]));
      return [...new Set(urls)].map((url, index) =>
        existing.get(url) || { url, path: url, name: `Bild ${index + 1}` });
    });
    setLibraryError('');
  }, [content.regionId]);

  const refreshLibrary = async () => {
    const epoch = operationEpoch.current;
    setLoadingLibrary(true);
    setLibraryError('');
    try {
      const assets = await listFlyerImages(content.regionId);
      if (epoch !== operationEpoch.current) return;
      setLibrary(previous => {
        const all = [...assets, ...previous];
        return all.filter((asset, index) => all.findIndex(other => other.url === asset.url) === index);
      });
    } catch (err: any) {
      if (epoch !== operationEpoch.current) return;
      setLibraryError(err?.code || err?.message || 'IMAGE_LIBRARY_UNAVAILABLE');
    } finally {
      if (epoch === operationEpoch.current) setLoadingLibrary(false);
    }
  };
  const dragRef = useRef<{ x: number; y: number; focusX: number; focusY: number } | null>(null);
  const clamp = (value: number) => Math.max(0, Math.min(100, value));
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;

  const verifyImage = (url: string) => new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('IMAGE_DOWNLOAD_OR_DECODE_FAILED'));
    image.src = url;
  });

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const epoch = operationEpoch.current;
    setBusy(true);
    setError('');
    setImageError(false);
    setPendingPhoto(true);
    setTemporaryFlyerImage(content.regionId, file);
    try {
      // Firestore document snapshots must never contain megabytes of base64.
      const asset = await uploadFlyerImage(file, content.regionId);
      if (epoch !== operationEpoch.current) return;
      setLibrary(old => [asset, ...old.filter(item => item.url !== asset.url)]);
      onChangeContent({
        heroImageUrl: asset.url,
        heroImageFocusX: 50,
        heroImageFocusY: 50,
        importedImages: [asset.url, ...(content.importedImages ?? []).filter(url => url !== asset.url && !url.startsWith('data:'))].slice(0, 80),
      });
      clearTemporaryFlyerImage();
      setPendingPhoto(false);
      // Persist the durable URL as soon as Storage confirms the upload.
      // A transient image download failure must not discard a successful upload.
      void verifyImage(asset.url).catch(() => {
        if (epoch === operationEpoch.current) setImageError(true);
      });
    } catch (err: any) {
      if (epoch !== operationEpoch.current) return;
      const code = err?.code || err?.message || 'IMAGE_UPLOAD_FAILED';
      setError(code);
    } finally {
      if (epoch === operationEpoch.current) setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam">{ui('Titelbild', 'Immagine principale')}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {ui('Ändere nur das Hauptbild des Flyers.', 'Modifica solo l’immagine principale del flyer.')}
        </p>
      </div>

      {pendingPhoto && !error && <div role="status" className="text-xs text-blue-800 bg-blue-50 border border-blue-200 p-2 rounded">{ui('Lokale Vorschau: Upload zu DNS Core läuft. Noch nicht dauerhaft gespeichert.', 'Anteprima locale: caricamento su DNS Core in corso. Foto non ancora salvata definitivamente.')}</div>}
      {error && <div role="status" className="text-xs text-amber-900 bg-amber-50 border p-2 rounded">{ui('Das Bild ist nur als temporäre Vorschau sichtbar und wird nach Neuladen verschwinden.', 'La fotografia visibile è soltanto un’anteprima temporanea: scomparirà ricaricando la pagina.')}</div>}
      {error && (
        <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded space-y-1">
          <strong className="block">{ui('Bild konnte nicht in DNS Core Storage gespeichert werden', 'Impossibile salvare l’immagine in DNS Core Storage')}</strong>
          <span className="block font-mono">{error}</span>
          {(error.includes('unauthorized') || error.includes('permission-denied')) && (
            <span className="block">{ui('Die Firebase Storage-Regeln verweigern den Zugriff. DNS Core Storage-Berechtigungen prüfen.', 'Le regole Firebase Storage negano l’accesso. Occorre verificare i permessi Storage di DNS Core.')}</span>
          )}
          {error.includes('DNS_CORE_AUTH_REQUIRED') && (
            <span className="block">{ui('Bitte mit DNS Core anmelden.', 'Accedi prima a DNS Core.')}</span>
          )}
        </div>
      )}
      {libraryError && (
        <div role="status" className="text-[11px] text-amber-800 bg-amber-50 rounded p-2">
          {ui('Cloud-Archiv kann derzeit nicht abgefragt werden; vorhandene Bilder im Flyer bleiben nutzbar.', 'La lista cloud non risponde al momento; le immagini già associate al flyer restano utilizzabili.')}: <code>{libraryError}</code>
        </div>
      )}
      {content.heroImageUrl?.startsWith('data:image/') && (
        <p className="text-[11px] text-amber-800">
          {ui('Älteres Bild ist nur lokal vorhanden und wird nicht in DNS Core gespeichert. Bitte erneut hochladen.', 'Questa vecchia immagine è incorporata nella bozza e non può essere salvata in DNS Core. Ricaricala nella libreria.')}
        </p>
      )}
      {imageError && <div role="alert" className="text-xs text-red-700">{ui('Bild-URL nicht erreichbar. Bitte anderes Bild auswählen.', 'Immagine non raggiungibile tramite URL. Seleziona un’altra fotografia.')}</div>}
      <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 select-none touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={e => { if (!content.heroImageUrl) return; dragRef.current = { x: e.clientX, y: e.clientY, focusX: content.heroImageFocusX ?? 50, focusY: content.heroImageFocusY ?? 50 }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={e => { const drag = dragRef.current; if (!drag) return; const rect = e.currentTarget.getBoundingClientRect(); onChangeContent({ heroImageFocusX: clamp(drag.focusX - 100 * (e.clientX - drag.x) / rect.width), heroImageFocusY: clamp(drag.focusY - 100 * (e.clientY - drag.y) / rect.height) }); }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}>
        {content.heroImageUrl ? (
          <img src={content.heroImageUrl} alt="" onLoad={() => setImageError(false)} onError={() => setImageError(true)} draggable={false} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }} />
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
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-full py-2.5 bg-[#0D4D5E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4 text-[#AAD0D1]" />
        {busy ? ui('Bild wird gespeichert…', 'Salvataggio immagine…') : ui('Bild ändern', 'Cambia immagine')}
      </button>

      <button type="button" disabled={loadingLibrary} onClick={() => void refreshLibrary()}
        className="w-full py-2 px-3 rounded-lg border border-[#0D4D5E] text-[#0D4D5E] text-xs font-bold disabled:opacity-50">
        {loadingLibrary ? ui('Bildarchiv wird geladen…', 'Caricamento archivio immagini…') : ui('Cloud-Bildarchiv laden', 'Carica archivio immagini cloud')}
      </button>
      {library.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-bold text-[#0D4D5E]">{ui('Gespeicherte Bilder', 'Immagini salvate')}</h4>
          <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
            {library.map(asset => (
              <button key={asset.path} type="button" onClick={async () => { setError(''); try { await verifyImage(asset.url); clearTemporaryFlyerImage(); setPendingPhoto(false); onChangeContent({ heroImageUrl: asset.url }); } catch { setImageError(true); } }}
                className="border border-slate-200 rounded overflow-hidden" title={asset.name}>
                <img src={asset.url} alt={asset.name} loading="lazy" className="aspect-square w-full object-cover"/>
              </button>
            ))}
          </div>
        </section>
      )}
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

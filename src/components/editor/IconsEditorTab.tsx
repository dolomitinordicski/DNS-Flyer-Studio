import React from 'react';
import { Check, Dumbbell, Sparkles, Trash2, Upload } from 'lucide-react';
import type { FlyerContent, SportsIcon } from '../../types';
import { getAllSportsIcons, getSportsIconName } from '../../data/sportsIcons';
import { WireframeIcon } from '../WireframeIcon';

interface IconsEditorTabProps {
  content: FlyerContent;
  customFirestoreIcons: SportsIcon[];
  iconToast: string | null;
  newIconName: string;
  setNewIconName: React.Dispatch<React.SetStateAction<string>>;
  newIconCategory: SportsIcon['category'];
  setNewIconCategory: React.Dispatch<React.SetStateAction<SportsIcon['category']>>;
  newIconImageBase64: string;
  customIconFileInputRef: React.RefObject<HTMLInputElement | null>;
  onCustomIconFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingCustomIcon: boolean;
  onSaveCustomIcon: () => void;
  onToggleSportsIcon: (iconId: string) => void;
  onDeleteCustomIcon: (iconId: string) => void;
}

export function IconsEditorTab({
  content,
  customFirestoreIcons,
  iconToast,
  newIconName,
  setNewIconName,
  newIconCategory,
  setNewIconCategory,
  newIconImageBase64,
  customIconFileInputRef,
  onCustomIconFileChange,
  isUploadingCustomIcon,
  onSaveCustomIcon,
  onToggleSportsIcon,
  onDeleteCustomIcon,
}: IconsEditorTabProps) {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#0D4D5E]" />
            Libreria Icone Sportive & Simboli Wireframe
          </span>
          <span className="text-[10px] font-extrabold text-[#0D4D5E] bg-[#0D4D5E]/10 px-2 py-0.5 rounded-full">
            {content.selectedSportsIcons.length}/6 Selezionate
          </span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Seleziona le icone per i biglietti e listini. I testi cambiano automaticamente nella lingua prescelta ({content.activeLanguage?.toUpperCase() || 'IT'}).
        </p>
      </div>

      {iconToast && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{iconToast}</span>
        </div>
      )}

      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="font-extrabold text-slate-900 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-[#0D4D5E]" />
            Aggiungi Icona dal PC (Database Firestore)
          </span>
          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            Firestore DB
          </span>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
              Nome dell'Icona / Servizio:
            </label>
            <input
              type="text"
              value={newIconName}
              onChange={(e) => setNewIconName(e.target.value)}
              placeholder="es. Pista Notturna VIP, Skibus Dedicato..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4D5E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Categoria:</label>
              <select
                value={newIconCategory}
                onChange={(e) => setNewIconCategory(e.target.value as SportsIcon['category'])}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4D5E]"
              >
                <option value="Nordic Skiing">Nordic Skiing</option>
                <option value="Services">Services</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Events">Events</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                File Immagine / Simbolo:
              </label>
              <input
                type="file"
                ref={customIconFileInputRef}
                accept="image/*"
                onChange={onCustomIconFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => customIconFileInputRef.current?.click()}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 truncate"
              >
                <Upload className="w-3.5 h-3.5 text-[#0D4D5E]" />
                <span className="truncate">{newIconImageBase64 ? 'Cambia File...' : 'Scegli File'}</span>
              </button>
            </div>
          </div>

          {newIconImageBase64 && (
            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
              <img src={newIconImageBase64} alt="Anteprima" className="w-8 h-8 object-contain rounded border p-0.5" />
              <span className="text-[10px] font-bold text-emerald-700">Simbolo caricato pronto per il salvataggio</span>
            </div>
          )}

          <button
            type="button"
            onClick={onSaveCustomIcon}
            disabled={isUploadingCustomIcon}
            className="w-full py-2 px-3 bg-[#0D4D5E] hover:bg-[#072F3A] text-white font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUploadingCustomIcon ? 'Salvataggio in Firestore...' : 'Salva Nuova Icona nel Database Firestore'}</span>
          </button>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
          Scegli e Attiva Icone Vettoriali:
        </div>

        <div className="grid grid-cols-2 gap-2">
          {getAllSportsIcons(customFirestoreIcons).map((icon) => {
            const isSelected = content.selectedSportsIcons.includes(icon.id);
            const localizedName = getSportsIconName(icon, content.activeLanguage || 'it');
            return (
              <div
                key={icon.id}
                onClick={() => onToggleSportsIcon(icon.id)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 relative group ${
                  isSelected
                    ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0D4D5E]'
                }`}>
                  <WireframeIcon icon={icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1 pr-4">
                  <div className={`font-bold text-[11px] font-vietnam leading-tight truncate ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}>
                    {localizedName}
                  </div>
                  <div className={`text-[9px] mt-0.5 line-clamp-1 flex items-center gap-1 ${
                    isSelected ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    <span>{icon.category}</span>
                    {icon.isCustom && (
                      <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-400 text-slate-900">
                        Firestore
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute top-2 right-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isSelected ? 'bg-white text-[#0D4D5E] font-black' : 'border border-slate-300'
                  }`}>
                    {isSelected && '✓'}
                  </div>
                </div>

                {icon.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomIcon(icon.id);
                    }}
                    title="Elimina da Firestore"
                    className="absolute bottom-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

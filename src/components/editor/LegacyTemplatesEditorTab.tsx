import React from 'react';
import { Check, Cloud, Copy, FolderPlus, LayoutTemplate, Loader2 } from 'lucide-react';
import type { FlyerContent, LayoutTemplateId } from '../../types';
import { LEGACY_FLYER_TEMPLATES as FLYER_TEMPLATES } from '../../data/legacyTemplates';
import type { SavedDesign } from '../../lib/firebase';

interface LegacyTemplatesEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  firebaseSavedModels: SavedDesign[];
  isSavingToFirebase: boolean;
  saveToast: string | null;
  onCreateNewModel: () => void;
  onDuplicateCurrentModel: () => void;
  onSaveModelToFirebase: () => void;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onOpenSavedDesignsModal: () => void;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  setSaveToast: React.Dispatch<React.SetStateAction<string | null>>;
}

export function LegacyTemplatesEditorTab(props: LegacyTemplatesEditorTabProps) {
  const {
    uiLanguage, content, firebaseSavedModels, isSavingToFirebase, saveToast,
    onCreateNewModel: handleCreateNewModel,
    onDuplicateCurrentModel: handleDuplicateCurrentModel,
    onSaveModelToFirebase: handleSaveModelToFirebase,
    onApplyTemplate, onOpenSavedDesignsModal, onChangeContent, setSaveToast,
  } = props;
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
      <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-[#0D4D5E]" />
                        {ui('Dolomiti NordicSki Dokumentvorlagen', 'Modelli Documenti Dolomiti NordicSki')}
                      </span>
                      <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                        {ui('9 offiziell', '9 Ufficiali')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {ui('Wähle eine offizielle Vorlage, erstelle eine neue oder dupliziere die aktive. Speichern und synchronisieren über Firebase.', 'Seleziona uno dei listini o documenti ufficiali, crea un nuovo modello o duplica quello attivo. Salva e sincronizza su Firebase.')}
                    </p>
                  </div>
      
                  {/* Notification Toast for Model Actions */}
                  {saveToast && (
                    <div className="p-3 bg-[#0D4D5E] text-white rounded-xl text-xs font-bold font-vietnam animate-fade-in flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#AAD0D1]" />
                        <span>{saveToast}</span>
                      </div>
                    </div>
                  )}
      
                  {/* ACTION BUTTONS FOR MODEL CRUD & FIREBASE SYNC */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={handleCreateNewModel}
                      className="flex flex-col items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-lg text-[10px] font-bold text-[#0D4D5E] transition-all shadow-2xs group"
                      title={ui('Neue leere Vorlage beginnen', 'Inizia un nuovo modello vuoto')}
                    >
                      <FolderPlus className="w-4 h-4 mb-1 text-[#0D4D5E] group-hover:scale-110 transition-transform" />
                      <span>{ui('+ Neu', '+ Nuovo')}</span>
                    </button>
      
                    <button
                      type="button"
                      onClick={handleDuplicateCurrentModel}
                      className="flex flex-col items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-lg text-[10px] font-bold text-slate-700 hover:text-[#0D4D5E] transition-all shadow-2xs group"
                      title={ui('Aktive Vorlage duplizieren', 'Copia e duplica il modello correntemente attivo')}
                    >
                      <Copy className="w-4 h-4 mb-1 text-[#417483] group-hover:scale-110 transition-transform" />
                      <span>📋 Copia</span>
                    </button>
      
                    <button
                      type="button"
                      onClick={handleSaveModelToFirebase}
                      disabled={isSavingToFirebase}
                      className="flex flex-col items-center justify-center p-2 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-lg text-[10px] font-bold transition-all shadow-2xs disabled:opacity-50 group"
                      title={ui('Vorlage speichern', 'Salva modello nel Database Firebase Cloud')}
                    >
                      {isSavingToFirebase ? (
                        <Loader2 className="w-4 h-4 mb-1 animate-spin text-[#AAD0D1]" />
                      ) : (
                        <Cloud className="w-4 h-4 mb-1 text-[#AAD0D1] group-hover:scale-110 transition-transform" />
                      )}
                      <span>☁️ Firebase</span>
                    </button>
                  </div>
      
                  {/* OFFICIAL 6 MODEL TEMPLATES */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-vietnam">
                      Listini & Documenti Ufficiali
                    </h4>
      
                    <div className="grid grid-cols-1 gap-2.5">
                      {FLYER_TEMPLATES.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => onApplyTemplate(tmpl.id)}
                          className="group relative p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#0D4D5E] cursor-pointer transition-all shadow-2xs hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-[#0D4D5E] border border-slate-300/60 font-vietnam">
                                {tmpl.tagline}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1 font-vietnam group-hover:text-[#0D4D5E]">
                                {tmpl.name}
                              </h4>
                            </div>
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 mt-1 shadow-2xs"
                              style={{ backgroundColor: tmpl.previewColor }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
      
                  {/* FIREBASE SAVED MODELS LIST */}
                  {firebaseSavedModels.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                          <Cloud className="w-3.5 h-3.5 text-[#417483]" />
                          {ui('Gespeicherte Vorlagen', 'I Miei Modelli Salvati in Firebase')} ({firebaseSavedModels.length})
                        </h4>
                        <button
                          onClick={onOpenSavedDesignsModal}
                          className="text-[10px] text-[#0D4D5E] font-bold hover:underline"
                        >
                          {ui('Alle verwalten', 'Gestisci Tutti')}
                        </button>
                      </div>
      
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {firebaseSavedModels.slice(0, 5).map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              onChangeContent(m.content);
                              setSaveToast(`Modello "${m.title}" caricato da Firebase!`);
                              setTimeout(() => setSaveToast(null), 3000);
                            }}
                            className="p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] cursor-pointer transition-all flex items-center justify-between shadow-2xs"
                          >
                            <div>
                              <div className="font-bold text-xs text-slate-900 font-vietnam truncate max-w-[200px]">
                                {m.title}
                              </div>
                              <div className="text-[9px] text-slate-500 mt-0.5">
                                Salvato il {new Date(m.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className="text-[9px] font-bold bg-[#AAD0D1]/30 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam shrink-0">
                              {ui('Laden', 'Carica')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
      
                </div>
  );
}

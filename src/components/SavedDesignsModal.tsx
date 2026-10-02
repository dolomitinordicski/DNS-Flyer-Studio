import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Save, 
  Trash2, 
  Download, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Layers, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { FlyerContent } from '../types';
import { 
  saveDesignToFirebase, 
  loadDesignsFromFirebase, 
  deleteDesignFromFirebase, 
  saveFlyerRecordToFirebase,
  SavedDesign 
} from '../lib/firebase';
import { REGIONAL_LOGOS } from '../data/regionalLogos';

interface SavedDesignsModalProps {
  uiLanguage: 'de' | 'it';
  isOpen: boolean;
  onClose: () => void;
  currentContent: FlyerContent;
  onLoadDesign: (savedContent: FlyerContent) => void;
}

export const SavedDesignsModal: React.FC<SavedDesignsModalProps> = ({
  uiLanguage,
  isOpen,
  onClose,
  currentContent,
  onLoadDesign
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [designTitle, setDesignTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch designs on modal open
  useEffect(() => {
    if (isOpen) {
      fetchDesigns();
      setDesignTitle(currentContent.title || ui('Neuer Dolomiti NordicSki Flyer', 'Nuovo Flyer Dolomiti NordicSki'));
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, currentContent.title]);

  const fetchDesigns = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items = await loadDesignsFromFirebase();
      setDesigns(items);
    } catch (err: any) {
      console.error('Failed to load designs:', err);
      setErrorMessage(ui('Gespeicherte Designs konnten nicht geladen werden.', 'Impossibile caricare i design salvati da Firestore.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentDesign = async () => {
    if (!designTitle.trim()) {
      alert(ui('Bitte einen Titel für das Design eingeben.', 'Inserisci un titolo per il tuo design.'));
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const savedContent = { ...currentContent, title: designTitle.trim() };

      // 1. Save into Cloud Designs
      await saveDesignToFirebase(
        null,
        designTitle.trim(),
        savedContent,
        currentContent.graphicStyle || 'classic_official',
        currentContent.heroImageUrl
      );

      // 2. Save into Regional Dashboard Registry
      const regObj = REGIONAL_LOGOS.find(r => r.id === currentContent.regionId);
      const regionName = regObj ? regObj.name : 'Dolomiti NordicSki';

      await saveFlyerRecordToFirebase({
        title: designTitle.trim(),
        regionId: currentContent.regionId || 'dns_central',
        regionName: regionName,
        status: 'issued',
        publishDate: new Date().toISOString().split('T')[0],
        validityPeriod: currentContent.validityPeriod || 'Stagione 2026/27',
        location: currentContent.location || 'Dolomiti NordicSki',
        category: 'general',
        priceInfo: currentContent.priceAmount ? `${currentContent.pricePrefix || ''} ${currentContent.priceAmount} ${currentContent.priceCurrency || '€'}` : 'Listino Ufficiale',
        content: savedContent,
        thumbnailUrl: currentContent.heroImageUrl || ''
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await fetchDesigns();
    } catch (err: any) {
      console.error('Error saving design:', err);
      setErrorMessage(ui('Fehler beim Speichern: ', 'Errore durante il salvataggio in Firebase: ') + (err.message || 'Riprova.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Sei sicuro di voler eliminare questo design salvato?')) {
      return;
    }

    try {
      await deleteDesignFromFirebase(id);
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert('Errore durante l\'eliminazione del design.');
    }
  };

  const handleSelectDesign = (item: SavedDesign) => {
    if (item.content) {
      onLoadDesign(item.content);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#0D4D5E] text-white p-5 flex items-center justify-between border-b border-[#0D4D5E]/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 text-[#AAD0D1]">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black font-vietnam tracking-tight">
                Design Salvati nel Cloud (Firebase)
              </h3>
              <p className="text-xs text-slate-200 font-medium">
                Sincronizza e recupera i tuoi flyer promozionali Dolomiti NordicSki
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          
          {/* Quick Save Current Design Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 font-vietnam flex items-center gap-1.5">
                <Save className="w-4 h-4 text-[#0D4D5E]" />
                Salva Design Corrente
              </span>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Salvato in Cloud & Dashboard!
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={designTitle}
                onChange={(e) => setDesignTitle(e.target.value)}
                placeholder="Titolo o nome del pacchetto..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0D4D5E]"
              />
              <button
                onClick={handleSaveCurrentDesign}
                disabled={isSaving}
                className="px-4 py-2 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-xl text-xs font-bold font-vietnam flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-[#AAD0D1]" />
                    <span>Salva Ora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Notice if any */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* List of Saved Firebase Designs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-extrabold tracking-wider font-vietnam text-slate-500">
                I Tuoi Design In Cloud ({designs.length})
              </h4>
              <button
                onClick={fetchDesigns}
                disabled={isLoading}
                className="text-[11px] font-bold text-[#0D4D5E] hover:underline"
              >
                Aggiorna elenco
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#0D4D5E]" />
                <span className="text-xs font-medium">Caricamento da Firebase Firestore...</span>
              </div>
            ) : designs.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-bold">Nessun design salvato nel database.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Usa il campo in alto per salvare la tua prima creazione!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {designs.map((item) => {
                  const dateFormatted = new Date(item.updatedAt).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectDesign(item)}
                      className="group p-3.5 bg-white border border-slate-200 hover:border-[#0D4D5E] rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Style & Region Tag */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-[#0D4D5E] border border-slate-200">
                            {item.graphicStyle || 'classic'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateFormatted}
                          </span>
                        </div>

                        <h5 className="font-bold text-xs text-slate-900 group-hover:text-[#0D4D5E] font-vietnam line-clamp-1">
                          {item.title}
                        </h5>

                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {item.content?.subtitle || 'Nessun sottotitolo'}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#0D4D5E]">
                          {item.content?.priceAmount} {item.content?.priceCurrency}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDelete(item.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Elimina design"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-bold text-[#0D4D5E] group-hover:underline">
                            Apri →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};

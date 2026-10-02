import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Type, 
  Palette, 
  MapPin, 
  Image as ImageIcon, 
  QrCode, 
  Plus, 
  Trash2, 
  Check, 
  Layers,
  Settings,
  Sliders,
  Upload,
  Globe,
  Dumbbell,
  Cloud,
  Layout,
  CheckCircle2,
  Copy,
  Save,
  Loader2,
  FolderPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  RotateCcw,
  Move,
  Maximize2,
  Square,
  Ticket,
  Hotel
} from 'lucide-react';
import { FlyerContent, LayoutTemplateId, BrandColorScheme, PaperFormat, GraphicStyle, FlyerSectionId, LanguageCode, MultilingualTextSet, SportsIcon } from '../types';
import { FLYER_TEMPLATES, DEFAULT_PRICE_LIST_TEXTS, DIGITAL_PASS_PRESETS } from '../data/templates';
import { REGIONAL_LOGOS } from '../data/regionalLogos';
import { SPORTS_ICONS, getSportsIconName, getAllSportsIcons } from '../data/sportsIcons';
import { DolomitiSkierTrackEmblem, OFFICIAL_ASSET_PATHS } from './CorporateVectors';
import { WireframeIcon } from './WireframeIcon';
import { isSvgUrl } from '../utils/logoUtils';
import { DIGITAL_PASS_REGIONS } from './blocks/RegionalAreasGridBlock';
import { 
  saveDesignToFirebase, 
  loadDesignsFromFirebase, 
  deleteDesignFromFirebase, 
  SavedDesign,
  loadCustomIconsFromFirebase,
  saveCustomIconToFirebase,
  deleteCustomIconFromFirebase
} from '../lib/firebase';
import { DEFAULT_SECTION_ORDER } from './flyer-variants/VariantTypes';
import { LANGUAGE_OPTIONS, getInitialTranslations, getContentForLanguage } from '../utils/multilingual';

interface EditorPanelProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onOpenSavedDesignsModal: () => void;
  onMakeItPerfect?: () => void;
}

const STOCK_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', label: 'Pista Fondo Soleggiata' },
  { id: '2', url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80', label: 'Atleta Skating Neve' },
  { id: '3', url: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80', label: 'Famiglia Fondo Vette' },
  { id: '4', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', label: 'Rifugio & Chalet Neve' },
  { id: '5', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', label: 'Pista Notturna Fiaccole' },
  { id: '6', url: 'https://images.unsplash.com/photo-1482867996988-29ec3a0f128f?auto=format&fit=crop&w=1200&q=80', label: 'Vette Dolomitiche UNESCO' }
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  uiLanguage,
  content,
  onChangeContent,
  onApplyTemplate,
  onOpenSavedDesignsModal,
  onMakeItPerfect
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [activeTab, setActiveTab] = useState<'templates' | 'style_variant' | 'graphic_elements' | 'content' | 'region' | 'images' | 'style' | 'icons' | 'qr'>('templates');
  const [activeOrderOrientation, setActiveOrderOrientation] = useState<'portrait' | 'landscape'>(content.orientation || 'portrait');

  // Sync orientation tab when flyer orientation changes externally
  useEffect(() => {
    if (content.orientation) {
      setActiveOrderOrientation(content.orientation);
    }
  }, [content.orientation]);

  // Visibility fallback object
  const currentVis = content.sectionVisibility || content.visibility || {
    header: true, heroImage: true, promotionBox: false, priceTables: true,
    servicesBox: false, ecoBanner: false, earlyBird: false, qrCode: true, disclaimer: true, footer: true
  };

  // File input ref for image uploading
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase saved designs local state
  const [firebaseSavedModels, setFirebaseSavedModels] = useState<SavedDesign[]>([]);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Custom Icons state from Firestore
  const [customFirestoreIcons, setCustomFirestoreIcons] = useState<SportsIcon[]>([]);
  const [isUploadingCustomIcon, setIsUploadingCustomIcon] = useState(false);
  const [newIconName, setNewIconName] = useState('');
  const [newIconCategory, setNewIconCategory] = useState<'Nordic Skiing' | 'Services' | 'Accommodation' | 'Events' | 'Custom'>('Custom');
  const [newIconImageBase64, setNewIconImageBase64] = useState<string>('');
  const [iconToast, setIconToast] = useState<string | null>(null);
  const customIconFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved designs and custom icons from Firebase Firestore on mount
  useEffect(() => {
    fetchSavedModels();
    fetchCustomIcons();
  }, []);

  const fetchSavedModels = async () => {
    try {
      const items = await loadDesignsFromFirebase();
      setFirebaseSavedModels(items);
    } catch (err) {
      console.error('Error fetching Firebase models:', err);
    }
  };

  const fetchCustomIcons = async () => {
    try {
      const items = await loadCustomIconsFromFirebase();
      setCustomFirestoreIcons(items);
    } catch (err) {
      console.error('Error fetching Firestore custom icons:', err);
    }
  };

  const handleCustomIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewIconImageBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomIcon = async () => {
    if (!newIconName.trim()) {
      alert('Inserisci un nome per l\'icona.');
      return;
    }
    if (!newIconImageBase64) {
      alert('Seleziona un\'immagine o simbolo icona dal PC.');
      return;
    }

    setIsUploadingCustomIcon(true);
    try {
      const created = await saveCustomIconToFirebase({
        name: newIconName.trim(),
        nameIt: newIconName.trim(),
        category: newIconCategory,
        lucideIconName: 'Sparkles',
        customIconUrl: newIconImageBase64,
        isCustom: true
      });

      setCustomFirestoreIcons(prev => [created, ...prev]);
      if (!content.selectedSportsIcons.includes(created.id)) {
        onChangeContent({
          selectedSportsIcons: [...content.selectedSportsIcons, created.id]
        });
      }

      setNewIconName('');
      setNewIconImageBase64('');
      if (customIconFileInputRef.current) customIconFileInputRef.current.value = '';

      setIconToast('Nuova icona aggiunta al Database Firestore!');
      setTimeout(() => setIconToast(null), 4000);
    } catch (err) {
      console.error('Save custom icon failed:', err);
      alert('Errore durante il salvataggio dell\'icona in Firestore.');
    } finally {
      setIsUploadingCustomIcon(false);
    }
  };

  const handleDeleteCustomIcon = async (iconId: string) => {
    if (!confirm('Eliminare questa icona dal database Firestore?')) return;
    try {
      await deleteCustomIconFromFirebase(iconId);
      setCustomFirestoreIcons(prev => prev.filter(i => i.id !== iconId));
      if (content.selectedSportsIcons.includes(iconId)) {
        onChangeContent({
          selectedSportsIcons: content.selectedSportsIcons.filter(id => id !== iconId)
        });
      }
    } catch (err) {
      console.error('Delete custom icon failed:', err);
    }
  };

  // Helper 1: Add a New Custom Model
  const handleCreateNewModel = () => {
    const newTitle = prompt('Inserisci il nome per il nuovo modello:', 'Nuovo Modello Personalizzato');
    if (!newTitle) return;

    onChangeContent({
      title: newTitle,
      subtitle: 'Personalizza qui i dettagli del tuo nuovo modello per strutture o clienti.',
      badgeText: 'MODELLO PERSONALIZZATO',
      priceAmount: '0,00',
      priceCurrency: '€',
      pricePrefix: 'Da',
      priceSuffix: '/ persona',
      features: [
        { id: `feat_${Date.now()}_1`, icon: 'skipass', text: 'Servizio personalizzato 1', highlight: true },
        { id: `feat_${Date.now()}_2`, icon: 'trail', text: 'Servizio personalizzato 2', highlight: false }
      ]
    });

    setSaveToast('Nuovo modello creato! Ora puoi personalizzarlo e salvarlo su Firebase.');
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Helper 2: Copy / Duplicate Current Active Model
  const handleDuplicateCurrentModel = () => {
    const duplicatedTitle = `${content.title || 'Modello'} (Copia)`;
    onChangeContent({
      title: duplicatedTitle
    });

    setSaveToast(`Modello duplicato come "${duplicatedTitle}"! Pronti per la modifica.`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Helper 3: Save Model Directly to Firebase
  const handleSaveModelToFirebase = async () => {
    setIsSavingToFirebase(true);
    try {
      await saveDesignToFirebase(
        null,
        content.title || 'Modello Dolomiti NordicSki',
        content,
        content.graphicStyle || 'classic_corporate',
        content.heroImageUrl
      );
      
      await fetchSavedModels();
      setSaveToast(' Modello salvato con successo su Firebase Cloud!');
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      alert('Errore durante il salvataggio su Firebase: ' + (err.message || 'Riprova.'));
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Handle local image file upload & conversion to Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const existingImports = content.importedImages || [];
        const updatedImports = [dataUrl, ...existingImports];
        onChangeContent({
          importedImages: updatedImports,
          heroImageUrl: dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove imported image
  const handleRemoveImportedImage = (urlToRemove: string) => {
    const updated = (content.importedImages || []).filter(u => u !== urlToRemove);
    onChangeContent({
      importedImages: updated,
      heroImageUrl: content.heroImageUrl === urlToRemove ? STOCK_IMAGES[0].url : content.heroImageUrl
    });
  };

  // Handle Feature item update
  const handleUpdateFeature = (id: string, text: string) => {
    const updated = content.features.map(f => f.id === id ? { ...f, text } : f);
    onChangeContent({ features: updated });
  };

  // Add new feature
  const handleAddFeature = () => {
    const newFeature = {
      id: `feat_${Date.now()}`,
      icon: 'skipass',
      text: 'Nuovo servizio incluso nel pacchetto',
      highlight: false
    };
    onChangeContent({ features: [...content.features, newFeature] });
  };

  // Remove feature
  const handleRemoveFeature = (id: string) => {
    onChangeContent({ features: content.features.filter(f => f.id !== id) });
  };

  // Toggle Sports Icon selection
  const handleToggleSportsIcon = (iconId: string) => {
    const exists = content.selectedSportsIcons.includes(iconId);
    if (exists) {
      onChangeContent({
        selectedSportsIcons: content.selectedSportsIcons.filter(id => id !== iconId)
      });
    } else {
      if (content.selectedSportsIcons.length >= 6) {
        alert('Puoi selezionare al massimo 6 icone sportive contemporaneamente.');
        return;
      }
      onChangeContent({
        selectedSportsIcons: [...content.selectedSportsIcons, iconId]
      });
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-hidden no-print">
      
      {/* Top Banner for Firebase Saved Designs Trigger & Make It Perfect */}
      <div className="bg-[#0D4D5E] px-3.5 py-2 text-white flex flex-col gap-2 border-b border-[#0D4D5E]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#AAD0D1] animate-pulse" />
            <span className="text-xs font-bold font-vietnam">Database Cloud Firebase</span>
          </div>
          <button
            onClick={onOpenSavedDesignsModal}
            className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold text-white border border-white/20 transition-all flex items-center gap-1.5"
          >
            <span>Design Salvati</span>
            <span className="bg-[#AAD0D1] text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
              Cloud
            </span>
          </button>
        </div>

        {/* Make It Perfect Quick Action Button */}
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

      {/* Navigation Tabs Header - 3 Column Grid ensuring ALL tabs including Colori are visible on all screen sizes */}
      <div className="grid grid-cols-3 gap-1 bg-[#F4F9FA] p-2 border-b border-slate-200">
        {[
          { id: 'templates', label: ui('Vorlagen', 'Modelli'), icon: LayoutTemplate },
          { id: 'style_variant', label: ui('Layout', 'Stile'), icon: Layout },
          { id: 'graphic_elements', label: ui('Grafikelemente', 'Elementi grafici'), icon: Sparkles },
          { id: 'content', label: ui('Texte', 'Testi'), icon: Type },
          { id: 'region', label: ui('Gebiet', 'Regione'), icon: MapPin },
          { id: 'images', label: ui('Bilder', 'Immagini'), icon: ImageIcon },
          { id: 'style', label: ui('Farben', 'Colori'), icon: Palette },
          { id: 'icons', label: ui('Icons', 'Icone'), icon: Dumbbell },
          { id: 'qr', label: 'QR Code', icon: QrCode }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* TAB 1: MODELLI PREIMPOSTATI & GESTIONE MODELLI */}
        {activeTab === 'templates' && (
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
                title="Inizia un nuovo modello vuoto"
              >
                <FolderPlus className="w-4 h-4 mb-1 text-[#0D4D5E] group-hover:scale-110 transition-transform" />
                <span>+ Nuovo</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicateCurrentModel}
                className="flex flex-col items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-lg text-[10px] font-bold text-slate-700 hover:text-[#0D4D5E] transition-all shadow-2xs group"
                title="Copia e duplica il modello correntemente attivo"
              >
                <Copy className="w-4 h-4 mb-1 text-[#417483] group-hover:scale-110 transition-transform" />
                <span>📋 Copia</span>
              </button>

              <button
                type="button"
                onClick={handleSaveModelToFirebase}
                disabled={isSavingToFirebase}
                className="flex flex-col items-center justify-center p-2 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-lg text-[10px] font-bold transition-all shadow-2xs disabled:opacity-50 group"
                title="Salva modello nel Database Firebase Cloud"
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
                    I Miei Modelli Salvati in Firebase ({firebaseSavedModels.length})
                  </h4>
                  <button
                    onClick={onOpenSavedDesignsModal}
                    className="text-[10px] text-[#0D4D5E] font-bold hover:underline"
                  >
                    Gestisci Tutti
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
                        Carica
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: STILE GRAFICO (STILI LAYOUT CORPORATE) */}
        {activeTab === 'style_variant' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#0D4D5E]" />
                  Stili Grafici Corporate Identity Manual
                </span>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  8 Stili
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Applica uno degli stili di layout ufficiali approvati dal Corporate Design Dolomiti NordicSki:
              </p>
            </div>

            {/* MAKE IT PERFECT QUICK TRIGGER */}
            {onMakeItPerfect && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-400/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-900 text-xs flex items-center gap-1.5 font-vietnam">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span>Ottimizzazione Layout "Make It Perfect"</span>
                  </span>
                  <button
                    type="button"
                    onClick={onMakeItPerfect}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 text-xs font-black rounded-lg shadow-xs transition-all active:scale-95"
                  >
                    Rendi Perfetto
                  </button>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  Adatta l'altezza dell'immagine header come buffer flessibile, ridimensiona i testi, calcola le interlinee e applica il bilanciamento per {content.format} {content.orientation === 'landscape' ? 'Orizzontale' : 'Verticale'}.
                </p>
              </div>
            )}

            {/* SEZIONE STILE BORDI ED ANGOLI (Arrotondati vs A Spigolo) */}
            <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                  <Square className="w-4 h-4 text-[#0D4D5E]" />
                  <span>Stile Bordi ed Angoli Elementi</span>
                </h4>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  {content.cornerStyle === 'sharp' ? 'A Spigolo' : content.cornerStyle === 'none' ? 'Senza Bordo' : 'Arrotondati'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Scegli se applicare angoli morbidi arrotondati, spigoli squadrati oppure rimuovere completamente il bordo a card, box e immagini.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onChangeContent({ cornerStyle: 'rounded' })}
                  className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    (content.cornerStyle || 'rounded') === 'rounded'
                      ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 ${ (content.cornerStyle || 'rounded') === 'rounded' ? 'border-white bg-white/20' : 'border-[#0D4D5E] bg-[#0D4D5E]/10' } flex items-center justify-center shrink-0`}>
                    <div className={`w-3 h-3 rounded-xs ${ (content.cornerStyle || 'rounded') === 'rounded' ? 'bg-white' : 'bg-[#0D4D5E]' }`} />
                  </div>
                  <div>
                    <div className="font-bold text-[10px] font-vietnam leading-none">Arrotondati</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeContent({ cornerStyle: 'sharp' })}
                  className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    content.cornerStyle === 'sharp'
                      ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-none border-2 ${ content.cornerStyle === 'sharp' ? 'border-white bg-white/20' : 'border-[#0D4D5E] bg-[#0D4D5E]/10' } flex items-center justify-center shrink-0`}>
                    <div className={`w-3 h-3 rounded-none ${ content.cornerStyle === 'sharp' ? 'bg-white' : 'bg-[#0D4D5E]' }`} />
                  </div>
                  <div>
                    <div className="font-bold text-[10px] font-vietnam leading-none">A Spigolo</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeContent({ cornerStyle: 'none' })}
                  className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    content.cornerStyle === 'none'
                      ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-none border-dashed border-2 ${ content.cornerStyle === 'none' ? 'border-white/50 bg-white/10' : 'border-slate-300 bg-slate-50' } flex items-center justify-center shrink-0`}>
                    <div className={`w-3 h-3 rounded-none ${ content.cornerStyle === 'none' ? 'bg-white' : 'bg-slate-300' } opacity-20`} />
                  </div>
                  <div>
                    <div className="font-bold text-[10px] font-vietnam leading-none">No Bordo</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Price list style lock banner */}
            {content.graphicStyle === 'official_price_table' && (
              <div className="p-3.5 bg-[#0D4D5E]/10 border border-[#0D4D5E]/30 rounded-xl space-y-1">
                <div className="font-extrabold text-[#0D4D5E] flex items-center gap-1.5 font-vietnam text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#0D4D5E] shrink-0" />
                  <span>Stile Listino Prezzi: Tabella Ufficiale Trilingue (DE / IT / EN)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Per il listino prezzi (Carosello 900+ km e Singola Area) è attivo lo stile ufficiale unificato a blocchi 2026/27.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {[
                {
                  id: 'classic_corporate',
                  name: '1. Classico Corporate Alpine (Blocchi)',
                  desc: 'Header blu navy con logo ufficiale Dolomiti NordicSki, badge partner regionale, fascia prezzi ad alto contrasto.',
                  badge: 'Standard Ufficiale'
                },
                {
                  id: 'classic_corporate_v1',
                  name: '1b. Classico Corporate Alpine (Stile Precedente)',
                  desc: 'Versione classica precedente senza sistema a blocchi rigido, con markup originale.',
                  badge: 'Stile Precedente'
                },
                {
                  id: 'modern_glacier',
                  name: '2. Modern Glacier Carousel (Blocchi)',
                  desc: 'Layout contemporaneo con blocco azzurro ghiacciaio in alto, ampia foto panoramica split e card fluttuanti.',
                  badge: 'Stile Carosello'
                },
                {
                  id: 'modern_glacier_v1',
                  name: '2b. Modern Glacier Carousel (Stile Precedente)',
                  desc: 'Versione carosello ghiacciaio precedente con layout flessibile originale.',
                  badge: 'Stile Precedente'
                },
                {
                  id: 'nordic_modern',
                  name: '3. Nordic Modern High-Contrast (Blocchi)',
                  desc: 'Stile moderno scuro ad alto contrasto con dettagli cyan, gradienti sportivi e grafica dinamica.',
                  badge: 'Modern Dark'
                },
                {
                  id: 'nordic_modern_v1',
                  name: '3b. Nordic Modern High-Contrast (Stile Precedente)',
                  desc: 'Versione nordic modern scura originale ad alto contrasto.',
                  badge: 'Stile Precedente'
                },
                {
                  id: 'official_price_table',
                  name: '4. Tabella Prezzi Ufficiale 2026/27 (Blocchi)',
                  desc: 'Layout strutturato trilingue (DE/IT/EN) con griglia prezzi singola area e carosello, logo regionale e QR code.',
                  badge: 'Listino Unificato'
                },
                {
                  id: 'manifesto_voucher',
                  name: '5. Manifesto & Ticket Voucher (Blocchi)',
                  desc: 'Frame e bordi istituzionali stile attestato/locandina reception hotel, griglia dati e bollini di garanzia.',
                  badge: 'Stile Manifesto'
                },
                {
                  id: 'manifesto_voucher_v1',
                  name: '5b. Manifesto & Ticket Voucher (Stile Precedente)',
                  desc: 'Versione manifesto voucher originale.',
                  badge: 'Stile Precedente'
                },
                {
                  id: 'classic_official',
                  name: '6. Classico Istituzionale',
                  desc: 'Variante classica istituzionale con colori ufficiali e composizione elegante.',
                  badge: 'Istituzionale'
                },
                {
                  id: 'glacier_panorama',
                  name: '7. Ghiacciaio Panorama',
                  desc: 'Focus panoramico su paesaggi montani con elementi traslucidi e tipografia in risalto.',
                  badge: 'Panorama'
                },
                {
                  id: 'official_ticket_voucher',
                  name: '8. Pass & Ticket Voucher',
                  desc: 'Formato voucher ufficiale per skipass settimanali e stagionali con codici di verifica.',
                  badge: 'Ticket Pass'
                },
                {
                  id: 'online_ticket_manifesto',
                  name: '9. Biglietto Stampa Online Manifesto (Blocchi)',
                  desc: 'Base monolingua stile manifesto per la stampa di biglietti online (Giornaliero, Settimanale Area e DNS) con Barcode e QR Code.',
                  badge: 'Biglietto Stampa'
                },
                {
                  id: 'online_ticket_manifesto_v1',
                  name: '9b. Biglietto Stampa Online Manifesto (Stile Precedente)',
                  desc: 'Versione biglietto stampa online originale.',
                  badge: 'Stile Precedente'
                },
                {
                  id: 'hotel_skipass_package',
                  name: '10a. Boutique Alpine Resort (Elegante VIP)',
                  desc: 'Layout per hotel e chalet con doppia card offerta bicolore, badge salvia in risalto e lista servizi ad alta leggibilità.',
                  badge: 'Boutique VIP'
                },
                {
                  id: 'hotel_skipass_panorama',
                  name: '10b. Panorama Magazine (Editoriale Foto)',
                  desc: 'Layout ad alto impatto fotografico con hero panoramica, titolo integrato sull\'immagine e scheda offerta asimmetrica.',
                  badge: 'Panorama Photo'
                },
                {
                  id: 'hotel_skipass_compact',
                  name: '10c. Compact Promo Ticket (Bacheca & Reception)',
                  desc: 'Pensato per la stampa da affiggere in reception con prezzo XXL ad alta visibilità e QR Code ingrandito per la scansione rapida.',
                  badge: 'Compact Reception'
                },
                {
                  id: 'hotel_skipass_fusion',
                  name: '10d. Alpine Fusion (Bold & Integrato)',
                  desc: 'Layout audace e moderno in cui hero photo, titolo, prezzo e contatti si fondono in un unico canvas integrato.',
                  badge: 'Bold Fusion'
                }
              ].map((variant) => {
                const isSelected = (content.graphicStyle || 'classic_corporate') === variant.id;

                return (
                  <div
                    key={variant.id}
                    onClick={() => {
                      let updatedTemplateId = content.layoutTemplateId;
                      if (variant.id === 'official_price_table') updatedTemplateId = 'official_price_list';
                      else if (variant.id === 'official_price_table_v1') updatedTemplateId = 'regional_price_list';
                      else if (variant.id === 'online_ticket_manifesto' || variant.id === 'online_ticket_manifesto_v1') updatedTemplateId = 'ticket_digital_pass';
                      else if (variant.id === 'hotel_skipass_package' || variant.id === 'hotel_skipass_boutique' || variant.id === 'hotel_skipass_panorama' || variant.id === 'hotel_skipass_compact' || variant.id === 'hotel_skipass_fusion') updatedTemplateId = 'hotel_skipass_package';
                      else if (variant.id === 'manifesto_voucher' || variant.id === 'official_ticket_voucher') updatedTemplateId = 'gift_voucher';

                      onChangeContent({ 
                        graphicStyle: variant.id as GraphicStyle,
                        layoutTemplateId: updatedTemplateId,
                        sectionVisibility: {
                          ...content.sectionVisibility,
                          header: content.sectionVisibility?.header ?? true,
                          bigTitle: true,
                          heroImage: content.sectionVisibility?.heroImage ?? true,
                          promotionBox: true,
                          priceTables: true,
                          servicesBox: true,
                          sportsIcons: true,
                          ecoBanner: true,
                          qrCode: true,
                          disclaimer: true,
                          footer: true,
                        }
                      });
                    }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-[#0D4D5E] ring-2 ring-[#0D4D5E]/15 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                          variant.id === 'official_price_table'
                            ? 'bg-[#0D4D5E] text-white'
                            : 'bg-[#0D4D5E]/10 text-[#0D4D5E]'
                        }`}>
                          {variant.badge}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 font-vietnam">
                          {variant.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#0D4D5E]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {variant.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GRAPHIC ELEMENTS, FILIGRANA HEADER & SEZIONI */}
        {activeTab === 'graphic_elements' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                Graphic Elements & Filigrana Header
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Gestisci la grafica del Langläufer con Kurve negli angoli, la filigrana vector in trasparenza nell'header e la visibilità delle sezioni.
              </p>
            </div>

            {/* NORDIC SWOOSH & LANGLÄUFER CONFIGURATION */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-vietnam">Langläufer / Swoosh Angoli</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.nordicSwoosh?.enabled ?? true}
                    onChange={(e) => {
                      onChangeContent({
                        nordicSwoosh: {
                          enabled: e.target.checked,
                          position: content.nordicSwoosh?.position || 'top_right',
                          variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                          size: 'custom',
                          customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                          opacity: content.nordicSwoosh?.opacity ?? 90
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]"></div>
                </label>
              </div>

              {(content.nordicSwoosh?.enabled ?? true) && (
                <div className="space-y-4 pt-1">
                  {/* Variant Choice */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">
                      Variante Grafica Ufficiale
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onChangeContent({
                            nordicSwoosh: {
                              enabled: true,
                              position: content.nordicSwoosh?.position || 'top_right',
                              variant: 'swoosh_skier',
                              size: 'custom',
                              customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                              opacity: content.nordicSwoosh?.opacity ?? 90
                            }
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          (content.nordicSwoosh?.variant || 'swoosh_skier') === 'swoosh_skier'
                            ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <img src={OFFICIAL_ASSET_PATHS.kurveLanglaeufer} alt="Sciatore con Kurve" className="h-7 object-contain" />
                        <span className="text-[10px]">Swoosh + Sciatore</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeContent({
                            nordicSwoosh: {
                              enabled: true,
                              position: content.nordicSwoosh?.position || 'top_right',
                              variant: 'swoosh_only',
                              size: 'custom',
                              customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                              opacity: content.nordicSwoosh?.opacity ?? 90
                            }
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          content.nordicSwoosh?.variant === 'swoosh_only'
                            ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <img src={OFFICIAL_ASSET_PATHS.kurve} alt="Solo Swoosh Kurve" className="h-7 object-contain" />
                        <span className="text-[10px]">Solo Swoosh</span>
                      </button>
                    </div>
                  </div>

                  {/* Corner Position Choice (Strictly 4 corners) */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">
                      Posizionamento Angolo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'top_right', label: '↗ Alto Destra' },
                        { id: 'top_left', label: '↖ Alto Sinistra' },
                        { id: 'bottom_right', label: '↘ Basso Destra' },
                        { id: 'bottom_left', label: '↙ Basso Sinistra' }
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => {
                            onChangeContent({
                              nordicSwoosh: {
                                enabled: true,
                                position: pos.id as any,
                                variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                                size: 'custom',
                                customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                                opacity: content.nordicSwoosh?.opacity ?? 90
                              }
                            });
                          }}
                          className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-all ${
                            (content.nordicSwoosh?.position || 'top_right') === pos.id
                              ? 'bg-[#0D4D5E]/10 border-[#0D4D5E] text-[#0D4D5E]'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensioning / Ingrandimento Libero (Slider + Direct Input) */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Dimensione / Ingrandimento Grafica</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="50"
                          max="900"
                          value={content.nordicSwoosh?.customWidthPx || 220}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 220;
                            onChangeContent({
                              nordicSwoosh: {
                                enabled: true,
                                position: content.nordicSwoosh?.position || 'top_right',
                                variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                                size: 'custom',
                                customWidthPx: Math.max(50, Math.min(900, val)),
                                opacity: content.nordicSwoosh?.opacity ?? 90
                              }
                            });
                          }}
                          className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900 text-xs"
                        />
                        <span className="text-slate-500 font-bold">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="800"
                      step="10"
                      value={content.nordicSwoosh?.customWidthPx || 220}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onChangeContent({
                          nordicSwoosh: {
                            enabled: true,
                            position: content.nordicSwoosh?.position || 'top_right',
                            variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                            size: 'custom',
                            customWidthPx: val,
                            opacity: content.nordicSwoosh?.opacity ?? 90
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                      <span>Piccolo (60px)</span>
                      <span>Medio (220px)</span>
                      <span>Molto Grande (800px)</span>
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Trasparenza / Opacità</span>
                      <span>{content.nordicSwoosh?.opacity ?? 90}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={content.nordicSwoosh?.opacity ?? 90}
                      onChange={(e) => {
                        onChangeContent({
                          nordicSwoosh: {
                            enabled: true,
                            position: content.nordicSwoosh?.position || 'top_right',
                            variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                            size: 'custom',
                            customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                            opacity: parseInt(e.target.value)
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* HEADER WATERMARK VECTOR CURVE CONFIGURATION */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-vietnam">Filigrana Kurve Header (Sfondo)</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.ornamentCurves?.enabled ?? true}
                    onChange={(e) => {
                      onChangeContent({
                        ornamentCurves: {
                          enabled: e.target.checked,
                          opacity: content.ornamentCurves?.opacity ?? 25,
                          sizePx: content.ornamentCurves?.sizePx ?? 320
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]"></div>
                </label>
              </div>

              {(content.ornamentCurves?.enabled ?? true) && (
                <div className="space-y-4 pt-1">
                  {/* Header Watermark Size */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Larghezza Filigrana Header</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="150"
                          max="600"
                          value={content.ornamentCurves?.sizePx ?? 320}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 320;
                            onChangeContent({
                              ornamentCurves: {
                                enabled: true,
                                opacity: content.ornamentCurves?.opacity ?? 25,
                                sizePx: Math.max(150, Math.min(600, val))
                              }
                            });
                          }}
                          className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900 text-xs"
                        />
                        <span className="text-slate-500 font-bold">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="550"
                      step="10"
                      value={content.ornamentCurves?.sizePx ?? 320}
                      onChange={(e) => {
                        onChangeContent({
                          ornamentCurves: {
                            enabled: true,
                            opacity: content.ornamentCurves?.opacity ?? 25,
                            sizePx: parseInt(e.target.value)
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                  </div>

                  {/* Header Watermark Opacity */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Trasparenza Filigrana</span>
                      <span>{content.ornamentCurves?.opacity ?? 25}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={content.ornamentCurves?.opacity ?? 25}
                      onChange={(e) => {
                        onChangeContent({
                          ornamentCurves: {
                            enabled: true,
                            opacity: parseInt(e.target.value),
                            sizePx: content.ornamentCurves?.sizePx ?? 320
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEZIONE VISIBILITÀ & ATTIVAZIONE BLOCCHI */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0D4D5E]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-vietnam">Attivazione & Visibilità Sezioni / Blocchi</h4>
                </div>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  Attiva/Disattiva
                </span>
              </div>
              
              <div className="space-y-2">
                {[
                  { id: 'header', label: '1. Brand Header & Tagline Logo', icon: '📌' },
                  { id: 'bigTitle', label: '2. Titolo, Badge & Sottotitolo Documento', icon: '🏷️' },
                  { id: 'heroImage', label: '3. Immagine Hero / Foto Sfondo', icon: '🖼️' },
                  { id: 'priceTables', label: '4. Box Prezzo, Tabella o Modulo Offerta', icon: '💶' },
                  { id: 'servicesBox', label: '5. Servizi Inclusi / Inclusions Pacchetto', icon: '✨' },
                  { id: 'sportsIcons', label: '6. Strip Icone Sport & Servizi Convenzionati', icon: '🎿' },
                  { id: 'ecoBanner', label: '7. Banner Promozionale Territorio / Area', icon: '🏔️' },
                  { id: 'qrCode', label: '8. Modulo Contatti & QR Code', icon: '📲' },
                  { id: 'footer', label: '9. Brand Footer Istituzionale', icon: '⚓' }
                ].map((block) => {
                  const isVisible = (currentVis as any)[block.id] !== false;
                  return (
                    <div key={block.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span>{block.icon}</span>
                        <span>{block.label}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('content')}
                          className="text-[9px] font-bold text-[#0D4D5E] hover:underline bg-[#0D4D5E]/5 px-2 py-0.5 rounded border border-[#0D4D5E]/20"
                        >
                          ✏️ Modifica Testi →
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => {
                              const updated = {
                                ...currentVis,
                                [block.id]: e.target.checked
                              };
                              onChangeContent({
                                sectionVisibility: updated,
                                visibility: updated
                              });
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0D4D5E]"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CONTENUTI & TESTI */}
        {activeTab === 'content' && (() => {
          const isPriceTable = content.layoutTemplateId === 'official_price_list' || content.layoutTemplateId === 'regional_price_list' || content.graphicStyle === 'official_price_table' || content.graphicStyle === 'official_price_table_v1';
          const isOnlineTicketModel = !isPriceTable && (
            content.layoutTemplateId === 'ticket_digital_pass' ||
            content.graphicStyle === 'online_ticket_manifesto' || 
            content.graphicStyle === 'online_ticket_manifesto_v1'
          );
          const isHotelPackageModel = content.layoutTemplateId === 'hotel_skipass_package' || (
            !isPriceTable && !isOnlineTicketModel && (
              content.graphicStyle === 'hotel_skipass_package' ||
              content.graphicStyle === 'hotel_skipass_boutique' ||
              content.graphicStyle === 'hotel_skipass_panorama' ||
              content.graphicStyle === 'hotel_skipass_compact' ||
              content.graphicStyle === 'hotel_skipass_fusion'
            )
          );
          const isTrilingualMode = content.languageMode === 'trilingual' || (!content.languageMode && isPriceTable);

          const activeLang: LanguageCode = content.activeLanguage || 'it';
          const localizedContent = getContentForLanguage(content, activeLang);
          const plt = { ...DEFAULT_PRICE_LIST_TEXTS, ...(isTrilingualMode ? content.priceListTexts : localizedContent.priceListTexts) };
          const translations = content.translations || getInitialTranslations(content);

          const handleSelectLanguage = (lang: LanguageCode) => {
            const updated = getContentForLanguage(content, lang);
            onChangeContent(updated);
          };

          const updateLangField = (field: keyof MultilingualTextSet, value: any) => {
            const allTrans = {
              ...getInitialTranslations(content),
              ...content.translations
            };
            const currentLangSet = allTrans[activeLang] || {};
            const currentPlt = currentLangSet.priceListTexts || {};

            let pltKey: string | null = null;
            if (field === 'title') pltKey = 'mainTitle';
            if (field === 'badgeText') pltKey = 'bannerTitle';
            if (field === 'subtitle') pltKey = 'subTitle';
            if (field === 'validityPeriod') pltKey = 'seasonYear';

            const updatedPlt = pltKey ? { ...currentPlt, [pltKey]: value } : currentPlt;

            const updatedLangSet: any = {
              ...currentLangSet,
              [field]: value,
              ...(pltKey ? { priceListTexts: updatedPlt } : {})
            };

            const updatedTranslations = {
              ...allTrans,
              [activeLang]: updatedLangSet
            };

            const payload: any = {
              translations: updatedTranslations,
              [field]: value
            };

            if (pltKey) {
              payload.priceListTexts = {
                ...content.priceListTexts,
                [pltKey]: value
              };
            }

            onChangeContent(payload);
          };

          const updatePlt = (key: string, val: string) => {
            const allTrans = {
              ...getInitialTranslations(content),
              ...content.translations
            };
            const currentLangSet = allTrans[activeLang] || {};
            const currentPlt = currentLangSet.priceListTexts || {};

            const updatedPlt = {
              ...currentPlt,
              [key]: val
            };

            let langField: keyof MultilingualTextSet | null = null;
            if (key === 'mainTitle') langField = 'title';
            if (key === 'bannerTitle') langField = 'badgeText';
            if (key === 'subTitle') langField = 'subtitle';
            if (key === 'seasonYear') langField = 'validityPeriod';

            const updatedLangSet: any = {
              ...currentLangSet,
              priceListTexts: updatedPlt,
              ...(langField ? { [langField]: val } : {})
            };

            const updatedTranslations = {
              ...allTrans,
              [activeLang]: updatedLangSet
            };

            const payload: any = {
              translations: updatedTranslations,
              priceListTexts: {
                ...content.priceListTexts,
                [key]: val
              }
            };

            if (langField) {
              payload[langField] = val;
            }

            onChangeContent(payload);
          };

          const currentVis = content.sectionVisibility || content.visibility || {
            header: true, heroImage: true, promotionBox: false, priceTables: true,
            servicesBox: false, ecoBanner: false, earlyBird: false, qrCode: true, disclaimer: true, footer: true
          };

          const rawOrder = activeOrderOrientation === 'portrait'
            ? (content.sectionOrderPortrait && content.sectionOrderPortrait.length > 0 ? content.sectionOrderPortrait : DEFAULT_SECTION_ORDER)
            : (content.sectionOrderLandscape && content.sectionOrderLandscape.length > 0 ? content.sectionOrderLandscape : DEFAULT_SECTION_ORDER);

          const currentOrder: FlyerSectionId[] = [
            ...rawOrder.filter(id => DEFAULT_SECTION_ORDER.includes(id)),
            ...DEFAULT_SECTION_ORDER.filter(id => !rawOrder.includes(id))
          ];

          const renderSectionHeaderBar = (secId: FlyerSectionId, title: string, icon: string) => {
            const defaultOffSections = ['earlyBird', 'promotionBox', 'servicesBox', 'ecoBanner'];
            const defaultVal = defaultOffSections.includes(secId) ? false : true;
            const isVisible = (currentVis as any)[secId] ?? defaultVal;

            const isPriceTable = content.graphicStyle === 'official_price_table' || content.graphicStyle === 'official_price_table_v1';
            const relevantSections: FlyerSectionId[] = isPriceTable
              ? ['header', 'bigTitle', 'heroImage', 'earlyBird', 'promotionBox', 'priceTables', 'servicesBox', 'sportsIcons', 'ecoBanner', 'disclaimer', 'footer']
              : DEFAULT_SECTION_ORDER;

            const activeRelevantOrder = currentOrder.filter(id => relevantSections.includes(id));
            const idx = activeRelevantOrder.indexOf(secId);
            const isFirst = idx === 0;
            const isLast = idx === activeRelevantOrder.length - 1;
            const posNumber = idx >= 0 ? idx + 1 : null;

            const handleToggle = () => {
              const updated = {
                ...currentVis,
                [secId]: !isVisible
              };
              onChangeContent({
                sectionVisibility: updated,
                visibility: updated
              });
            };

            const handleMove = (action: 'top' | 'up' | 'down' | 'bottom') => {
              const copy = [...currentOrder];
              let secIdx = copy.indexOf(secId);
              if (secIdx === -1) {
                copy.push(secId);
                secIdx = copy.length - 1;
              }
              const item = copy.splice(secIdx, 1)[0];

              if (action === 'top') {
                copy.unshift(item);
              } else if (action === 'bottom') {
                copy.push(item);
              } else if (action === 'up') {
                copy.splice(Math.max(0, secIdx - 1), 0, item);
              } else if (action === 'down') {
                copy.splice(Math.min(copy.length, secIdx + 1), 0, item);
              }

              if (activeOrderOrientation === 'portrait') {
                onChangeContent({ sectionOrderPortrait: copy });
              } else {
                onChangeContent({ sectionOrderLandscape: copy });
              }
            };

            return (
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/80 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{icon}</span>
                  <span className="font-bold text-slate-900 text-xs font-vietnam truncate">
                    {title}
                  </span>
                  {posNumber !== null && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#0D4D5E]/10 text-[#0D4D5E] shrink-0 font-vietnam" title={`Posizione #${posNumber} nella sequenza layout`}>
                      Pos. #{posNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Visibilità Switch Button */}
                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black font-vietnam flex items-center gap-1 transition-all ${
                      isVisible
                        ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                    title={isVisible ? 'Sezione Attiva (Clicca per Nascondere)' : 'Sezione Nascosta (Clicca per Attivare)'}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isVisible ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Frecce Ordinamento */}
                  <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      title="Sposta in Cima (Top)"
                      disabled={isFirst}
                      onClick={() => handleMove('top')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ChevronsUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Sposta Su"
                      disabled={isFirst}
                      onClick={() => handleMove('up')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Sposta Giù"
                      disabled={isLast}
                      onClick={() => handleMove('down')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Sposta in Fondo (Bottom)"
                      disabled={isLast}
                      onClick={() => handleMove('bottom')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ChevronsDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#0D4D5E]" />
                    Contenuti & Testi Volantino
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica i testi nelle 3 lingue (DE / IT / EN), attiva/disattiva le sezioni e regolane l'ordinamento.
                  </p>
                </div>
              </div>

              {/* BARRA SELEZIONE LINGUA DI COMPILAZIONE (DE / IT / EN) O MODALITÀ TRILINGUE */}
              {isTrilingualMode ? (
                <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-xs space-y-1.5 border border-slate-700 font-vietnam">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#AAD0D1]" />
                      <span className="font-bold text-xs tracking-wide">Documento Unico Trilingue (IT • DE • EN)</span>
                    </div>
                    <span className="text-[10px] bg-[#AAD0D1]/20 text-[#AAD0D1] font-bold px-2 py-0.5 rounded-full">
                      Modalità Trilingue Attiva
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight font-sans">
                    I listini prezzi utilizzano un unico documento con diciture trilingui/universali incorporate (IT • DE • EN). La compilazione avviene direttamente sui campi unificati.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-xs space-y-2.5 border border-slate-700 font-vietnam">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#AAD0D1]" />
                      <span className="font-bold text-xs tracking-wide">Compilazione Multilingua (3 Lingue)</span>
                    </div>
                    <span className="text-[10px] bg-[#AAD0D1]/20 text-[#AAD0D1] font-bold px-2 py-0.5 rounded-full">
                      Lingua Attiva: {activeLang.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-lg">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = activeLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleSelectLanguage(lang.code)}
                          className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-[#0D4D5E] text-white shadow-xs ring-1 ring-[#AAD0D1]'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight font-sans">
                    Stai modificando i testi per la versione <strong>{activeLang === 'de' ? 'Tedesco 🇩🇪' : activeLang === 'it' ? 'Italiano 🇮🇹' : 'Inglese 🇬🇧'}</strong>.
                  </p>
                </div>
              )}

              {/* BARRA FORMATO ORDINAMENTO (VERTICALE / ORIZZONTALE) */}
              <div className="p-2.5 bg-[#0D4D5E]/10 rounded-xl border border-[#0D4D5E]/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#0D4D5E]">
                  <Move className="w-4 h-4 text-[#0D4D5E]" />
                  <span className="text-xs font-bold font-vietnam">Ordinamento Sezioni per Formato:</span>
                </div>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveOrderOrientation('portrait')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-vietnam ${
                      activeOrderOrientation === 'portrait'
                        ? 'bg-[#0D4D5E] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-2 h-3 border border-current rounded-xs" />
                    <span>Verticale</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOrderOrientation('landscape')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-vietnam ${
                      activeOrderOrientation === 'landscape'
                        ? 'bg-[#0D4D5E] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-3 h-2 border border-current rounded-xs" />
                    <span>Orizzontale</span>
                  </button>
                </div>
              </div>

              {/* DEDICATED EXTENDED TEXT EDITOR FOR DIGITAL PASS / ONLINE TICKET */}
              {isOnlineTicketModel ? (
                <div className="space-y-3 bg-[#0D4D5E]/5 p-3.5 rounded-xl border border-[#0D4D5E]/30">
                  <div className="flex items-center justify-between pb-2 border-b border-[#0D4D5E]/20">
                    <div className="font-bold text-xs text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-[#0D4D5E]" />
                      <span>Personalizzazione Digital Pass & Tabella Regioni</span>
                    </div>
                    <span className="text-[9px] font-black bg-[#0D4D5E] text-white px-2 py-0.5 rounded font-vietnam">
                      Modello Digital Pass
                    </span>
                  </div>

                  {/* 1. SELETTORE PASS PRESET & TABELLA VALIDITÀ 8 REGIONI */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3 shadow-2xs">
                    <div className="font-extrabold text-[11px] text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center justify-between">
                      <span>🎫 Tipologia Pass & Tabella 8 Aree</span>
                    </div>

                    {/* Preset Buttons */}
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold mb-1">Seleziona Preset Modello Pass:</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const preset = DIGITAL_PASS_PRESETS.weekly_dns;
                            const activeLang = content.activeLanguage || 'it';
                            const baseContent = {
                              ...content,
                              ...preset,
                              digitalPassType: 'weekly_dns' as const,
                              selectedRegionOption: 'all',
                            };
                            onChangeContent(getContentForLanguage(baseContent, activeLang));
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[9.5px] font-black transition-all text-center leading-tight ${
                            (content.digitalPassType || 'weekly_dns') === 'weekly_dns'
                              ? 'bg-[#0D4D5E] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Settimanale DNS (900+ KM)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const preset = DIGITAL_PASS_PRESETS.daily_area;
                            const activeLang = content.activeLanguage || 'it';
                            const baseContent = {
                              ...content,
                              ...preset,
                              digitalPassType: 'daily_area' as const,
                              selectedRegionOption: content.regionId || '3_zinnen',
                            };
                            onChangeContent(getContentForLanguage(baseContent, activeLang));
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[9.5px] font-black transition-all text-center leading-tight ${
                            content.digitalPassType === 'daily_area'
                              ? 'bg-[#0D4D5E] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Giornaliero d'Area
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const preset = DIGITAL_PASS_PRESETS.weekly_area;
                            const activeLang = content.activeLanguage || 'it';
                            const baseContent = {
                              ...content,
                              ...preset,
                              digitalPassType: 'weekly_area' as const,
                              selectedRegionOption: content.regionId || 'anterselva',
                            };
                            onChangeContent(getContentForLanguage(baseContent, activeLang));
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[9.5px] font-black transition-all text-center leading-tight ${
                            content.digitalPassType === 'weekly_area'
                              ? 'bg-[#0D4D5E] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Settimanale d'Area (7G)
                        </button>
                      </div>
                    </div>

                    {/* Titolo Validità (es. Gültig • Valido • Valid) */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="block text-[9.5px] text-slate-700 font-black uppercase mb-1">
                        🏷️ Titolo Intestazione Tabella Validità (3 Lingue):
                      </label>
                      <input
                        type="text"
                        value={content.validityTitle ?? 'GÜLTIG • VALIDO • VALID'}
                        onChange={(e) => onChangeContent({ validityTitle: e.target.value })}
                        placeholder="GÜLTIG • VALIDO • VALID"
                        className="w-full px-2.5 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white focus:border-[#0D4D5E] outline-none"
                      />
                    </div>

                    {/* Table Region Highlighter Controls */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <label className="block text-[9.5px] text-slate-700 font-black uppercase">
                        📍 Evidenziazione nella Tabella delle 8 Regioni (Allegato):
                      </label>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onChangeContent({ selectedRegionOption: 'all' })}
                          className={`p-2 rounded-lg border text-left text-[10px] font-bold transition-all ${
                            (content.selectedRegionOption === 'all' || content.digitalPassType === 'weekly_dns')
                              ? 'bg-[#0D4D5E]/10 border-[#0D4D5E] text-[#0D4D5E] font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="font-extrabold">🟢 Tutte le 8 Regioni (Carosello)</div>
                          <div className="text-[8.5px] text-slate-500 font-normal">Evidenzia tutte le 8 valli</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => onChangeContent({ selectedRegionOption: content.regionId || '3_zinnen' })}
                          className={`p-2 rounded-lg border text-left text-[10px] font-bold transition-all ${
                            (content.selectedRegionOption && content.selectedRegionOption !== 'all' && content.digitalPassType !== 'weekly_dns')
                              ? 'bg-[#0D4D5E]/10 border-[#0D4D5E] text-[#0D4D5E] font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <div className="font-extrabold">🔵 Singola Area Specifica</div>
                          <div className="text-[8.5px] text-slate-500 font-normal">Evidenzia la valle selezionata</div>
                        </button>
                      </div>

                      {/* Quick Region Selector Grid */}
                      <div className="pt-1.5 space-y-1">
                        <div className="text-[8.5px] font-bold text-slate-500 uppercase">Seleziona la Valle da Evidenziare:</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {DIGITAL_PASS_REGIONS.map((reg) => {
                            const isSel = content.selectedRegionOption === reg.id || (content.selectedRegionOption !== 'all' && content.regionId === reg.id);
                            return (
                              <button
                                key={reg.id}
                                type="button"
                                onClick={() => onChangeContent({ regionId: reg.id, selectedRegionOption: reg.id })}
                                className={`px-2 py-1 rounded-md text-[9px] font-bold text-left flex items-center gap-1.5 border transition-all ${
                                  isSel
                                    ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] font-black shadow-2xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span className={`px-1 py-0.2 rounded text-[8px] font-black ${isSel ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                  {reg.number}
                                </span>
                                <span className="truncate">{reg.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. BANNER PROMOZIONALE & BANNER ECO (SPECIFICO DIGITAL PASS) */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3 shadow-2xs">
                    <div className="font-extrabold text-[11px] text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center justify-between">
                      <span>📢 Banner Promozionale & 🍃 Banner Eco</span>
                      <span className="text-[8.5px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                        Solo Digital Pass
                      </span>
                    </div>

                    {/* A. BANNER PROMOZIONALE */}
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1.5">
                          <span>📢 Banner Promozionale:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const isEnabled = !(content.promoBannerEnabled ?? false);
                            onChangeContent({ promoBannerEnabled: isEnabled });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-1 ${
                            (content.promoBannerEnabled ?? false)
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{(content.promoBannerEnabled ?? false) ? '🟢 ON' : '⚪ OFF'}</span>
                        </button>
                      </div>

                      {(content.promoBannerEnabled ?? false) && (
                        <div className="space-y-1.5 pt-1.5 border-t border-amber-200/60">
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="block text-[8.5px] font-bold text-amber-800 uppercase mb-0.5">Icona / Emoji:</label>
                              <input
                                type="text"
                                value={content.promoBannerIcon ?? '📢'}
                                onChange={(e) => onChangeContent({ promoBannerIcon: e.target.value })}
                                placeholder="📢"
                                className="w-full px-2 py-1 text-[10.5px] bg-white border border-amber-300 rounded font-bold text-slate-800 focus:outline-none text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] font-bold text-amber-800 uppercase mb-0.5">Colore Sfondo:</label>
                              <input
                                type="color"
                                value={content.promoBannerBgColor || '#FEF3C7'}
                                onChange={(e) => onChangeContent({ promoBannerBgColor: e.target.value })}
                                className="w-full h-7 p-0.5 bg-white border border-amber-300 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] font-bold text-amber-800 uppercase mb-0.5">Colore Testo:</label>
                              <input
                                type="color"
                                value={content.promoBannerTextColor || '#78350F'}
                                onChange={(e) => onChangeContent({ promoBannerTextColor: e.target.value })}
                                className="w-full h-7 p-0.5 bg-white border border-amber-300 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-amber-800 uppercase mb-0.5">Titolo Banner Promo:</label>
                            <input
                              type="text"
                              value={content.promoBannerTitle ?? 'OFFERTA PROMOZIONALE ONLINE'}
                              onChange={(e) => onChangeContent({ promoBannerTitle: e.target.value })}
                              placeholder="es. OFFERTA PROMOZIONALE"
                              className="w-full px-2.5 py-1 text-[10.5px] bg-white border border-amber-300 rounded font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-amber-800 uppercase mb-0.5">Messaggio / Dettagli Promo:</label>
                            <input
                              type="text"
                              value={content.promoBannerText ?? 'Presenta il tuo Digital Pass nei centri e negozi convenzionati per vantaggi esclusivi.'}
                              onChange={(e) => onChangeContent({ promoBannerText: e.target.value })}
                              placeholder="es. Descrizione offerta..."
                              className="w-full px-2.5 py-1 text-[10.5px] bg-white border border-amber-300 rounded font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-amber-800 uppercase mb-0.5">Badge / Etichetta Promo:</label>
                            <input
                              type="text"
                              value={content.promoBannerBadge ?? 'PROMO ONLINE'}
                              onChange={(e) => onChangeContent({ promoBannerBadge: e.target.value })}
                              placeholder="es. PROMO ONLINE"
                              className="w-full px-2.5 py-1 text-[10.5px] bg-white border border-amber-300 rounded font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* B. BANNER ECO */}
                    <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-emerald-900 flex items-center gap-1.5">
                          <span>🍃 Banner Eco & Green Mobility:</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const isEnabled = !(content.ecoBannerEnabled ?? false);
                            onChangeContent({ ecoBannerEnabled: isEnabled });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-1 ${
                            (content.ecoBannerEnabled ?? false)
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{(content.ecoBannerEnabled ?? false) ? '🟢 ON' : '⚪ OFF'}</span>
                        </button>
                      </div>

                      {(content.ecoBannerEnabled ?? false) && (
                        <div className="space-y-1.5 pt-1.5 border-t border-emerald-200/60">
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="block text-[8.5px] font-bold text-emerald-800 uppercase mb-0.5">Icona / Emoji:</label>
                              <input
                                type="text"
                                value={content.ecoBannerIcon ?? '🍃'}
                                onChange={(e) => onChangeContent({ ecoBannerIcon: e.target.value })}
                                placeholder="🍃"
                                className="w-full px-2 py-1 text-[10.5px] bg-white border border-emerald-300 rounded font-bold text-slate-800 focus:outline-none text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] font-bold text-emerald-800 uppercase mb-0.5">Colore Sfondo:</label>
                              <input
                                type="color"
                                value={content.ecoBannerBgColor || '#065F46'}
                                onChange={(e) => onChangeContent({ ecoBannerBgColor: e.target.value })}
                                className="w-full h-7 p-0.5 bg-white border border-emerald-300 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] font-bold text-emerald-800 uppercase mb-0.5">Colore Testo:</label>
                              <input
                                type="color"
                                value={content.ecoBannerTextColor || '#FFFFFF'}
                                onChange={(e) => onChangeContent({ ecoBannerTextColor: e.target.value })}
                                className="w-full h-7 p-0.5 bg-white border border-emerald-300 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-emerald-800 uppercase mb-0.5">Titolo Banner Eco:</label>
                            <input
                              type="text"
                              value={content.ecoBannerTitle ?? 'GREEN MOBILITY & ECO PASS'}
                              onChange={(e) => onChangeContent({ ecoBannerTitle: e.target.value })}
                              placeholder="es. GREEN MOBILITY & ECO PASS"
                              className="w-full px-2.5 py-1 text-[10.5px] bg-white border border-emerald-300 rounded font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-emerald-800 uppercase mb-0.5">Messaggio Eco / Trasporti:</label>
                            <input
                              type="text"
                              value={content.ecoBannerText ?? 'Questo Digital Pass è 100% paperless e include la mobilità Ski Bus gratuita della valle.'}
                              onChange={(e) => onChangeContent({ ecoBannerText: e.target.value })}
                              placeholder="es. Descrizione sostenibilità..."
                              className="w-full px-2.5 py-1 text-[10.5px] bg-white border border-emerald-300 rounded font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] font-bold text-emerald-800 uppercase mb-0.5">Tagline Eco:</label>
                            <input
                              type="text"
                              value={content.ecoBannerTagline ?? '100% ECO-FRIENDLY'}
                              onChange={(e) => onChangeContent({ ecoBannerTagline: e.target.value })}
                              placeholder="es. 100% ECO-FRIENDLY"
                              className="w-full px-2.5 py-1 text-[10.5px] bg-white border border-emerald-300 rounded font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1. HEADER & TAGLINE SECTION */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.header !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('header', '1. Header Brand & Tagline Logo', '📌')}
                    {currentVis.header !== false ? (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Tagline Superiore Header</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.headerTagline ?? content.headerTagline ?? 'DIGITAL PASS'}
                            onChange={(e) => updateLangField('headerTagline', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-[#0D4D5E]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Header disattivato. Attivala con lo switch.</p>
                    )}
                  </div>

                  {/* 2. TITOLO TICKET, BADGE & SOTTOTITOLO (BIG TITLE) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.bigTitle !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('bigTitle', '2. Titolo Ticket, Badge & Sottotitolo', '🏷️')}
                    {currentVis.bigTitle !== false ? (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Principale Ticket</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.title ?? content.title ?? ''}
                            onChange={(e) => updateLangField('title', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-black text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Sottotitolo / Descrizione Validità</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.subtitle ?? content.subtitle ?? ''}
                            onChange={(e) => updateLangField('subtitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Badge / Etichetta Tipo Ticket</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.badgeText ?? content.badgeText ?? ''}
                              onChange={(e) => updateLangField('badgeText', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-[#0D4D5E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Anno / Stagione Validità</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.validityPeriod ?? content.validityPeriod ?? '2026/27'}
                              onChange={(e) => updateLangField('validityPeriod', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Titolo ticket disattivato. Attivalo con lo switch.</p>
                    )}
                  </div>

                  {/* IMMAGINE HERO SOTTO L'HEADER */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.heroImage !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('heroImage', 'Foto Hero & Immagine sotto Header', '🖼️')}
                    {currentVis.heroImage !== false ? (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-1">URL Immagine / Foto Hero</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={content.heroImageUrl || ''}
                              onChange={(e) => onChangeContent({ heroImageUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10.5px] text-slate-800 focus:outline-none focus:border-[#0D4D5E]"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all shadow-2xs"
                            >
                              <Upload className="w-3 h-3 text-[#AAD0D1]" />
                              <span>Carica</span>
                            </button>
                          </div>
                        </div>

                        {/* Galleria rapida foto di esempio */}
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Seleziona Immagine di Esempio:</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {STOCK_IMAGES.slice(0, 4).map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => onChangeContent({ heroImageUrl: img.url })}
                                className={`relative h-11 rounded overflow-hidden border-2 transition-all ${
                                  content.heroImageUrl === img.url ? 'border-[#0D4D5E] ring-2 ring-[#0D4D5E]/30 scale-95' : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Controllo Altezza Personalizzata */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                            <span>Altezza Immagine (Px):</span>
                            <span className="text-[#0D4D5E]">
                              {content.heroImageHeightPx ? `${content.heroImageHeightPx} px` : 'Auto (Standard 120px)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={60}
                              max={240}
                              step={10}
                              value={content.heroImageHeightPx || 120}
                              onChange={(e) => onChangeContent({ heroImageHeightPx: parseInt(e.target.value) })}
                              className="w-full accent-[#0D4D5E]"
                            />
                            {content.heroImageHeightPx && (
                              <button
                                type="button"
                                onClick={() => onChangeContent({ heroImageHeightPx: undefined })}
                                className="text-[8.5px] text-slate-500 hover:text-red-600 underline font-bold shrink-0"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Immagine Hero disattivata. Attivala con lo switch.</p>
                    )}
                  </div>

                  {/* 3. DETTAGLI TAGLIANDO & INTESTATARIO (COUPON DETAILS) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.promotionBox !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('promotionBox', 'Dettagli Tagliando & Intestatario Pass', '🎫')}
                    {currentVis.promotionBox !== false ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Nome e Cognome Intestatario</label>
                            <input
                              type="text"
                              value={content.holderName || 'Mario Rossi'}
                              onChange={(e) => updateLangField('holderName', e.target.value)}
                              placeholder="Mario Rossi"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Data Emissione Pass</label>
                            <input
                              type="text"
                              value={content.issueDate || '15.12.2026'}
                              onChange={(e) => updateLangField('issueDate', e.target.value)}
                              placeholder="15.12.2026"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Codice Seriale Ticket / Ticket ID</label>
                          <input
                            type="text"
                            value={content.addressInfo || ''}
                            onChange={(e) => updateLangField('addressInfo', e.target.value)}
                            placeholder="Consorzio Dolomiti NordicSki - Ticket ID #TK-2026-DNS8K-09923"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-mono"
                          />
                        </div>

                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                          <span className="text-[9.5px] font-black text-[#0D4D5E] uppercase block">Dettagli Prezzo e Tariffa:</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            <div>
                              <label className="block text-[8px] text-slate-500 font-bold">Prefisso</label>
                              <input
                                type="text"
                                value={content.pricePrefix || 'TARIFFA'}
                                onChange={(e) => updateLangField('pricePrefix', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-slate-500 font-bold">Importo</label>
                              <input
                                type="text"
                                value={content.priceAmount || ''}
                                onChange={(e) => onChangeContent({ priceAmount: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#0D4D5E]"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-slate-500 font-bold">Valuta</label>
                              <input
                                type="text"
                                value={content.priceCurrency || '€'}
                                onChange={(e) => onChangeContent({ priceCurrency: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] text-slate-500 font-bold">Suffisso</label>
                              <input
                                type="text"
                                value={content.priceSuffix || ''}
                                onChange={(e) => updateLangField('priceSuffix', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Tagliando disattivato. Attivalo con lo switch.</p>
                    )}
                  </div>

                  {/* 4. SPECIFICHE & CONDIZIONI DEL PASS (FEATURES LIST) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.features !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('features', 'Specifiche e Inclusioni Pass', '📋')}
                    {currentVis.features !== false ? (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Sezione Specifiche</label>
                          <input
                            type="text"
                            value={content.featuresTitle || 'Specifiche Settimanale Carosello 8 Valli:'}
                            onChange={(e) => updateLangField('featuresTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-[#0D4D5E]"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {(content.features || []).map((feat, idx) => (
                            <div key={feat.id || idx} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                              <input
                                type="checkbox"
                                checked={feat.highlight || false}
                                onChange={(e) => {
                                  const newFeats = [...(content.features || [])];
                                  newFeats[idx] = { ...newFeats[idx], highlight: e.target.checked };
                                  updateLangField('features', newFeats);
                                }}
                                title="Evidenzia con colore di sfondo"
                                className="rounded border-slate-300 text-[#0D4D5E] focus:ring-[#0D4D5E]"
                              />
                              <input
                                type="text"
                                value={feat.text}
                                onChange={(e) => {
                                  const newFeats = [...(content.features || [])];
                                  newFeats[idx] = { ...newFeats[idx], text: e.target.value };
                                  updateLangField('features', newFeats);
                                }}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione specifiche disattivata. Attivala con lo switch.</p>
                    )}
                  </div>

                  {/* 5. VERIFICA TICKET & CONTROLLO VARCHI */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.turnstileNote !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('turnstileNote', 'Verifica Ticket & Varchi Automatici', '🔍')}
                    {currentVis.turnstileNote !== false ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Status Ticket</label>
                            <input
                              type="text"
                              value={content.ticketStatus || 'VALIDO / VALID / GÜLTIG'}
                              onChange={(e) => updateLangField('ticketStatus', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-emerald-700"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Emettitore / Region Issuer</label>
                            <input
                              type="text"
                              value={content.issuerName || content.location || '3 Zinnen Dolomites / Consorzio DNS'}
                              onChange={(e) => updateLangField('issuerName', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-[#0D4D5E]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Istruzioni Varchi e Tornelli</label>
                          <textarea
                            rows={2}
                            value={content.turnstileNote || 'Istruzioni ai varchi: Accostare il QR Code al lettore ottico dei tornelli per convalidare l\'accesso alle piste.'}
                            onChange={(e) => updateLangField('turnstileNote', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione varchi disattivata. Attivala con lo switch.</p>
                    )}
                  </div>

                  {/* 6. NOTE LEGALI & DISCLAIMER (TRILINGUE) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.disclaimer !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('disclaimer', 'Note Legali & Disclaimer Ufficiali', '📜')}
                    {currentVis.disclaimer !== false ? (
                      <div className="space-y-1.5 pt-1">
                        <div>
                          <label className="block text-[8.5px] text-slate-500 font-bold">Disclaimer Italiano (IT)</label>
                          <textarea
                            rows={2}
                            value={plt.disclaimerIt ?? 'Nessun rimborso in caso di interruzioni di servizio. Nessuna garanzia sulla praticabilità di tutte le piste.'}
                            onChange={(e) => updatePlt('disclaimerIt', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[9.5px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] text-slate-500 font-bold">Disclaimer Tedesco (DE)</label>
                          <textarea
                            rows={2}
                            value={plt.disclaimerDe ?? 'Keine Rückerstattung bei Betriebsunterbrechungen jeglicher Art. Keine Garantie für Befahrbarkeit aller Loipen.'}
                            onChange={(e) => updatePlt('disclaimerDe', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[9.5px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[8.5px] text-slate-500 font-bold">Disclaimer Inglese (EN)</label>
                          <textarea
                            rows={2}
                            value={plt.disclaimerEn ?? 'No refund in case of service interruptions of any kind. No guarantee that all trails are open.'}
                            onChange={(e) => updatePlt('disclaimerEn', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[9.5px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Note legali disattivate. Attivale con lo switch.</p>
                    )}
                  </div>

                  {/* 7. FOOTER BRAND & CONTATTI & NETWORK (Identico a quello dei Listini Prezzi) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.footer !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('footer', 'Piè di Pagina (Footer Brand, Contatti & QR Code)', '🦶')}
                    {currentVis.footer !== false ? (
                      <div className="space-y-2.5 pt-1">
                        {/* Modalità Footer */}
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Info Visualizzate</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  mode: 'dns'
                                }
                              })}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                (content.footerConfig?.mode || 'dns') === 'dns'
                                  ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Dolomiti NordicSki
                            </button>
                            <button
                              type="button"
                              onClick={() => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  mode: 'custom_area'
                                }
                              })}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                content.footerConfig?.mode === 'custom_area'
                                  ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Info Area Personalizzata
                            </button>
                          </div>
                        </div>

                        {/* Badge Biglietto Online */}
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Badge Promozionale Container</label>
                          <input
                            type="text"
                            value={content.footerConfig?.ticketBadgeText ?? 'ACQUISTA IL BIGLIETTO DIGITALE ONLINE'}
                            onChange={(e) => onChangeContent({
                              footerConfig: {
                                ...(content.footerConfig || {}),
                                ticketBadgeText: e.target.value
                              }
                            })}
                            placeholder="ACQUISTA IL BIGLIETTO DIGITALE ONLINE"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                          />
                        </div>

                        {/* Sito Web Footer */}
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Sito Web Footer</label>
                          <input
                            type="text"
                            value={content.footerConfig?.websiteUrl ?? content.websiteUrl ?? 'www.dolomitinordicski.com'}
                            onChange={(e) => {
                              const val = e.target.value;
                              onChangeContent({
                                websiteUrl: val,
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  websiteUrl: val
                                }
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-black text-[#0D4D5E]"
                          />
                        </div>

                        {/* Contatti (Telefono + Email) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Telefono Footer</label>
                            <input
                              type="text"
                              value={content.footerConfig?.phone ?? content.contactPhone ?? '+39 0474 913156'}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChangeContent({
                                  contactPhone: val,
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    phone: val
                                  }
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Email Footer</label>
                            <input
                              type="text"
                              value={content.footerConfig?.email ?? content.contactEmail ?? 'info@dolomitinordicski.com'}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChangeContent({
                                  contactEmail: val,
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    email: val
                                  }
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                            />
                          </div>
                        </div>

                        {/* Switch QR Code nel Container Footer */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-[10px] font-bold text-slate-700">Includi QR Code nel Box Footer</span>
                            <input
                              type="checkbox"
                              checked={content.footerConfig?.embedQrCode !== false}
                              onChange={(e) => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  embedQrCode: e.target.checked
                                }
                              })}
                              className="rounded border-slate-300 text-[#0D4D5E] focus:ring-[#0D4D5E]"
                            />
                          </label>
                          {content.footerConfig?.embedQrCode !== false && (
                            <div>
                              <label className="block text-[8.5px] text-slate-500 font-bold">Testo Sotto QR Code</label>
                              <input
                                type="text"
                                value={content.footerConfig?.qrScanLabel ?? 'SCANSIONA PER...'}
                                onChange={(e) => onChangeContent({
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    qrScanLabel: e.target.value
                                  }
                                })}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] font-bold"
                              />
                            </div>
                          )}
                        </div>

                        {/* Striscia Inferiore Network Bar */}
                        <div className="border-t pt-2 space-y-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Slogan / Copyright Striscia Inferiore</label>
                            <input
                              type="text"
                              value={content.footerConfig?.networkSlogan ?? plt.footerText ?? '8 GEBIETE / AREE = 1 NETWORK'}
                              onChange={(e) => {
                                const val = e.target.value;
                                updatePlt('footerText', val);
                                onChangeContent({
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    networkSlogan: val
                                  }
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Elenco Aree Striscia Inferiore</label>
                            <input
                              type="text"
                              value={content.footerConfig?.networkAreasList ?? '01 ALTABADIA • 02 VAL GARDENA • 03 ALPE DI SIUSI • 04 3 CIME DOLOMITI • 05 VAL DI FASSA • 06 VAL DI FIEMME • 07 SAN MARTINO • 08 CORTINA'}
                              onChange={(e) => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  networkAreasList: e.target.value
                                }
                              })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[9.5px]"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Footer disattivato. Attivalo con lo switch.</p>
                    )}
                  </div>
                </div>
              ) : isPriceTable ? (
                <div className="space-y-3 bg-[#0D4D5E]/5 p-3.5 rounded-xl border border-[#0D4D5E]/30">
                  <div className="flex items-center justify-between pb-2 border-b border-[#0D4D5E]/20">
                    <div className="font-bold text-xs text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0D4D5E]" />
                      <span>Personalizzazione Tutti i Testi Listino Prezzi</span>
                    </div>
                    <span className="text-[9px] font-black bg-[#0D4D5E] text-white px-2 py-0.5 rounded font-vietnam">
                      Struttura Unificata
                    </span>
                  </div>

                  {/* Header (Logo & Partner Block) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.header !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('header', 'Header (Logo & Partner)', '📌')}
                    {currentVis.header !== false ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Anno / Stagione Header</label>
                            <input
                              type="text"
                              value={plt.seasonYear ?? DEFAULT_PRICE_LIST_TEXTS.seasonYear}
                              onChange={(e) => updatePlt('seasonYear', e.target.value)}
                              placeholder="2026/27"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Tagline Superiore Header</label>
                            <input
                              type="text"
                              value={content.headerTagline || ''}
                              onChange={(e) => updateLangField('headerTagline', e.target.value)}
                              placeholder="DOLOMITI NORDICSKI"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Tagline Listino / Badge (es. Tariffe e listino ufficiale)</label>
                          <input
                            type="text"
                            value={plt.bannerTitle ?? content.badgeText ?? DEFAULT_PRICE_LIST_TEXTS.bannerTitle}
                            onChange={(e) => updatePlt('bannerTitle', e.target.value)}
                            placeholder="TARIFFE E LISTINO UFFICIALE 2026/27"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-[#0D4D5E]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* IMMAGINE HERO SOTTO L'HEADER (PREZZI) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.heroImage !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('heroImage', 'Foto Hero & Immagine sotto Header', '🖼️')}
                    {currentVis.heroImage !== false ? (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-1">Badge Sovrapposto / Testo Banner</label>
                          <input
                            type="text"
                            value={plt.bannerTitle ?? DEFAULT_PRICE_LIST_TEXTS.bannerTitle}
                            onChange={(e) => updatePlt('bannerTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-[10.5px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-1">URL Immagine / Foto Hero</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={content.heroImageUrl || ''}
                              onChange={(e) => onChangeContent({ heroImageUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10.5px] text-slate-800 focus:outline-none focus:border-[#0D4D5E]"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all shadow-2xs"
                            >
                              <Upload className="w-3 h-3 text-[#AAD0D1]" />
                              <span>Carica</span>
                            </button>
                          </div>
                        </div>

                        {/* Galleria rapida foto di esempio */}
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Seleziona Immagine di Esempio:</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {STOCK_IMAGES.slice(0, 4).map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => onChangeContent({ heroImageUrl: img.url })}
                                className={`relative h-11 rounded overflow-hidden border-2 transition-all ${
                                  content.heroImageUrl === img.url ? 'border-[#0D4D5E] ring-2 ring-[#0D4D5E]/30 scale-95' : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Controllo Altezza Personalizzata */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                            <span>Altezza Immagine (Px):</span>
                            <span className="text-[#0D4D5E]">
                              {content.heroImageHeightPx ? `${content.heroImageHeightPx} px` : 'Auto (Standard 140px)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={60}
                              max={280}
                              step={10}
                              value={content.heroImageHeightPx || 140}
                              onChange={(e) => onChangeContent({ heroImageHeightPx: parseInt(e.target.value) })}
                              className="w-full accent-[#0D4D5E]"
                            />
                            {content.heroImageHeightPx && (
                              <button
                                type="button"
                                onClick={() => onChangeContent({ heroImageHeightPx: undefined })}
                                className="text-[8.5px] text-slate-500 hover:text-red-600 underline font-bold shrink-0"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Foto Hero disattivata. Attivala con lo switch.</p>
                    )}
                  </div>

                  {/* Blocco Icone Sportive */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.sportsIcons !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('sportsIcons', 'Blocco Icone Sportive & Servizi', '🏋️')}
                    {currentVis.sportsIcons !== false ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[10px] font-bold text-slate-700 block">
                              Icone attive sul listino:
                            </span>
                            <span className="text-[11px] font-black text-[#0D4D5E]">
                              {content.selectedSportsIcons?.length || 0} / 6 Selezionate
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('icons')}
                            className="px-2.5 py-1.5 bg-[#0D4D5E] text-white rounded-xl text-[10px] font-bold hover:bg-[#072F3A] transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span>Gestisci Libreria Icone →</span>
                          </button>
                        </div>

                        {/* Quick preview of selected icons */}
                        {content.selectedSportsIcons && content.selectedSportsIcons.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {content.selectedSportsIcons.map(iconId => {
                              const iconObj = getAllSportsIcons(customFirestoreIcons).find(i => i.id === iconId);
                              if (!iconObj) return null;
                              return (
                                <span key={iconId} className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-slate-200">
                                  <WireframeIcon icon={iconObj} className="w-3.5 h-3.5 text-[#0D4D5E]" />
                                  <span>{getSportsIconName(iconObj, content.activeLanguage || 'it')}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                            Nessuna icona selezionata. Clicca "Gestisci Libreria Icone" per sceglierne fino a 6.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per mostrare il blocco icone sportive sulla grafica.</p>
                    )}
                  </div>

                  {/* Titolo Principale Documento (Big Title Block) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.bigTitle !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('bigTitle', 'Titolo Principale (Big Title)', '🏷️')}
                    {currentVis.bigTitle !== false ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Badge Pill (Sopra Titolo)</label>
                            <input
                              type="text"
                              value={plt.bannerTitle ?? content.badgeText ?? DEFAULT_PRICE_LIST_TEXTS.bannerTitle}
                              onChange={(e) => updatePlt('bannerTitle', e.target.value)}
                              placeholder="PRICELIST & TICKETS • PREZZI & TICKET"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Anno / Validità</label>
                            <input
                              type="text"
                              value={plt.seasonYear ?? content.validityPeriod ?? DEFAULT_PRICE_LIST_TEXTS.seasonYear}
                              onChange={(e) => updatePlt('seasonYear', e.target.value)}
                              placeholder="2026/27"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Principale Documento</label>
                          <input
                            type="text"
                            value={plt.mainTitle ?? content.title ?? DEFAULT_PRICE_LIST_TEXTS.mainTitle}
                            onChange={(e) => updatePlt('mainTitle', e.target.value)}
                            placeholder="PRICES & INFORMATION"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-black text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Sottotitolo Descrizione Trilingue</label>
                          <textarea
                            rows={2}
                            value={plt.subTitle ?? content.subtitle ?? DEFAULT_PRICE_LIST_TEXTS.subTitle}
                            onChange={(e) => updatePlt('subTitle', e.target.value)}
                            placeholder="900+ km Loipen / Piste / Tracks..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10.5px] font-medium text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Località / Tag Heritage</label>
                          <input
                            type="text"
                            value={content.location ?? 'Dolomiti UNESCO World Heritage'}
                            onChange={(e) => updateLangField('location', e.target.value)}
                            placeholder="Dolomiti UNESCO World Heritage"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10.5px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Banner Prevendita / Offerta Early Bird */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.earlyBird !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('earlyBird', 'Banner Prevendita / Offerta Early Bird', '%')}
                    {currentVis.earlyBird !== false ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Etichetta Prevendita</label>
                            <input
                              type="text"
                              value={plt.earlyBirdLabel ?? DEFAULT_PRICE_LIST_TEXTS.earlyBirdLabel}
                              onChange={(e) => updatePlt('earlyBirdLabel', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Sconto & Scadenza</label>
                            <input
                              type="text"
                              value={plt.earlyBirdDiscount ?? DEFAULT_PRICE_LIST_TEXTS.earlyBirdDiscount}
                              onChange={(e) => updatePlt('earlyBirdDiscount', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Dettaglio / Sotto-etichetta Prevendita</label>
                          <input
                            type="text"
                            value={plt.earlyBirdSub ?? DEFAULT_PRICE_LIST_TEXTS.earlyBirdSub}
                            onChange={(e) => updatePlt('earlyBirdSub', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Promozione & Offerta Pacchetto (Promotion Block) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.promotionBox !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('promotionBox', 'Promozione & Offerta Pacchetto', '🏷️')}
                    {currentVis.promotionBox !== false ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[8.5px] text-slate-500 font-bold">Etichetta / Prefisso</label>
                            <input
                              type="text"
                              value={content.pricePrefix || ''}
                              onChange={(e) => updateLangField('pricePrefix', e.target.value)}
                              placeholder="OFFERTA PACCHETTO"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] text-slate-500 font-bold">Importo Prezzo</label>
                            <input
                              type="text"
                              value={content.priceAmount || ''}
                              onChange={(e) => onChangeContent({ priceAmount: e.target.value })}
                              placeholder="es. 289"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[8.5px] text-slate-500 font-bold">Valuta</label>
                            <input
                              type="text"
                              value={content.priceCurrency || '€'}
                              onChange={(e) => onChangeContent({ priceCurrency: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[8.5px] text-slate-500 font-bold mb-0.5">Suffisso Prezzo (es. a persona / 7 giorni)</label>
                          <input
                            type="text"
                            value={content.priceSuffix || ''}
                            onChange={(e) => updateLangField('priceSuffix', e.target.value)}
                            placeholder="a persona / per 7 giorni"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[8.5px] text-slate-500 font-bold mb-0.5">Note & Condizioni Offerta</label>
                          <input
                            type="text"
                            value={content.priceNote || ''}
                            onChange={(e) => updateLangField('priceNote', e.target.value)}
                            placeholder="es. Inclusi 7 giorni di skipass e navetta gratuita"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Tabelle Prezzi (Area Singola e Carosello 8 Aree) */}
                  <div className={`space-y-3 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.priceTables !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('priceTables', 'Tabelle Prezzi (Area Singola e Carosello)', '📊')}
                    {currentVis.priceTables !== false ? (
                      <>
                        {/* PARTE A: AREA SINGOLA (REGIONALE) */}
                        <div className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] font-black uppercase text-[#0D4D5E] tracking-wide block">
                            A. Tabella Area Singola (Regionale)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Etichetta Header</label>
                              <input
                                type="text"
                                value={plt.regionalHeader ?? DEFAULT_PRICE_LIST_TEXTS.regionalHeader}
                                onChange={(e) => updatePlt('regionalHeader', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Nome Area (Sostitutivo)</label>
                              <input
                                type="text"
                                value={content.customRegionName ?? ''}
                                onChange={(e) => onChangeContent({ customRegionName: e.target.value })}
                                placeholder="es. Alta Badia (o auto da logo)"
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                              />
                            </div>
                          </div>

                          {/* Giornaliero */}
                          <div className="grid grid-cols-12 gap-1.5 pt-1.5 border-t border-slate-200/60">
                            <div className="col-span-5">
                              <label className="block text-[9px] text-slate-500 font-bold">Giornaliero Titolo</label>
                              <input
                                type="text"
                                value={plt.regionalDayTitle ?? DEFAULT_PRICE_LIST_TEXTS.regionalDayTitle}
                                onChange={(e) => updatePlt('regionalDayTitle', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                              />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                              <input
                                type="text"
                                value={plt.regionalDaySub ?? DEFAULT_PRICE_LIST_TEXTS.regionalDaySub}
                                onChange={(e) => updatePlt('regionalDaySub', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                              <input
                                type="text"
                                value={plt.regionalDayPrice ?? DEFAULT_PRICE_LIST_TEXTS.regionalDayPrice}
                                onChange={(e) => updatePlt('regionalDayPrice', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                              />
                            </div>
                          </div>

                          {/* Settimanale */}
                          <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-200/60">
                            <div className="col-span-5">
                              <label className="block text-[9px] text-slate-500 font-bold">Settimanale Titolo</label>
                              <input
                                type="text"
                                value={plt.regionalWeekTitle ?? DEFAULT_PRICE_LIST_TEXTS.regionalWeekTitle}
                                onChange={(e) => updatePlt('regionalWeekTitle', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                              />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                              <input
                                type="text"
                                value={plt.regionalWeekSub ?? DEFAULT_PRICE_LIST_TEXTS.regionalWeekSub}
                                onChange={(e) => updatePlt('regionalWeekSub', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                              <input
                                type="text"
                                value={plt.regionalWeekPrice ?? DEFAULT_PRICE_LIST_TEXTS.regionalWeekPrice}
                                onChange={(e) => updatePlt('regionalWeekPrice', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                              />
                            </div>
                          </div>

                          {/* Stagionale */}
                          <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-200/60">
                            <div className="col-span-5">
                              <label className="block text-[9px] text-slate-500 font-bold">Stagionale Titolo</label>
                              <input
                                type="text"
                                value={plt.regionalSeasonTitle ?? DEFAULT_PRICE_LIST_TEXTS.regionalSeasonTitle}
                                onChange={(e) => updatePlt('regionalSeasonTitle', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                              />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                              <input
                                type="text"
                                value={plt.regionalSeasonSub ?? DEFAULT_PRICE_LIST_TEXTS.regionalSeasonSub}
                                onChange={(e) => updatePlt('regionalSeasonSub', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                              <input
                                type="text"
                                value={plt.regionalSeasonPrice ?? DEFAULT_PRICE_LIST_TEXTS.regionalSeasonPrice}
                                onChange={(e) => updatePlt('regionalSeasonPrice', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                              />
                            </div>
                          </div>
                        </div>

                        {/* PARTE B: CAROSELLO DOLOMITI NORDICSKI */}
                        <div className="space-y-1.5 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] font-black uppercase text-[#0D4D5E] tracking-wide block">
                            B. Tabella Carosello Dolomiti NordicSki (8 Aree / 900+ km)
                          </span>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Header Tabella Carosello</label>
                            <input
                              type="text"
                              value={plt.carouselHeader ?? DEFAULT_PRICE_LIST_TEXTS.carouselHeader}
                              onChange={(e) => updatePlt('carouselHeader', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>

                          {/* Settimanale Carosello */}
                          <div className="grid grid-cols-12 gap-1.5 pt-1.5 border-t border-slate-200/60">
                            <div className="col-span-5">
                              <label className="block text-[9px] text-slate-500 font-bold">Settimanale Titolo</label>
                              <input
                                type="text"
                                value={plt.carouselWeekTitle ?? DEFAULT_PRICE_LIST_TEXTS.carouselWeekTitle}
                                onChange={(e) => updatePlt('carouselWeekTitle', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                              />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                              <input
                                type="text"
                                value={plt.carouselWeekSub ?? DEFAULT_PRICE_LIST_TEXTS.carouselWeekSub}
                                onChange={(e) => updatePlt('carouselWeekSub', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                              <input
                                type="text"
                                value={plt.carouselWeekPrice ?? DEFAULT_PRICE_LIST_TEXTS.carouselWeekPrice}
                                onChange={(e) => updatePlt('carouselWeekPrice', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                              />
                            </div>
                          </div>

                          {/* Stagionale Carosello */}
                          <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-200/60">
                            <div className="col-span-5">
                              <label className="block text-[9px] text-slate-500 font-bold">Stagionale Titolo</label>
                              <input
                                type="text"
                                value={plt.carouselSeasonTitle ?? DEFAULT_PRICE_LIST_TEXTS.carouselSeasonTitle}
                                onChange={(e) => updatePlt('carouselSeasonTitle', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                              />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                              <input
                                type="text"
                                value={plt.carouselSeasonSub ?? DEFAULT_PRICE_LIST_TEXTS.carouselSeasonSub}
                                onChange={(e) => updatePlt('carouselSeasonSub', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                              />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                              <input
                                type="text"
                                value={plt.carouselSeasonPrice ?? DEFAULT_PRICE_LIST_TEXTS.carouselSeasonPrice}
                                onChange={(e) => updatePlt('carouselSeasonPrice', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mt-1">Nota Asterisco Prezzi Autonomi</label>
                          <input
                            type="text"
                            value={plt.regionalNote ?? DEFAULT_PRICE_LIST_TEXTS.regionalNote}
                            onChange={(e) => updatePlt('regionalNote', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] italic"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Box Info & Servizi */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.servicesBox !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('servicesBox', 'Box Info & Servizi', '⭐')}
                    {currentVis.servicesBox !== false ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Box Info</label>
                            <input
                              type="text"
                              value={plt.infoServicesHeader ?? DEFAULT_PRICE_LIST_TEXTS.infoServicesHeader}
                              onChange={(e) => updatePlt('infoServicesHeader', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Tag Anno / Validità</label>
                            <input
                              type="text"
                              value={content.validityPeriod || plt.seasonYear || '2026/27'}
                              onChange={(e) => onChangeContent({ validityPeriod: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Info 1 (es. Bambini Gratuiti)</label>
                          <input
                            type="text"
                            value={plt.infoKidsText ?? DEFAULT_PRICE_LIST_TEXTS.infoKidsText}
                            onChange={(e) => updatePlt('infoKidsText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Info 2 (es. Scuole Sci & Noleggi)</label>
                          <input
                            type="text"
                            value={plt.infoSchoolsText ?? DEFAULT_PRICE_LIST_TEXTS.infoSchoolsText}
                            onChange={(e) => updatePlt('infoSchoolsText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>

                        {/* Additional Service Lines / Features */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[9px] text-slate-700 font-black uppercase font-vietnam tracking-wider">
                              Inclusioni & Punti Elenco Box Info
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newFeat = { id: Date.now().toString(), text: 'Nuova voce / servizio' };
                                onChangeContent({ features: [...(content.features || []), newFeat] });
                              }}
                              className="px-2 py-0.5 bg-[#0D4D5E] text-white rounded text-[9px] font-bold flex items-center gap-1 hover:bg-[#0D4D5E]/90 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Aggiungi Voce</span>
                            </button>
                          </div>

                          {content.features && content.features.length > 0 ? (
                            <div className="space-y-1.5">
                              {content.features.map((feat) => (
                                <div key={feat.id} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                                  <input
                                    type="text"
                                    value={feat.text}
                                    onChange={(e) => {
                                      const updated = (content.features || []).map(f => f.id === feat.id ? { ...f, text: e.target.value } : f);
                                      onChangeContent({ features: updated });
                                    }}
                                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] font-medium"
                                    placeholder="Es. Piste sempre battute..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onChangeContent({ features: (content.features || []).filter(f => f.id !== feat.id) });
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0"
                                    title="Elimina voce"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">Nessun punto elenco aggiuntivo. Clicca "+ Aggiungi Voce" per aggiungere altre righe al box info.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Blocco Icone Sportive */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.sportsIcons !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('sportsIcons', 'Blocco Icone Sportive & Servizi', '🏋️')}
                    {currentVis.sportsIcons !== false ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <span className="text-[10px] font-bold text-slate-700 block">
                              Icone attive sul listino:
                            </span>
                            <span className="text-[11px] font-black text-[#0D4D5E]">
                              {content.selectedSportsIcons?.length || 0} / 6 Selezionate
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('icons')}
                            className="px-2.5 py-1.5 bg-[#0D4D5E] text-white rounded-xl text-[10px] font-bold hover:bg-[#072F3A] transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Dumbbell className="w-3.5 h-3.5" />
                            <span>Gestisci Libreria Icone →</span>
                          </button>
                        </div>

                        {/* Quick preview of selected icons */}
                        {content.selectedSportsIcons && content.selectedSportsIcons.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {content.selectedSportsIcons.map(iconId => {
                              const iconObj = getAllSportsIcons(customFirestoreIcons).find(i => i.id === iconId);
                              if (!iconObj) return null;
                              return (
                                <span key={iconId} className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-slate-200">
                                  <WireframeIcon icon={iconObj} className="w-3.5 h-3.5 text-[#0D4D5E]" />
                                  <span>{getSportsIconName(iconObj, content.activeLanguage || 'it')}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                            Nessuna icona selezionata. Clicca "Gestisci Libreria Icone" per sceglierne fino a 6.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per mostrare il blocco icone sportive sulla grafica.</p>
                    )}
                  </div>

                  {/* Banner Personalizzato / Eco Banner */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.ecoBanner !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('ecoBanner', 'Banner Personalizzato / Eco Banner', '🍃')}
                    {currentVis.ecoBanner !== false ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Tipo Banner</label>
                            <select
                              value={content.customBanner?.type || 'eco'}
                              onChange={(e) => onChangeContent({
                                customBanner: {
                                  type: e.target.value as any,
                                  title: content.customBanner?.title,
                                  text: content.customBanner?.text,
                                  color: content.customBanner?.color
                                }
                              })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-800"
                            >
                              <option value="eco">Eco / Green Mobility (Default)</option>
                              <option value="event">Evento / Calendario</option>
                              <option value="snow">Meteo / Neve</option>
                              <option value="sponsor">Sponsor / Partner</option>
                              <option value="custom">Personalizzato</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Colore Sfondo</label>
                            <input
                              type="color"
                              value={content.customBanner?.color || content.customColors?.primary || '#004B87'}
                              onChange={(e) => onChangeContent({
                                customBanner: {
                                  type: content.customBanner?.type || 'eco',
                                  title: content.customBanner?.title,
                                  text: content.customBanner?.text,
                                  color: e.target.value
                                }
                              })}
                              className="w-full h-7 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Titolo Banner</label>
                          <input
                            type="text"
                            value={content.customBanner?.title ?? plt.ecoTitle ?? DEFAULT_PRICE_LIST_TEXTS.ecoTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              updatePlt('ecoTitle', val);
                              onChangeContent({
                                customBanner: {
                                  type: content.customBanner?.type || 'eco',
                                  title: val,
                                  text: content.customBanner?.text,
                                  color: content.customBanner?.color
                                }
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Testo / Descrizione Banner</label>
                          <input
                            type="text"
                            value={content.customBanner?.text ?? plt.ecoSub ?? DEFAULT_PRICE_LIST_TEXTS.ecoSub}
                            onChange={(e) => {
                              const val = e.target.value;
                              updatePlt('ecoSub', val);
                              onChangeContent({
                                customBanner: {
                                  type: content.customBanner?.type || 'eco',
                                  title: content.customBanner?.title,
                                  text: val,
                                  color: content.customBanner?.color
                                }
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Note Legali (Disclaimers) */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.disclaimer !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('disclaimer', 'Note Legali (Disclaimers)', '📜')}
                    {currentVis.disclaimer !== false ? (
                      <>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Note DE</label>
                          <input
                            type="text"
                            value={plt.disclaimerDe ?? 'Keine Rückerstattung bei Betriebsunterbrechungen jeglicher Art. Keine Garantie für Befahrbarkeit aller Loipen.'}
                            onChange={(e) => updatePlt('disclaimerDe', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Note IT</label>
                          <input
                            type="text"
                            value={plt.disclaimerIt ?? 'Nessun rimborso in caso di interruzioni di servizio. Nessuna garanzia sulla praticabilità di tutte le piste.'}
                            onChange={(e) => updatePlt('disclaimerIt', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Note EN</label>
                          <input
                            type="text"
                            value={plt.disclaimerEn ?? 'No refund in case of service interruptions of any kind. No guarantee that all trails are open.'}
                            onChange={(e) => updatePlt('disclaimerEn', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                  {/* Footer Brand & Network & Container */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.footer !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('footer', 'Piè di Pagina (Footer Brand, Contatti & QR Code)', '🦶')}
                    {currentVis.footer !== false ? (
                      <div className="space-y-2.5 pt-1">
                        {/* Modalità Footer */}
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Info Visualizzate</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  mode: 'dns'
                                }
                              })}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                (content.footerConfig?.mode || 'dns') === 'dns'
                                  ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Dolomiti NordicSki
                            </button>
                            <button
                              type="button"
                              onClick={() => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  mode: 'custom_area'
                                }
                              })}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                content.footerConfig?.mode === 'custom_area'
                                  ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Info Area Personalizzata
                            </button>
                          </div>
                        </div>

                        {/* Badge Biglietto Online */}
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Badge Promozionale Container</label>
                          <input
                            type="text"
                            value={content.footerConfig?.ticketBadgeText ?? 'ACQUISTA IL BIGLIETTO DIGITALE ONLINE'}
                            onChange={(e) => onChangeContent({
                              footerConfig: {
                                ...(content.footerConfig || {}),
                                ticketBadgeText: e.target.value
                              }
                            })}
                            placeholder="ACQUISTA IL BIGLIETTO DIGITALE ONLINE"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                          />
                        </div>

                        {/* Sito Web Footer */}
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold">Sito Web Footer</label>
                          <input
                            type="text"
                            value={content.footerConfig?.websiteUrl ?? content.websiteUrl ?? 'www.dolomitinordicski.com'}
                            onChange={(e) => {
                              const val = e.target.value;
                              onChangeContent({
                                websiteUrl: val,
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  websiteUrl: val
                                }
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-black text-[#0D4D5E]"
                          />
                        </div>

                        {/* Contatti (Telefono + Email) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Telefono Footer</label>
                            <input
                              type="text"
                              value={content.footerConfig?.phone ?? content.contactPhone ?? '+39 0474 913156'}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChangeContent({
                                  contactPhone: val,
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    phone: val
                                  }
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Email Footer</label>
                            <input
                              type="text"
                              value={content.footerConfig?.email ?? content.contactEmail ?? 'info@dolomitinordicski.com'}
                              onChange={(e) => {
                                const val = e.target.value;
                                onChangeContent({
                                  contactEmail: val,
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    email: val
                                  }
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                            />
                          </div>
                        </div>

                        {/* Switch QR Code nel Container Footer */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1.5">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-[10px] font-bold text-slate-700">Includi QR Code nel Box Footer</span>
                            <input
                              type="checkbox"
                              checked={content.footerConfig?.embedQrCode !== false}
                              onChange={(e) => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  embedQrCode: e.target.checked
                                }
                              })}
                              className="rounded border-slate-300 text-[#0D4D5E] focus:ring-[#0D4D5E]"
                            />
                          </label>
                          {content.footerConfig?.embedQrCode !== false && (
                            <div>
                              <label className="block text-[8.5px] text-slate-500 font-bold">Testo Sotto QR Code</label>
                              <input
                                type="text"
                                value={content.footerConfig?.qrScanLabel ?? 'SCANSIONA PER...'}
                                onChange={(e) => onChangeContent({
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    qrScanLabel: e.target.value
                                  }
                                })}
                                className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9.5px] font-bold"
                              />
                            </div>
                          )}
                        </div>

                        {/* Striscia Inferiore Network Bar */}
                        <div className="border-t pt-2 space-y-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Slogan / Copyright Striscia Inferiore</label>
                            <input
                              type="text"
                              value={content.footerConfig?.networkSlogan ?? plt.footerText ?? '8 AREAS = 1 NETWORK • DOLOMITI NORDICSKI © 2026 • www.dolomitinordicski.com'}
                              onChange={(e) => {
                                const val = e.target.value;
                                updatePlt('footerText', val);
                                onChangeContent({
                                  footerConfig: {
                                    ...(content.footerConfig || {}),
                                    networkSlogan: val
                                  }
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold">Elenco Aree Striscia Inferiore</label>
                            <input
                              type="text"
                              value={content.footerConfig?.networkAreasList ?? 'Anterselva • Val Casies • 3 Cime • Osttirol • Comelico • Cortina • Valle Aurina • Seiser Alm'}
                              onChange={(e) => onChangeContent({
                                footerConfig: {
                                  ...(content.footerConfig || {}),
                                  networkAreasList: e.target.value
                                }
                              })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[9.5px]"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                    )}
                  </div>

                </div>
              ) : isHotelPackageModel ? (
                <div className="space-y-3 bg-[#0D4D5E]/5 p-3.5 rounded-xl border border-[#0D4D5E]/30 font-vietnam">
                  <div className="flex items-center justify-between pb-2 border-b border-[#0D4D5E]/20">
                    <div className="font-bold text-xs text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                      <Hotel className="w-4 h-4 text-[#0D4D5E]" />
                      <span>Personalizzazione Pacchetto Hotel + Skipass (B2C)</span>
                    </div>
                    <span className="text-[9px] font-black bg-[#0D4D5E] text-white px-2 py-0.5 rounded font-vietnam">
                      Volantino Alberghi
                    </span>
                  </div>

                  {/* 1. HEADER BRAND & TAGLINE */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.header !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('header', '1. Header Brand & Tagline', '📌')}
                    {currentVis.header !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Tagline Header Superiore</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.headerTagline ?? content.headerTagline ?? 'Dolomiti NordicSki • Special Package'}
                            onChange={(e) => updateLangField('headerTagline', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Badge Promozionale Header / Offerta</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.badgeText ?? content.badgeText ?? 'OFFERTA SPECIALE HOTEL PARTNER 2026/27'}
                            onChange={(e) => updateLangField('badgeText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-[#0D4D5E]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Header disattivato.</p>
                    )}
                  </div>

                  {/* 2. TITOLO OFFERTA, SOTTOTITOLO & VALIDITÀ */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.bigTitle !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('bigTitle', '2. Titolo Offerta, Sottotitolo & Validità', '🏷️')}
                    {currentVis.bigTitle !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Pacchetto Hotel</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.title ?? content.title ?? 'Settimana Bianca Sci di Fondo & Relax'}
                            onChange={(e) => updateLangField('title', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[12px] font-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Descrizione / Sottotitolo Offerta</label>
                          <textarea
                            rows={2}
                            value={content.translations?.[activeLang]?.subtitle ?? content.subtitle ?? 'Soggiorno esclusivo in hotel con Skipass Dolomiti NordicSki incluso e servizi benessere.'}
                            onChange={(e) => updateLangField('subtitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Zona / Destinazione Sciistica</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.location ?? content.location ?? '3 Zinnen Dolomites / Alta Pusteria'}
                              onChange={(e) => updateLangField('location', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Periodo / Date di Validità Offerta</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.validityPeriod ?? content.validityPeriod ?? 'Valido dal 06.01.2027 al 28.03.2027'}
                              onChange={(e) => updateLangField('validityPeriod', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Titolo offerta disattivato.</p>
                    )}
                  </div>

                  {/* 3. IMMAGINE HERO / COPERTINA PACCHETTO */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.heroImage !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('heroImage', '3. Immagine Hero / Copertina Pacchetto', '🖼️')}
                    {currentVis.heroImage !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">URL Immagine Copertina (Hero)</label>
                          <input
                            type="text"
                            value={content.heroImageUrl ?? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'}
                            onChange={(e) => onChangeContent({ heroImageUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>
                        {content.heroImageUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-16 h-10 rounded overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                              <img src={content.heroImageUrl} alt="Anteprima Hero" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                                <span>Altezza Foto:</span>
                                <span>{content.heroImageHeightPx || 125}px</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={300}
                                step={5}
                                value={content.heroImageHeightPx || 125}
                                onChange={(e) => onChangeContent({ heroImageHeightPx: parseInt(e.target.value) })}
                                className="w-full accent-[#0D4D5E]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Foto copertina disattivata.</p>
                    )}
                  </div>

                  {/* 4. PREZZO PACCHETTO, DURATA & CONDIZIONI */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.priceTables !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('priceTables', '4. Prezzo Pacchetto, Durata & Condizioni', '💶')}
                    {currentVis.priceTables !== false ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Prefisso Prezzo</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.pricePrefix ?? content.pricePrefix ?? 'DA'}
                              onChange={(e) => updateLangField('pricePrefix', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Importo Prezzo</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.priceAmount ?? content.priceAmount ?? '389'}
                              onChange={(e) => updateLangField('priceAmount', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-black text-[#0D4D5E]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Valuta</label>
                            <input
                              type="text"
                              value={content.translations?.[activeLang]?.priceCurrency ?? content.priceCurrency ?? '€'}
                              onChange={(e) => updateLangField('priceCurrency', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Suffisso Prezzo / Durata</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.priceSuffix ?? content.priceSuffix ?? '/ 4 Notti per persona'}
                            onChange={(e) => updateLangField('priceSuffix', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Note Prezzo & Trattamento</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.priceNote ?? content.priceNote ?? 'Include pernottamento, mezza pensione e Skipass 3 Giorni'}
                            onChange={(e) => updateLangField('priceNote', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sezione prezzo disattivata.</p>
                    )}
                  </div>

                  {/* 5. SERVIZI & INCLUSIONI DEL PACCHETTO */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.servicesBox !== false && currentVis.features !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('servicesBox', '5. Servizi Inclusi nel Pacchetto (Elenco)', '✨')}
                    {currentVis.servicesBox !== false && currentVis.features !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Sezione Servizi</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.featuresTitle ?? content.featuresTitle ?? 'Servizi Inclusi nel Pacchetto Hotel:'}
                            onChange={(e) => updateLangField('featuresTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-[#0D4D5E]"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[9px] text-slate-500 font-bold">Punti Elenco Servizi:</label>
                          {(Array.isArray(content.translations?.[activeLang]?.features)
                            ? content.translations?.[activeLang]?.features
                            : (content.features || [])
                          ).map((feat: any, fIdx: number) => (
                            <div key={feat.id || fIdx} className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                              <input
                                type="checkbox"
                                checked={feat.highlight || false}
                                onChange={(e) => {
                                  const currentFeats = [
                                    ...(Array.isArray(content.translations?.[activeLang]?.features)
                                      ? content.translations?.[activeLang]?.features
                                      : (content.features || []))
                                  ];
                                  currentFeats[fIdx] = { ...currentFeats[fIdx], highlight: e.target.checked };
                                  updateLangField('features', currentFeats);
                                }}
                                title="Evidenzia con colore brand"
                                className="rounded text-[#0D4D5E]"
                              />
                              <input
                                type="text"
                                value={feat.text || ''}
                                onChange={(e) => {
                                  const currentFeats = [
                                    ...(Array.isArray(content.translations?.[activeLang]?.features)
                                      ? content.translations?.[activeLang]?.features
                                      : (content.features || []))
                                  ];
                                  currentFeats[fIdx] = { ...currentFeats[fIdx], text: e.target.value };
                                  updateLangField('features', currentFeats);
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const currentFeats = [
                                    ...(Array.isArray(content.translations?.[activeLang]?.features)
                                      ? content.translations?.[activeLang]?.features
                                      : (content.features || []))
                                  ];
                                  currentFeats.splice(fIdx, 1);
                                  updateLangField('features', currentFeats);
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                title="Elimina voce"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              const currentFeats = [
                                ...(Array.isArray(content.translations?.[activeLang]?.features)
                                  ? content.translations?.[activeLang]?.features
                                  : (content.features || []))
                              ];
                              currentFeats.push({ id: `f_${Date.now()}`, text: 'Nuovo servizio incluso', highlight: false });
                              updateLangField('features', currentFeats);
                            }}
                            className="w-full py-1 text-[10px] font-bold text-[#0D4D5E] bg-[#0D4D5E]/10 hover:bg-[#0D4D5E]/20 rounded border border-[#0D4D5E]/20 flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Aggiungi Servizio al Pacchetto</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Servizi disattivati.</p>
                    )}
                  </div>

                  {/* 6. STRISCIA ICONE SPORTIVE & CONVENZIONI */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.sportsIcons !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('sportsIcons', '6. Striscia Icone Sportive & Convenzioni', '🎿')}
                    {currentVis.sportsIcons !== false ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-700 block">
                              Icone Sportive Selezionate ({content.activeSportsIcons?.length || 4})
                            </span>
                            <span className="text-[9px] text-slate-500 block">
                              Le icone vengono mostrate in calce ai servizi del volantino hotel.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('icons')}
                            className="px-2.5 py-1.5 bg-[#0D4D5E] text-white text-[10px] font-bold rounded-lg hover:bg-[#0D4D5E]/90 flex items-center gap-1 shrink-0 shadow-xs"
                          >
                            <span>Gestisci Libreria Icone</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Striscia icone disattivata.</p>
                    )}
                  </div>

                  {/* 7. PRESENTAZIONE REGIONALE / TERRITORIO */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.ecoBanner !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('ecoBanner', '7. Presentazione Area Sciistica / Territorio', '🏔️')}
                    {currentVis.ecoBanner !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Titolo Presentazione Area</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.promoBannerTitle ?? content.promoBannerTitle ?? 'L\'Area Sci di Fondo 3 Cime Dolomites'}
                            onChange={(e) => updateLangField('promoBannerTitle', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-[#0D4D5E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Testo Descrizione Territorio & Piste</label>
                          <textarea
                            rows={3}
                            value={content.translations?.[activeLang]?.promoBannerText ?? content.promoBannerText ?? 'Oltre 200 km di piste perfettamente preparate immerse nelle Dolomiti Patrimonio UNESCO, con garanzia di innevamento e panorami unici.'}
                            onChange={(e) => updateLangField('promoBannerText', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Presentazione area disattivata.</p>
                    )}
                  </div>

                  {/* 8. CONTATTI STRUTTURA RICETTIVA & QR CODE */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.qrCode !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('qrCode', '8. Contatti Struttura Ricettiva & QR Code', '🏨')}
                    {currentVis.qrCode !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Nome Struttura Ricettiva / Hotel</label>
                          <input
                            type="text"
                            value={content.translations?.[activeLang]?.holderName ?? content.holderName ?? 'Hotel Partner Ufficiale Dolomiti NordicSki'}
                            onChange={(e) => updateLangField('holderName', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-black"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Telefono Hotel</label>
                            <input
                              type="text"
                              value={content.contactPhone ?? '+39 0474 913156'}
                              onChange={(e) => onChangeContent({ contactPhone: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Email Hotel</label>
                            <input
                              type="text"
                              value={content.contactEmail ?? 'booking@hotelpartner.com'}
                              onChange={(e) => onChangeContent({ contactEmail: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Sito Web / URL Prenotazione Hotel</label>
                          <input
                            type="text"
                            value={content.websiteUrl ?? 'www.hotelpartner.com'}
                            onChange={(e) => onChangeContent({ websiteUrl: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold text-[#0D4D5E]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">URL QR Code Prenotazione</label>
                            <input
                              type="text"
                              value={content.qrCode?.url ?? content.websiteUrl ?? 'www.hotelpartner.com'}
                              onChange={(e) => onChangeContent({
                                qrCode: {
                                  ...(content.qrCode || {}),
                                  url: e.target.value
                                }
                              })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[9.5px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Etichetta QR Code</label>
                            <input
                              type="text"
                              value={content.qrCode?.label ?? 'INFO & PRENOTAZIONI'}
                              onChange={(e) => onChangeContent({
                                qrCode: {
                                  ...(content.qrCode || {}),
                                  label: e.target.value
                                }
                              })}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[9.5px] font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Contatti hotel disattivati.</p>
                    )}
                  </div>

                  {/* 9. PIÈ DI PAGINA BRAND */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.footer !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('footer', '9. Piè di Pagina (Footer Brand)', '⚓')}
                    {currentVis.footer !== false ? (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold mb-0.5">Slogan / Network Bar Footer</label>
                          <input
                            type="text"
                            value={content.footerConfig?.networkSlogan ?? '8 AREAS = 1 NETWORK • DOLOMITI NORDICSKI'}
                            onChange={(e) => onChangeContent({
                              footerConfig: {
                                ...(content.footerConfig || {}),
                                networkSlogan: e.target.value
                              }
                            })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Footer disattivato.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* STANDARD FLYER FIELDS (badge, title, price, features) */}
              {/* 1. BRAND HEADER & TAGLINE LOGO */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.header !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('header', '1. Brand Header & Tagline Logo', '📌')}
                {currentVis.header !== false ? (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-xs">Tagline Header Superiore</label>
                    <input
                      type="text"
                      value={content.translations?.[activeLang]?.headerTagline ?? content.headerTagline ?? ''}
                      onChange={(e) => updateLangField('headerTagline', e.target.value)}
                      placeholder="Es. DOLOMITI NORDICSKI"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-[#0D4D5E]"
                    />
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Header disattivato. Attivalo con lo switch per modificarne i contenuti.</p>
                )}
              </div>

              {/* 2. TITOLO PRINCIPALE DOCUMENTO, BADGE & SOTTOTITOLO (BIG TITLE) */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.bigTitle !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('bigTitle', '2. Titolo Principale Documento, Badge & Sottotitolo', '🏷️')}
                {currentVis.bigTitle !== false ? (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">Titolo Principale Documento</label>
                      <input
                        type="text"
                        value={content.translations?.[activeLang]?.title ?? content.title ?? ''}
                        onChange={(e) => updateLangField('title', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#0D4D5E] focus:ring-1 focus:ring-[#0D4D5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">Sottotitolo / Descrizione</label>
                      <textarea
                        rows={2}
                        value={content.translations?.[activeLang]?.subtitle ?? content.subtitle ?? ''}
                        onChange={(e) => updateLangField('subtitle', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#0D4D5E] focus:ring-1 focus:ring-[#0D4D5E]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">Badge Promozionale Header</label>
                      <input
                        type="text"
                        value={content.translations?.[activeLang]?.badgeText ?? content.badgeText ?? ''}
                        onChange={(e) => updateLangField('badgeText', e.target.value)}
                        placeholder="Es. OFFERTA SPECIALE INVERNO 2026"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#0D4D5E] focus:ring-1 focus:ring-[#0D4D5E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1 text-xs">Periodo di Validità</label>
                        <input
                          type="text"
                          value={content.translations?.[activeLang]?.validityPeriod ?? content.validityPeriod ?? ''}
                          onChange={(e) => updateLangField('validityPeriod', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1 text-xs">Località / Pista</label>
                        <input
                          type="text"
                          value={content.translations?.[activeLang]?.location ?? content.location ?? ''}
                          onChange={(e) => updateLangField('location', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Titolo documento disattivato. Attivalo con lo switch per modificarne i contenuti.</p>
                )}
              </div>

              {/* Price Box Standard */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.promotionBox !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('promotionBox', 'Prezzo & Promozione Pacchetto', '🏷️')}
                {currentVis.promotionBox !== false ? (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Prefisso</label>
                        <input
                          type="text"
                          value={content.pricePrefix}
                          onChange={(e) => updateLangField('pricePrefix', e.target.value)}
                          placeholder="Da"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Importo</label>
                        <input
                          type="text"
                          value={content.priceAmount}
                          onChange={(e) => onChangeContent({ priceAmount: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Valuta</label>
                        <input
                          type="text"
                          value={content.priceCurrency}
                          onChange={(e) => onChangeContent({ priceCurrency: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">Suffisso Prezzo</label>
                      <input
                        type="text"
                        value={content.priceSuffix}
                        onChange={(e) => updateLangField('priceSuffix', e.target.value)}
                        placeholder="/ 3 Notti per persona"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">Nota Dettagliata Prezzo</label>
                      <input
                        type="text"
                        value={content.priceNote}
                        onChange={(e) => updateLangField('priceNote', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                    </div>
                    
                    {/* Holder Name & Issue Date (For Digital Pass / Online Tickets) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Nome e Cognome Titolare</label>
                        <input
                          type="text"
                          value={content.holderName || ''}
                          onChange={(e) => updateLangField('holderName', e.target.value)}
                          placeholder="es. Mario Rossi"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">Data di Emissione</label>
                        <input
                          type="text"
                          value={content.issueDate || ''}
                          onChange={(e) => updateLangField('issueDate', e.target.value)}
                          placeholder="es. 15.12.2026"
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                )}
              </div>

              {/* Features List (Multilingual Offer Rows) */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.servicesBox !== false ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('servicesBox', 'Servizi, Vantaggi & Righe Offerta', '⭐')}
                {currentVis.servicesBox !== false ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Aggiungi e personalizza righe multilingua (DE / IT / EN)</span>
                      </div>
                      <button
                        onClick={handleAddFeature}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#0D4D5E] hover:bg-[#083541] text-white rounded-md text-[10px] font-bold shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Aggiungi Riga</span>
                      </button>
                    </div>

                    {/* Multilingual Quick Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Inserimento Rapido Modelli Multilingua:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '+ Day Ticket (3L)', text: '1 TAG GEBIET • 1G AREA • 1 DAY AREA' },
                          { label: '+ Week Ticket (3L)', text: '7 TAGE GEBIET • 7G AREA • 7 DAYS AREA' },
                          { label: '+ Season Ticket (3L)', text: 'GANZE SAISON • TUTTA LA STAGIONE • WHOLE SEASON' },
                          { label: '+ Kids Free (3L)', text: 'KINDER U14 KOSTENLOS / Bambini under 14 gratuiti / Children under 14 free' },
                          { label: '+ Skischulen (3L)', text: 'SKISCHULEN & VERLEIH / Scuole sci e noleggi in ogni area / Ski schools & rentals' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const newFeature = {
                                id: `feat_${Date.now()}_${idx}`,
                                icon: 'skipass',
                                text: preset.text,
                                highlight: false
                              };
                              onChangeContent({ features: [...content.features, newFeature] });
                            }}
                            className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[9px] font-bold transition-all"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feature Rows */}
                    <div className="space-y-2 pt-1">
                      {content.features.map((feat, idx) => (
                        <div key={feat.id} className="flex flex-col gap-1 p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={feat.text}
                              onChange={(e) => handleUpdateFeature(feat.id, e.target.value)}
                              placeholder="Esempio: 1 TAG GEBIET • 1G AREA • 1 DAY AREA"
                              className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-900 font-medium"
                            />
                            <button
                              onClick={() => {
                                const updated = content.features.map(f => f.id === feat.id ? { ...f, highlight: !f.highlight } : f);
                                onChangeContent({ features: updated });
                              }}
                              className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all border ${
                                feat.highlight 
                                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                              title="Evidenzia riga"
                            >
                              Evidenziato
                            </button>
                            <button
                              onClick={() => handleRemoveFeature(feat.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all"
                              title="Elimina servizio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Reorder controls */}
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium px-1">
                            <span>Riga {idx + 1} di {content.features.length}</span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  onClick={() => {
                                    const newFeats = [...content.features];
                                    const temp = newFeats[idx - 1];
                                    newFeats[idx - 1] = newFeats[idx];
                                    newFeats[idx] = temp;
                                    onChangeContent({ features: newFeats });
                                  }}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold"
                                >
                                  ↑ Su
                                </button>
                              )}
                              {idx < content.features.length - 1 && (
                                <button
                                  onClick={() => {
                                    const newFeats = [...content.features];
                                    const temp = newFeats[idx + 1];
                                    newFeats[idx + 1] = newFeats[idx];
                                    newFeats[idx] = temp;
                                    onChangeContent({ features: newFeats });
                                  }}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold"
                                >
                                  ↓ Giù
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Sezione disattivata. Attivala con lo switch per modificarne i contenuti.</p>
                )}
              </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* TAB 4: REGIONE & LOGHI */}
        {activeTab === 'region' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0D4D5E]" />
                Regione & Partner Dolomiti NordicSki
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seleziona la regione o il consorzio turistico che pubblica la locandina.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {REGIONAL_LOGOS.map((reg) => {
                const isSelectedRegion = content.regionId === reg.id;
                // Get active logo option if multiple exist
                const activeLogoOpt = reg.logos?.find(l => l.id === (content.selectedRegionLogoId || reg.logos?.[0]?.id)) || reg.logos?.[0];
                const activeSrc = isSelectedRegion && activeLogoOpt
                  ? (activeLogoOpt.logoWhiteSrc || activeLogoOpt.logoSrc)
                  : (reg.logoWhiteSrc || reg.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe);
                const activeSecondarySrc = isSelectedRegion && activeLogoOpt
                  ? (activeLogoOpt.secondaryLogoWhiteSrc || activeLogoOpt.secondaryLogoSrc)
                  : (reg.secondaryLogoWhiteSrc || reg.secondaryLogoSrc);

                return (
                  <div
                    key={reg.id}
                    onClick={() => {
                      if (!isSelectedRegion) {
                        onChangeContent({ 
                          regionId: reg.id,
                          selectedRegionLogoId: reg.logos?.[0]?.id || 'primary'
                        });
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelectedRegion
                        ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg flex items-center justify-center shrink-0 min-w-[60px] h-9 bg-white border border-slate-200 shadow-2xs gap-1">
                          <img 
                            src={activeSrc} 
                            alt={reg.name} 
                            className="h-6 w-auto max-w-[80px] object-contain shrink-0" 
                          />
                          {activeSecondarySrc && (
                            <img 
                              src={activeSecondarySrc} 
                              alt={`${reg.name} Secondary`} 
                              className="h-6 w-auto max-w-[80px] object-contain shrink-0" 
                            />
                          )}
                        </div>
                        <div>
                          <div className={`font-bold text-xs font-vietnam ${isSelectedRegion ? 'text-white' : 'text-slate-900'}`}>{reg.name}</div>
                          <div className={`text-[10px] ${isSelectedRegion ? 'text-slate-200' : 'text-slate-500'}`}>{reg.subTitle}</div>
                        </div>
                      </div>
                      {isSelectedRegion && (
                        <Check className="w-4 h-4 text-[#AAD0D1] shrink-0" />
                      )}
                    </div>

                    {/* Secondary Logo Selector when region has multiple logos */}
                    {isSelectedRegion && reg.logos && reg.logos.length > 1 && (
                      <div className="mt-1 pt-2.5 border-t border-white/20 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-200 uppercase tracking-wider font-vietnam">
                          Scegli Opzione Logo Regionale:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {reg.logos.map((logoOpt) => {
                            const isSelectedLogo = (content.selectedRegionLogoId || reg.logos![0].id) === logoOpt.id;
                            return (
                              <button
                                key={logoOpt.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChangeContent({ selectedRegionLogoId: logoOpt.id });
                                }}
                                className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                                  isSelectedLogo
                                    ? 'bg-white text-[#0D4D5E] border-white shadow-sm font-bold ring-2 ring-white/50'
                                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                                }`}
                              >
                                <div className={`p-1 rounded flex items-center justify-center shrink-0 h-8 ${isSelectedLogo ? 'bg-slate-100' : 'bg-white/90'}`}>
                                  <img
                                    src={logoOpt.logoSrc}
                                    alt={logoOpt.name}
                                    className="h-6 w-auto max-w-full object-contain"
                                  />
                                  {logoOpt.secondaryLogoSrc && (
                                    <img
                                      src={logoOpt.secondaryLogoSrc}
                                      alt={`${logoOpt.name} Secondary`}
                                      className="h-6 w-auto max-w-full object-contain ml-1"
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] leading-tight font-vietnam">{logoOpt.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LOGO REGIONALE PERSONALIZZATO (PNG / IMMAGINE REALE) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="block text-slate-900 font-bold text-xs font-vietnam">
                  Logo Regionale Personalizzato (PNG / Immagine)
                </label>
                {content.customRegionalLogoUrl && (
                  <button
                    type="button"
                    onClick={() => onChangeContent({ customRegionalLogoUrl: undefined })}
                    className="text-[10px] text-red-600 hover:underline font-bold"
                  >
                    Reset Logo Predefinito
                  </button>
                )}
              </div>
              <p className="text-[10.5px] text-slate-500 leading-snug">
                Se il logo della regione non è in formato vettoriale SVG (come quello del Biathlon), puoi caricare o incollare un'immagine normale in formato <strong>PNG o JPG</strong>.
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={content.customRegionalLogoUrl || ''}
                  onChange={(e) => onChangeContent({ customRegionalLogoUrl: e.target.value })}
                  placeholder="https://.../logo.png o carica file"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-[#0D4D5E]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/png, image/jpeg, image/svg+xml, image/webp';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                          if (readerEvent.target?.result) {
                            onChangeContent({ customRegionalLogoUrl: readerEvent.target.result as string });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="px-3 py-1.5 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-lg text-[10.5px] font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#AAD0D1]" />
                  <span>Carica PNG</span>
                </button>
              </div>
              {content.customRegionalLogoUrl && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                    <img src={content.customRegionalLogoUrl} alt="Logo Regionale Personalizzato" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">Logo PNG Personalizzato Attivo</span>
                </div>
              )}
            </div>

            {/* CONTROLLI GRANDEZZA LOGO REGIONALE & POSIZIONE LOGO GENERALE DNS */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-xs font-vietnam flex items-center justify-between">
                <span>Grandezza Logo Regionale</span>
                <span className="text-[#0D4D5E] font-extrabold">{content.regionalLogoScale || 100}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="60"
                  max="180"
                  step="5"
                  value={content.regionalLogoScale || 100}
                  onChange={(e) => onChangeContent({ regionalLogoScale: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-[#0D4D5E] cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  {[75, 100, 125, 150].map((scaleVal) => (
                    <button
                      key={scaleVal}
                      type="button"
                      onClick={() => onChangeContent({ regionalLogoScale: scaleVal })}
                      className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                        (content.regionalLogoScale || 100) === scaleVal
                          ? 'bg-[#0D4D5E] text-white border-[#0D4D5E]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {scaleVal}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTROLLO SFONDO BADGE LOGO REGIONALE */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <label className="block text-slate-800 font-bold text-xs font-vietnam">
                Sfondo Contenitore / Badge Logo Regionale
              </label>
              <p className="text-[10.5px] text-slate-500 leading-snug">
                Scegli se applicare uno sfondo scuro (predefinito per i temi scuri), chiaro o trasparente al badge del logo.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'auto', label: 'Automatico', sub: 'Scuro nei temi scuri' },
                  { id: 'dark', label: 'Scuro', sub: 'Sfondo scuro' },
                  { id: 'light', label: 'Chiaro', sub: 'Sfondo bianco' },
                  { id: 'none', label: 'Nessuno', sub: 'Trasparente' },
                ].map((opt) => {
                  const isSelected = (content.logoBadgeBgStyle || 'auto') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeContent({ logoBadgeBgStyle: opt.id as any })}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-[11px] font-vietnam">{opt.label}</div>
                      <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{opt.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <label className="block text-slate-800 font-bold text-xs font-vietnam">
                Posizione Logo Generale Dolomiti NordicSki
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'header', label: 'In Alto (Header)', sub: 'In testata con logo regionale' },
                  { id: 'footer_left', label: 'In Basso a Sinistra', sub: 'Nel footer in basso' },
                  { id: 'hidden', label: 'Nascosto', sub: 'Rimuovi logo DNS' },
                ].map((pos) => {
                  const isSelected = (content.dnsLogoPlacement || 'header') === pos.id;
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => onChangeContent({ dnsLogoPlacement: pos.id as any })}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-[11px] font-vietnam">{pos.label}</div>
                      <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{pos.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs">
              <div className="font-bold text-[#0D4D5E] font-vietnam flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-[#0D4D5E]" />
                Loghi Ufficiali Dolomiti NordicSki
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tutte le 8 regioni utilizzano il logo e l'emblema ufficiale Dolomiti NordicSki (Langläufer & Kurve). Quando caricherai i file dei loghi dedicati delle singole regioni, verranno integrati qui.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-bold">Nome Personalizzato Regione (Opzionale)</label>
              <input
                type="text"
                value={content.customRegionName || ''}
                onChange={(e) => onChangeContent({ customRegionName: e.target.value })}
                placeholder="Lascia vuoto per usare il nome standard"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </div>
        )}

        {/* TAB 5: IMMAGINI & IMPORTAZIONE FILE */}
        {activeTab === 'images' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0D4D5E]" />
                Gestione Immagini & Upload
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Carica foto personalizzate dal tuo dispositivo oppure scegli dalla galleria stock Dolomiti.
              </p>
            </div>

            {/* TOGGLE VISIBILITÀ IMMAGINE SOTTO HEADER */}
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
                      const updatedVis = {
                        ...currentVis,
                        heroImage: e.target.checked
                      };
                      onChangeContent({
                        sectionVisibility: updatedVis,
                        visibility: updatedVis
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
                </label>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-snug">
                Scegli se mostrare o nascondere l'immagine/foto principale sotto l'header per il modello attualmente selezionato ({FLYER_TEMPLATES.find(t => t.id === content.graphicStyle)?.name || 'Modello Selezionato'}).
              </p>
            </div>

            {/* Local File Upload Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-slate-900 font-bold font-vietnam flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0D4D5E]" />
                Carica Immagine Locale
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-xl font-bold font-vietnam flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#AAD0D1]" />
                <span>Seleziona Foto dal Computer</span>
              </button>
            </div>

            {/* Uploaded Custom Images Gallery */}
            {content.importedImages && content.importedImages.length > 0 && (
              <div className="space-y-2">
                <label className="block text-slate-900 font-bold font-vietnam">
                  Le Tue Immagini Caricate ({content.importedImages.length})
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
                        <span className="text-[9px] font-bold text-white">Caricata</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImportedImage(imgUrl);
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

            {/* Custom URL Input */}
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

            {/* Stock Preset Gallery */}
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

            {/* Layout position option */}
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

            {/* Header Image Height Extension Buffer (Anti-Spazio Bianco) */}
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
              <p className="text-[10.5px] text-slate-600 leading-snug">
                Regola l'altezza della foto principale per tutti i formati (A3, A4, A5) in orientamento Verticale o Orizzontale per chiudere gli spazi bianchi in basso.
              </p>
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
                  title="Ripristina altezza flessibile automatica"
                >
                  Reset Auto
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: COLORI, LOGHI & ELEMENTI ORNAMENTALI */}
        {activeTab === 'style' && (
          <div className="space-y-5 text-xs">
            {/* SECTION 1: LOGO DOLOMITI NORDICSKI VARIANTS */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0D4D5E]" />
                  Variante Grafica Logo DNS
                </h3>
                <span className="text-[10px] font-bold bg-[#AAD0D1]/30 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  Manuale Brand
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Seleziona la variante di logo più adatta allo stile grafico e allo sfondo del flyer:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'original', label: 'Originale (Teal / Ghiaccio)', desc: 'Standard su sfondi chiari' },
                  { id: 'horizontal', label: 'Orizzontale Esteso', desc: 'Layout su singola riga' },
                  { id: 'negative', label: 'Negativo (Bianco / Ghiaccio)', desc: 'Sfondi scuri o fotografici' },
                  { id: 'monochrome', label: 'Tinta Piatta (Pieno)', desc: 'Colore unico solido' },
                  { id: 'grayscale', label: 'Monocromatico / Scale di Grigio', desc: 'Stampa B/N o sobria' },
                  { id: 'skier_track_emblem', label: 'Solo Emblema Sciatore + Traccia', desc: 'Badge minimale' },
                  { id: 'badge_card', label: 'Card Badge Contornata', desc: 'Box bianco con bordo' },
                  { id: 'none', label: 'Nessun Logo', desc: 'Nascondi il logo' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onChangeContent({ logoVariant: v.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      (content.logoVariant || 'original') === v.id
                        ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-[11px] font-vietnam">{v.label}</div>
                    <div className={`text-[9px] mt-0.5 ${ (content.logoVariant || 'original') === v.id ? 'text-slate-200' : 'text-slate-500' }`}>
                      {v.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION: STILE CONTORNATURA LOGHI (Arrotondati, Spigolo, No Bordo) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Square className="w-4 h-4 text-[#0D4D5E]" />
                  Stile Contornatura Loghi Regionali
                </h3>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  {content.logoCornerStyle === 'sharp' ? 'A Spigolo' : content.logoCornerStyle === 'none' ? 'No Bordo' : 'Arrotondati'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Gestisci la forma del badge/box che racchiude i loghi regionali (nelle tabelle prezzi e nei ticket):
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rounded', label: 'Arrotondati', icon: 'rounded-md' },
                  { id: 'sharp', label: 'A Spigolo', icon: 'rounded-none' },
                  { id: 'none', label: 'No Bordo', icon: 'rounded-none border-dashed opacity-50' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeContent({ logoCornerStyle: opt.id as any })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      (content.logoCornerStyle || 'rounded') === opt.id
                        ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 ${opt.icon} border-2 ${ (content.logoCornerStyle || 'rounded') === opt.id ? 'border-white/50' : 'border-slate-300' } flex items-center justify-center`}>
                        <div className={`w-4 h-4 ${opt.icon === 'rounded-md' ? 'rounded-xs' : 'rounded-none'} ${ (content.logoCornerStyle || 'rounded') === opt.id ? 'bg-white' : 'bg-slate-400' }`} />
                      </div>
                      <div className="font-bold text-[10px] font-vietnam">{opt.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION: VISIBILITÀ SEZIONI DOCUMENTO */}
            {/* SECTION 2: PALETTE CORPORATE & CUSTOM COLORS */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0D4D5E]" />
                  Palette Colori Ufficiali DNS
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Combinazioni di colori ufficiali dal Corporate Manual e personalizzazione libera.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { 
                    id: 'frosted_ice', 
                    name: 'Frosted Ice Blue (#0D4D5E)', 
                    color: '#0D4D5E', 
                    desc: 'Klarheit, Frische & Reinheit • Prickelnde Höhenluft und unberührter Schnee' 
                  },
                  { 
                    id: 'nordic_sky', 
                    name: 'Nordic Sky Blue (#417483)', 
                    color: '#417483', 
                    desc: 'Gelassenheit, Balance & Freiheit • Weite des alpinen Himmels' 
                  },
                  { 
                    id: 'deep_glacier', 
                    name: 'Deep Glacier Blue (#AAD0D1)', 
                    color: '#AAD0D1', 
                    desc: 'Stärke, Vertrauen & Ausdauer • Bergseen & Geist des Langlaufsportes' 
                  },
                  { 
                    id: 'ice_white', 
                    name: 'Bianco Ghiaccio (#F4F9FA)', 
                    color: '#F4F9FA', 
                    desc: 'Unberührter Neveschnee • Elevata leggibilità ed eleganza alpina' 
                  }
                ].map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => {
                      onChangeContent({ 
                        themeColor: scheme.id as BrandColorScheme,
                        customColors: undefined 
                      });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      content.themeColor === scheme.id && !content.customColors
                        ? 'bg-slate-50 border-[#0D4D5E] ring-2 ring-[#0D4D5E]/15 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg border border-slate-300 shrink-0 shadow-2xs" style={{ backgroundColor: scheme.color }} />
                      <div>
                        <div className="font-bold text-slate-900 font-vietnam">{scheme.name}</div>
                        <div className="text-[10px] text-slate-500 leading-snug mt-0.5">{scheme.desc}</div>
                      </div>
                    </div>
                    {content.themeColor === scheme.id && !content.customColors && <Check className="w-4 h-4 text-[#0D4D5E]" />}
                  </div>
                ))}
              </div>

              {/* Custom Color Mixing Panel - Sbloccato per tutti i documenti e listini */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-800 font-bold font-vietnam text-[11px] uppercase tracking-wider">
                      Personalizza Singoli Colori (HEX)
                    </label>
                    <span className="text-[9px] font-extrabold bg-[#AAD0D1]/40 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                      Sbloccato
                    </span>
                  </div>
                  {content.customColors && (
                    <button
                      type="button"
                      onClick={() => onChangeContent({ customColors: undefined })}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      Ripristina Palette Preset
                    </button>
                  )}
                </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Primario</label>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="color"
                          value={content.customColors?.primary || '#0D4D5E'}
                          onChange={(e) => onChangeContent({
                            customColors: {
                              primary: e.target.value,
                              secondary: content.customColors?.secondary || '#417483',
                              accent: content.customColors?.accent || '#AAD0D1',
                              background: content.customColors?.background || '#F4F9FA',
                              cardBg: content.customColors?.cardBg || '#FFFFFF',
                              textColor: content.customColors?.textColor || '#0D4D5E'
                            }
                          })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700">
                          {content.customColors?.primary || '#0D4D5E'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Secondario</label>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="color"
                          value={content.customColors?.secondary || '#417483'}
                          onChange={(e) => onChangeContent({
                            customColors: {
                              primary: content.customColors?.primary || '#0D4D5E',
                              secondary: e.target.value,
                              accent: content.customColors?.accent || '#AAD0D1',
                              background: content.customColors?.background || '#F4F9FA',
                              cardBg: content.customColors?.cardBg || '#FFFFFF',
                              textColor: content.customColors?.textColor || '#0D4D5E'
                            }
                          })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700">
                          {content.customColors?.secondary || '#417483'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Accento Ghiaccio</label>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="color"
                          value={content.customColors?.accent || '#AAD0D1'}
                          onChange={(e) => onChangeContent({
                            customColors: {
                              primary: content.customColors?.primary || '#0D4D5E',
                              secondary: content.customColors?.secondary || '#417483',
                              accent: e.target.value,
                              background: content.customColors?.background || '#F4F9FA',
                              cardBg: content.customColors?.cardBg || '#FFFFFF',
                              textColor: content.customColors?.textColor || '#0D4D5E'
                            }
                          })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700">
                          {content.customColors?.accent || '#AAD0D1'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* SECTION 3: ELEMENTI ORNAMENTALI (KURVE & LANGLÄUFER) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0D4D5E]" />
                  Elementi Grafici Ornamentali (DNS Manual)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Aggiungi o riposiziona le doppie tracce di fondo ("Kurve") e la silhouette dello sciatore ("Langläufer").
                </p>
              </div>

              {/* 1. ORNAMENT: KURVE (DOPPIA TRACCIA) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 font-vietnam text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#AAD0D1]" />
                    Traccia Sci Curva ("Kurve")
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.ornamentCurves?.enabled ?? true}
                      onChange={(e) => onChangeContent({
                        ornamentCurves: {
                          enabled: e.target.checked,
                          position: content.ornamentCurves?.position || 'content_divider',
                          color: content.ornamentCurves?.color || '#AAD0D1',
                          opacity: content.ornamentCurves?.opacity || 80
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
                  </label>
                </div>

                {content.ornamentCurves?.enabled && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Posizione sul Flyer</label>
                        <select
                          value={content.ornamentCurves?.position || 'content_divider'}
                          onChange={(e) => onChangeContent({
                            ornamentCurves: {
                              ...content.ornamentCurves!,
                              position: e.target.value as any
                            }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="header_bottom">Sotto l'Header</option>
                          <option value="hero_overlay">Sotto la Foto Principale</option>
                          <option value="content_divider">Separatore Contenuti</option>
                          <option value="footer_top">Sopra il Footer</option>
                          <option value="background_diagonal">Diagonale di Sfondo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Colore Traccia</label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                          <input
                            type="color"
                            value={content.ornamentCurves?.color || '#AAD0D1'}
                            onChange={(e) => onChangeContent({
                              ornamentCurves: {
                                ...content.ornamentCurves!,
                                color: e.target.value
                              }
                            })}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-[10px] font-mono text-slate-700">
                            {content.ornamentCurves?.color || '#AAD0D1'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>Trasparenza / Opacità</span>
                        <span>{content.ornamentCurves?.opacity || 80}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={content.ornamentCurves?.opacity || 80}
                        onChange={(e) => onChangeContent({
                          ornamentCurves: {
                            ...content.ornamentCurves!,
                            opacity: parseInt(e.target.value)
                          }
                        })}
                        className="w-full accent-[#0D4D5E]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ORNAMENT: LANGLÄUFER (SCIATORE) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 font-vietnam text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0D4D5E]" />
                    Silhouette Sciatore ("Langläufer")
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.ornamentSkier?.enabled ?? false}
                      onChange={(e) => onChangeContent({
                        ornamentSkier: {
                          enabled: e.target.checked,
                          position: content.ornamentSkier?.position || 'footer_corner',
                          color: content.ornamentSkier?.color || '#0D4D5E',
                          opacity: content.ornamentSkier?.opacity || 90,
                          size: content.ornamentSkier?.size || 'md'
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
                  </label>
                </div>

                {content.ornamentSkier?.enabled && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Posizione</label>
                        <select
                          value={content.ornamentSkier?.position || 'footer_corner'}
                          onChange={(e) => onChangeContent({
                            ornamentSkier: {
                              ...content.ornamentSkier!,
                              position: e.target.value as any
                            }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="footer_corner">Angolo Footer</option>
                          <option value="header_right">In Alto a Destra</option>
                          <option value="hero_watermark">Filigrana al Centro</option>
                          <option value="price_badge">Accanto al Prezzo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Dimensione</label>
                        <select
                          value={content.ornamentSkier?.size || 'md'}
                          onChange={(e) => onChangeContent({
                            ornamentSkier: {
                              ...content.ornamentSkier!,
                              size: e.target.value as any
                            }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="sm">Piccola (40px)</option>
                          <option value="md">Media (65px)</option>
                          <option value="lg">Grande (110px)</option>
                          <option value="xl">Extra Large (180px)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Colore Sciatore</label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                          <input
                            type="color"
                            value={content.ornamentSkier?.color || '#0D4D5E'}
                            onChange={(e) => onChangeContent({
                              ornamentSkier: {
                                ...content.ornamentSkier!,
                                color: e.target.value
                              }
                            })}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-[10px] font-mono text-slate-700">
                            {content.ornamentSkier?.color || '#0D4D5E'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>Opacità</span>
                          <span>{content.ornamentSkier?.opacity || 90}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={content.ornamentSkier?.opacity || 90}
                          onChange={(e) => onChangeContent({
                            ornamentSkier: {
                              ...content.ornamentSkier!,
                              opacity: parseInt(e.target.value)
                            }
                          })}
                          className="w-full accent-[#0D4D5E]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: TIPOGRAFIA CORPORATE */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-slate-700 font-bold font-vietnam">Tipografia Corporate (Google Fonts)</label>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Font Titoli</label>
                  <select
                    value={content.headingFont}
                    onChange={(e) => onChangeContent({ headingFont: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-semibold"
                  >
                    <option value="Be Vietnam Pro">Be Vietnam Pro (Ufficiale)</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Font Testo</label>
                  <select
                    value={content.bodyFont}
                    onChange={(e) => onChangeContent({ bodyFont: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-semibold"
                  >
                    <option value="Roboto">Roboto (Ufficiale)</option>
                    <option value="Be Vietnam Pro">Be Vietnam Pro</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: ICONE SPORTIVE */}
        {activeTab === 'icons' && (
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

            {/* Notification Toast */}
            {iconToast && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 text-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{iconToast}</span>
              </div>
            )}

            {/* Upload New Custom Icon Box */}
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
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Categoria:
                    </label>
                    <select
                      value={newIconCategory}
                      onChange={(e) => setNewIconCategory(e.target.value as any)}
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
                      onChange={handleCustomIconFileChange}
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
                  onClick={handleSaveCustomIcon}
                  disabled={isUploadingCustomIcon}
                  className="w-full py-2 px-3 bg-[#0D4D5E] hover:bg-[#072F3A] text-white font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUploadingCustomIcon ? 'Salvataggio in Firestore...' : 'Salva Nuova Icona nel Database Firestore'}</span>
                </button>
              </div>
            </div>

            {/* Icons Grid with Wireframe Symbols and Localized Names */}
            <div>
              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Scegli e Attiva Icone Vettoriali:
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const combined = getAllSportsIcons(customFirestoreIcons);
                  return combined.map((icon) => {
                    const isSelected = content.selectedSportsIcons.includes(icon.id);
                    const localizedName = getSportsIconName(icon, content.activeLanguage || 'it');
                    return (
                      <div
                        key={icon.id}
                        onClick={() => handleToggleSportsIcon(icon.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 relative group ${
                          isSelected
                            ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {/* Wireframe symbol preview */}
                        <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0D4D5E]'
                        }`}>
                          <WireframeIcon icon={icon} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1 pr-4">
                          <div className={`font-bold text-[11px] font-vietnam leading-tight truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {localizedName}
                          </div>
                          <div className={`text-[9px] mt-0.5 line-clamp-1 flex items-center gap-1 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                            <span>{icon.category}</span>
                            {icon.isCustom && (
                              <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-400 text-slate-900">
                                Firestore
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Check selection badge */}
                        <div className="absolute top-2 right-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-white text-[#0D4D5E] font-black' : 'border border-slate-300'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                        </div>

                        {/* Custom Icon Delete Button */}
                        {icon.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomIcon(icon.id);
                            }}
                            title="Elimina da Firestore"
                            className="absolute bottom-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: QR CODE DINAMICO */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#0D4D5E]" />
                QR Code Dinamico
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Genera un QR code personalizzato per reindirizzare i clienti all'offerta online.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900">Attiva QR Code nel Flyer</label>
                <input
                  type="checkbox"
                  checked={content.qrCode.enabled}
                  onChange={(e) => onChangeContent({
                    qrCode: { ...content.qrCode, enabled: e.target.checked }
                  })}
                  className="w-4 h-4 accent-[#0D4D5E] rounded cursor-pointer"
                />
              </div>

              {content.qrCode.enabled && (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Link / URL dell'Offerta</label>
                    <input
                      type="text"
                      value={content.qrCode.url}
                      onChange={(e) => onChangeContent({
                        qrCode: { ...content.qrCode, url: e.target.value }
                      })}
                      placeholder="https://www.dolomitinordicski.com/offerta"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Etichetta Sotto QR Code</label>
                    <input
                      type="text"
                      value={content.qrCode.label}
                      onChange={(e) => onChangeContent({
                        qrCode: { ...content.qrCode, label: e.target.value }
                      })}
                      placeholder="Scansiona per prenotare"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};

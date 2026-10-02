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
import { EditorChrome, type EditorTabId } from './editor/EditorChrome';
import { IconsEditorTab } from './editor/IconsEditorTab';
import { QRCodeEditorTab } from './editor/QRCodeEditorTab';
import { RegionEditorTab } from './editor/RegionEditorTab';
import { ImagesEditorTab } from './editor/ImagesEditorTab';
import { StyleEditorTab } from './editor/StyleEditorTab';
import { TemplatesEditorTab } from './editor/TemplatesEditorTab';
import { LayoutVariantsEditorTab } from './editor/LayoutVariantsEditorTab';
import { GraphicElementsEditorTab } from './editor/GraphicElementsEditorTab';
import { ContentEditorTab } from './editor/ContentEditorTab';
import { STOCK_IMAGES } from './editor/editorAssets';

interface EditorPanelProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onOpenSavedDesignsModal: () => void;
  onMakeItPerfect?: () => void;
}



export const EditorPanel: React.FC<EditorPanelProps> = ({
  uiLanguage,
  content,
  onChangeContent,
  onApplyTemplate,
  onOpenSavedDesignsModal,
  onMakeItPerfect
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [activeTab, setActiveTab] = useState<EditorTabId>('templates');
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
      alert(ui('Bitte ein Bild oder Symbol für das Icon auswählen.', 'Seleziona un\'immagine o simbolo icona dal PC.'));
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

      setIconToast(ui('Neues Icon zur Bibliothek hinzugefügt.', 'Nuova icona aggiunta al Database Firestore!'));
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
    const newTitle = prompt(ui('Name für die neue Vorlage eingeben:', 'Inserisci il nome per il nuovo modello:'), ui('Neue benutzerdefinierte Vorlage', 'Nuovo Modello Personalizzato'));
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

    setSaveToast(ui('Neue Vorlage erstellt. Du kannst sie jetzt anpassen und speichern.', 'Nuovo modello creato! Ora puoi personalizzarlo e salvarlo su Firebase.'));
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
      setSaveToast(ui('Vorlage erfolgreich gespeichert.', 'Modello salvato con successo su Firebase Cloud!'));
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
      alert(ui('Bitte eine gültige Bilddatei auswählen (PNG, JPG, WebP).', 'Seleziona un file immagine valido (PNG, JPG, WebP).'));
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
        alert(ui('Es können maximal 6 Sport-Icons gleichzeitig ausgewählt werden.', 'Puoi selezionare al massimo 6 icone sportive contemporaneamente.'));
        return;
      }
      onChangeContent({
        selectedSportsIcons: [...content.selectedSportsIcons, iconId]
      });
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-hidden no-print">
      
      <EditorChrome
        uiLanguage={uiLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSavedDesignsModal={onOpenSavedDesignsModal}
        onMakeItPerfect={onMakeItPerfect}
      />

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {activeTab === 'templates' && (
          <TemplatesEditorTab
            uiLanguage={uiLanguage}
            content={content}
            firebaseSavedModels={firebaseSavedModels}
            isSavingToFirebase={isSavingToFirebase}
            saveToast={saveToast}
            onCreateNewModel={handleCreateNewModel}
            onDuplicateCurrentModel={handleDuplicateCurrentModel}
            onSaveModelToFirebase={handleSaveModelToFirebase}
            onApplyTemplate={onApplyTemplate}
            onOpenSavedDesignsModal={onOpenSavedDesignsModal}
            onChangeContent={onChangeContent}
            setSaveToast={setSaveToast}
          />
        )}

        {activeTab === 'style_variant' && (
          <LayoutVariantsEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
            onMakeItPerfect={onMakeItPerfect}
          />
        )}

        {activeTab === 'graphic_elements' && (
          <GraphicElementsEditorTab
            uiLanguage={uiLanguage}
            content={content}
            currentVis={currentVis}
            onChangeContent={onChangeContent}
            onOpenContentTab={() => setActiveTab('content')}
          />
        )}

        {activeTab === 'content' && (
          <ContentEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
            activeOrderOrientation={activeOrderOrientation}
            setActiveOrderOrientation={setActiveOrderOrientation}
            fileInputRef={fileInputRef}
            onOpenIconsTab={() => setActiveTab('icons')}
            onAddFeature={handleAddFeature}
            onUpdateFeature={handleUpdateFeature}
            onRemoveFeature={handleRemoveFeature}
          />
        )}

        {activeTab === 'region' && (
          <RegionEditorTab
            uiLanguage={uiLanguage}
            content={content}
            onChangeContent={onChangeContent}
          />
        )}

        {activeTab === 'images' && (
          <ImagesEditorTab
            uiLanguage={uiLanguage}
            content={content}
            currentVis={currentVis}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
            onRemoveImportedImage={handleRemoveImportedImage}
            onChangeContent={onChangeContent}
          />
        )}

        {activeTab === 'style' && (
          <StyleEditorTab content={content} onChangeContent={onChangeContent} />
        )}

        {activeTab === 'icons' && (
          <IconsEditorTab
            content={content}
            customFirestoreIcons={customFirestoreIcons}
            iconToast={iconToast}
            newIconName={newIconName}
            setNewIconName={setNewIconName}
            newIconCategory={newIconCategory}
            setNewIconCategory={setNewIconCategory}
            newIconImageBase64={newIconImageBase64}
            customIconFileInputRef={customIconFileInputRef}
            onCustomIconFileChange={handleCustomIconFileChange}
            isUploadingCustomIcon={isUploadingCustomIcon}
            onSaveCustomIcon={handleSaveCustomIcon}
            onToggleSportsIcon={handleToggleSportsIcon}
            onDeleteCustomIcon={handleDeleteCustomIcon}
          />
        )}

        {activeTab === 'qr' && (
          <QRCodeEditorTab content={content} onChangeContent={onChangeContent} />
        )}

      </div>
    </aside>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { captureCreativeFlyer, exportCreativePNG } from './features/creative-export/creativeExport';
import { printVectorFlyerFromDOM } from './features/creative-export/nativeVectorPrint';
import { Navbar } from './components/Navbar';
import { initWorkspaceShell } from './lib/workspaceShell';
import { DNSDesignControl } from './components/DNSDesignControl';
import { DNSFlyerAvailabilityControl } from './components/DNSFlyerAvailabilityControl';
import { DEFAULT_POLICY, subscribeDesignPolicy, type DNSFlyerDesignPolicy } from './data/dnsFlyerDesignPolicy';
import {
  DEFAULT_FLYER_AVAILABILITY,
  isFlyerProductEnabled,
  subscribeFlyerAvailabilityPolicy,
  type DNSFlyerAvailabilityPolicy,
} from './data/dnsFlyerAvailabilityPolicy';
import { FlyerCanvas } from './components/FlyerCanvas';
import { EditorPanel } from './components/EditorPanel';
import { LegacyEditorPanel } from './components/LegacyEditorPanel';
import { SocialShareModal } from './components/SocialShareModal';
import { FlyerDashboard } from './components/FlyerDashboard';
import { FlyerContent, PaperFormat, PaperOrientation, LayoutTemplateId, LanguageCode } from './types';
import { FLYER_TEMPLATES } from './data/templates';
import { LEGACY_FLYER_TEMPLATES } from './data/legacyTemplates';
import { Printer, Download, Eye, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { ExportModal } from './components/ExportModal';
import { getContentForLanguage } from './utils/multilingual';
import { runMakeItPerfect } from './features/make-it-perfect/runMakeItPerfect';
import { probeDNSCoreHeader, type DNSCoreHeaderStatus } from './lib/dnsCoreHeader';
import { getDNSFoundationRuntime } from './lib/foundationRuntime';
import { createFlyerDocumentV1, normalizeFlyerContent } from './model/flyerDocument';
import { signInDNSCore, signInDNSCoreWithEmail, signOutDNSCore, subscribeDNSCoreUser } from './lib/dnsCore';
import { loadCurrentFlyerAccess } from './data/currentFlyerAccess';
import { coreReportingAreaId, findReportingAreaLogo } from './data/regionalLogos';
import { getFlyerProductByTemplate, lockContentToProduct } from './model/flyerProductModel';
import { useFlyerAutosave } from './hooks/useFlyerAutosave';
import { downloadFlyerCodeHtml } from './utils/codeExport';
import { loadCurrentDesignFromFirebase } from './lib/firebase';
import { canonicalFlyerDocumentId } from './data/flyerRepository';

export default function App() {
  useEffect(() => initWorkspaceShell('flyer-studio'), []);
  // View mode: 'editor' | 'dashboard'
  const [activeView, setActiveView] = useState<'editor' | 'dashboard'>('editor');
  const [perfectToast, setPerfectToast] = useState<string | null>(null);
  const foundation = getDNSFoundationRuntime();
  const [uiLanguage, setUiLanguageState] = useState<'de' | 'it'>(() => foundation.getLanguage());
  const [coreStatus, setCoreStatus] = useState<DNSCoreHeaderStatus>({ state: 'loading' });
  const [coreUserEmail, setCoreUserEmail] = useState<string | null>(null);
  const [coreUserId, setCoreUserId] = useState<string | null>(null);
  const [coreAuthError, setCoreAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [canReadFlyer, setCanReadFlyer] = useState(false);
  const [currentReportingAreaId, setCurrentReportingAreaId] = useState<string | null>(null);
  const [isDNSAdmin, setIsDNSAdmin] = useState(false);
  const [designPolicy, setDesignPolicy] = useState<DNSFlyerDesignPolicy>(DEFAULT_POLICY);
  const [designPanelOpen, setDesignPanelOpen] = useState(false);
  const [availabilityPolicy, setAvailabilityPolicy] = useState<DNSFlyerAvailabilityPolicy>(DEFAULT_FLYER_AVAILABILITY);
  const [availabilityStatus, setAvailabilityStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [availabilityPanelOpen, setAvailabilityPanelOpen] = useState(false);
  useEffect(() => {
    if (!coreUserId) {
      setDesignPolicy(DEFAULT_POLICY);
      setAvailabilityPolicy(DEFAULT_FLYER_AVAILABILITY);
      setAvailabilityStatus('loading');
      setAvailabilityError(null);
      return;
    }
    setAvailabilityStatus('loading');
    setAvailabilityError(null);
    const stopDesign = subscribeDesignPolicy(setDesignPolicy, error => console.warn('DNS Design Control configuration not available:', error));
    const stopAvailability = subscribeFlyerAvailabilityPolicy(policy => {
      setAvailabilityPolicy(policy);
      setAvailabilityStatus('ready');
      setAvailabilityError(null);
    }, error => {
      console.error('DNS Flyer availability configuration not available:', error);
      setAvailabilityStatus('error');
      setAvailabilityError(error);
    });
    return () => { stopDesign(); stopAvailability(); };
  }, [coreUserId]);
  const [hasDNSNetworkAccess, setHasDNSNetworkAccess] = useState(false);
  const [canWriteFlyer, setCanWriteFlyer] = useState(false);
  const [isLegacyMode, setIsLegacyMode] = useState(() => new URLSearchParams(window.location.search).get('legacy') === '1');

  // Initial Flyer Content from Template 1 or LocalStorage
  const [content, setContent] = useState<FlyerContent>(() => {
    // Try to load from localStorage first
    // Legacy shared draft keys are never read: they can belong to another account.
    const saved = null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized = normalizeFlyerContent(parsed);
        if (!normalized) throw new Error('Unsupported active flyer payload');
        const isPriceTable = normalized.graphicStyle === 'official_price_table' || normalized.graphicStyle === 'official_price_table_v1';
        if (isPriceTable) {
          const vis = {
            header: true,
            heroImage: true,
            priceTables: true,
            qrCode: true,
            disclaimer: true,
            footer: true,
            ...normalized.sectionVisibility,
            ...normalized.visibility
          };
          return {
            ...normalized,
            features: normalized.features || [],
            sectionVisibility: vis,
            visibility: vis
          };
        }
        return normalized;
      } catch (e) {
        console.error('Failed to parse saved flyer', e);
      }
    }

    const base = FLYER_TEMPLATES[0].defaultContent as FlyerContent;
    const defaultVis = base.sectionVisibility || {
      header: true,
      heroImage: true,
      earlyBird: false,
      promotionBox: false,
      priceTables: true,
      servicesBox: false,
      ecoBanner: false,
      qrCode: true,
      disclaimer: true,
      footer: true,
    };
    return {
      ...base,
      features: base.features || [],
      sectionVisibility: defaultVis,
      visibility: defaultVis,
    };
  });

  useEffect(() => foundation.subscribeLanguage(setUiLanguageState), [foundation]);

  const setUiLanguage = (language: 'de' | 'it') => {
    foundation.setLanguage(language);
  };

  useEffect(() => {
    void probeDNSCoreHeader().then(setCoreStatus);
    return subscribeDNSCoreUser(user => {
      setCanReadFlyer(false);
      setCanWriteFlyer(false);
      setCurrentStateReady(false);
      setCurrentStateError(null);
      // Never retain a previous user's visible editor state when authentication changes.
      setContent({ ...FLYER_TEMPLATES[0].defaultContent } as FlyerContent);
      setActiveView('editor');
      setIsShareModalOpen(false);
      setIsLegacyMode(false);
      setCoreUserEmail(user?.email ?? null);
      setCoreUserId(user?.uid ?? null);
      if (!user) {
        setCurrentReportingAreaId(null);
        setIsDNSAdmin(false);
        setHasDNSNetworkAccess(false);
        setCanWriteFlyer(false);
        return;
      }
      void loadCurrentFlyerAccess()
        .then(access => {
          setCurrentReportingAreaId(access.reportingAreaId ?? null);
          if (!access.isAdmin && access.reportingAreaId && access.canRead) {
            setContent(previous => ({
              ...previous,
              regionId: findReportingAreaLogo(access.reportingAreaId!).id,
              customRegionName: '',
            }));
          }
          setIsDNSAdmin(access.isAdmin);
          setHasDNSNetworkAccess(access.hasNetworkAccess);
          setCanWriteFlyer(access.canWrite);
          setCanReadFlyer(access.canRead);
        })
        .catch(error => {
          console.error('Failed to resolve DNS Core Flyer access:', error);
          setCurrentReportingAreaId(null);
          setIsDNSAdmin(false);
          setHasDNSNetworkAccess(false);
          setCanWriteFlyer(false);
          setCanReadFlyer(false);
        });
    });
  }, []);

  const handleCoreSignIn = async () => {
    setCoreAuthError(null);
    try {
      await signInDNSCore();
    } catch (error: unknown) {
      console.error('DNS Core sign-in failed:', error);
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setCoreAuthError(code === 'auth/unauthorized-domain'
        ? 'Dominio non autorizzato in Firebase Authentication (dns-core).'
        : code === 'auth/popup-blocked'
          ? 'Il browser ha bloccato la finestra di accesso. Consenti i popup per Flyer Studio.'
          : `Accesso DNS Core non riuscito${code ? ` (${code})` : ''}.`);
    }
  };

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setCoreAuthError(null);
    try {
      await signInDNSCoreWithEmail(loginEmail.trim(), loginPassword);
      setLoginPassword('');
    } catch (error: unknown) {
      setCoreAuthError((error as { code?: string })?.code || 'Accesso non riuscito');
    }
  };

  const handleCoreSignOut = async () => {
    try {
      await signOutDNSCore();
      setLoginPassword('');
      setContent({ ...FLYER_TEMPLATES[0].defaultContent } as FlyerContent);
    } catch (error) {
      console.error('DNS Core sign-out failed:', error);
    }
  };

  const setLegacyReviewMode = (enabled: boolean) => {
    const url = new URL(window.location.href);
    if (enabled) url.searchParams.set('legacy', '1');
    else url.searchParams.delete('legacy');
    window.history.replaceState({}, '', url);
    setIsLegacyMode(enabled);
  };

  // Save to localStorage whenever content changes
  React.useEffect(() => {
    if (!coreUserId) return;
    localStorage.setItem(`dns_active_flyer_${coreUserId}`, JSON.stringify(createFlyerDocumentV1(content, { source: 'editor' })));
  }, [content, coreUserId]);

  const [activeTemplateId, setActiveTemplateId] = useState<LayoutTemplateId>(() => {
    const savedId = localStorage.getItem('dns_active_template_id');
    return (savedId as LayoutTemplateId) || 'official_price_list';
  });

  React.useEffect(() => {
    localStorage.setItem('dns_active_template_id', activeTemplateId);
  }, [activeTemplateId]);
  
  // UI & Export State
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentStateReady, setCurrentStateReady] = useState(false);
  const [currentStateError, setCurrentStateError] = useState<string | null>(null);
  // DNS Core saves the active draft after edits settle; local recovery remains immediate.
  // Temporary export-language snapshots are deliberately excluded.
  const autosaveAllowed = canWriteFlyer && !!coreUserId && currentStateReady && !isExporting
    && !isLegacyMode;
  const autosave = useFlyerAutosave(content, coreUserId, autosaveAllowed);

  const handleSaveDraftNow = async (snapshot: FlyerContent = content, title?: string) => {
    if (!currentStateReady || currentStateError) throw new Error('FLYER_CURRENT_STATE_UNVERIFIED');
    if (!canWriteFlyer) throw new Error('FLYER_WRITE_PERMISSION_REQUIRED');
    if (!isDNSAdmin && (!currentReportingAreaId ||
      coreReportingAreaId(snapshot.regionId) !== currentReportingAreaId)) throw new Error('FLYER_AREA_SCOPE_DENIED');
    await autosave.saveNow(snapshot, title);
    if (title && title !== content.title) setContent(snapshot);
  };

  
  // Canvas DOM Reference for PDF & PNG capture
  const flyerRef = useRef<HTMLDivElement>(null);
  const exportFlyerRef = useRef<HTMLDivElement>(null);
  const [exportContent, setExportContent] = useState<FlyerContent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth - 64; // Padding
      const containerHeight = containerRef.current.clientHeight - 120; // Padding + Toolbar
      
      let flyerWidth = 210; // A4 Portrait base in mm
      let flyerHeight = 297;

      if (content.format === 'A3') { flyerWidth = 297; flyerHeight = 420; }
      if (content.format === 'A5') { flyerWidth = 148; flyerHeight = 210; }
      
      if (content.orientation === 'landscape') {
        [flyerWidth, flyerHeight] = [flyerHeight, flyerWidth];
      }

      // Convert mm to pixels (approx 1mm = 3.78px at 96dpi)
      const flyerWidthPx = flyerWidth * 3.78;
      const flyerHeightPx = flyerHeight * 3.78;

      const scaleW = containerWidth / flyerWidthPx;
      const scaleH = containerHeight / flyerHeightPx;
      
      setScale(Math.min(scaleW, scaleH, 1.2)); // Cap at 1.2x
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [content.format, content.orientation, activeView]);

  // Update Flyer Content partial
  const handleUpdateContent = (updated: Partial<FlyerContent>) => {
    if (!canWriteFlyer) return;
    setContent(prev => {
      const next = { ...prev, ...updated };
      if (!isDNSAdmin && currentReportingAreaId) {
        next.regionId = findReportingAreaLogo(currentReportingAreaId).id;
        next.customRegionalLogoUrl = undefined;
        next.customRegionName = '';
      }
      return next;
    });
  };

  // Apply a canonical Flyer type. The current Firestore state wins over template defaults.
  const handleApplyTemplate = async (templateId: LayoutTemplateId) => {
    const template = FLYER_TEMPLATES.find(t => t.id === templateId);
    if (!template?.defaultContent) return;
    const selectedProduct = getFlyerProductByTemplate(templateId);
    if (selectedProduct?.dataPolicy.access === 'dns-only' && !(isDNSAdmin || hasDNSNetworkAccess)) return;
    if (selectedProduct && !isDNSAdmin && (availabilityStatus !== 'ready' || !isFlyerProductEnabled(availabilityPolicy, selectedProduct.type))) return;

    const defaultVis = template.defaultContent.sectionVisibility || {
      header: true, bigTitle: true, heroImage: true, earlyBird: false,
      promotionBox: true, priceTables: true, servicesBox: true,
      sportsIcons: true, ecoBanner: true, qrCode: true, disclaimer: true, footer: true,
    };
    const candidate: FlyerContent = {
      ...content,
      ...template.defaultContent,
      layoutTemplateId: templateId,
      regionId: selectedProduct?.dataPolicy.access === 'dns-only'
        ? 'dns_central'
        : (currentReportingAreaId || template.defaultContent.regionId || content.regionId || 'dns_central'),
      translations: selectedProduct?.dataPolicy.languageMode === 'monolingual'
        ? template.defaultContent.translations
        : undefined,
      sectionVisibility: defaultVis,
      visibility: defaultVis,
      format: content.format || 'A4',
      orientation: content.orientation || 'portrait',
      activeLanguage: content.activeLanguage || 'it',
      logoVariant: content.logoVariant || 'default',
      logoCornerStyle: content.logoCornerStyle || 'rounded',
      showCropMarks: content.showCropMarks,
      importedImages: content.importedImages || [],
    };
    const scoped = selectedProduct ? lockContentToProduct(candidate, selectedProduct) : candidate;

    setActiveTemplateId(templateId);
    setCurrentStateReady(false);
    setCurrentStateError(null);
    try {
      const current = await loadCurrentDesignFromFirebase(scoped);
      if (current) {
        autosave.selectDraft(current.id, current.content);
        setContent(selectedProduct ? lockContentToProduct(current.content, selectedProduct) : current.content);
      } else {
        const currentId = canonicalFlyerDocumentId(scoped);
        autosave.selectDraft(currentId);
        setContent(scoped);
      }
      // The editor is safe to autosave only after a verified current-state
      // read or a verified absence of a current document.
      setCurrentStateReady(true);
    } catch (error: unknown) {
      console.error('Failed to load current Flyer state:', error);
      const code = error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : error instanceof Error ? error.message : 'FLYER_LOAD_FAILED';
      // Keep the previous content visible for reference, but never autosave a
      // default template over an unknown cloud state after a read failure.
      setCurrentStateError(code);
      setCurrentStateReady(false);
    }
  };

  useEffect(() => {
    if (!coreUserId || !canReadFlyer || !canWriteFlyer || currentStateReady || currentStateError) return;
    if (!isDNSAdmin && !currentReportingAreaId) return;
    // Auth and policy snapshots are asynchronous: retry initial flyer restore
    // once policy resolves. A denied/missing policy must never load a default flyer.
    if (!isDNSAdmin && availabilityStatus !== 'ready') return;
    void handleApplyTemplate(activeTemplateId);
  }, [coreUserId, canReadFlyer, canWriteFlyer, currentReportingAreaId, isDNSAdmin, activeTemplateId, currentStateReady, availabilityStatus, currentStateError]);


  const handleApplyLegacyTemplate = (templateId: LayoutTemplateId) => {
    const template = LEGACY_FLYER_TEMPLATES.find(t => t.id === templateId);
    if (!template?.defaultContent) return;

    setActiveTemplateId(templateId);
    setContent(prev => ({
      ...prev,
      ...template.defaultContent,
      layoutTemplateId: templateId,
      format: template.defaultContent.format || prev.format || 'A4',
      orientation: template.defaultContent.orientation || prev.orientation || 'portrait',
      activeLanguage: template.defaultContent.activeLanguage || prev.activeLanguage || 'it',
      importedImages: prev.importedImages || [],
      ...(!isDNSAdmin && currentReportingAreaId ? { regionId: findReportingAreaLogo(currentReportingAreaId).id } : {}),
    } as FlyerContent));
  };

  // Helper to compute optimal graphic sizes for format & orientation
  const getOptimalGraphicSizes = (fmt: PaperFormat, isLandscape: boolean) => {
    let swooshWidth = 220;
    let curveSize = 320;

    if (fmt === 'A3') {
      swooshWidth = isLandscape ? 440 : 360;
      curveSize = 520;
    } else if (fmt === 'A5') {
      swooshWidth = isLandscape ? 170 : 130;
      curveSize = 200;
    } else {
      // A4
      swooshWidth = isLandscape ? 290 : 230;
      curveSize = 340;
    }

    return { swooshWidth, curveSize };
  };

  // Toggle Format (A4, A5, A3)
  const handleChangeFormat = (format: PaperFormat) => {
    const product = getFlyerProductByTemplate(content.layoutTemplateId);
    if (product && !product.pagePolicy.formats.includes(format)) return;
    const isLandscape = content.orientation === 'landscape';
    const { swooshWidth, curveSize } = getOptimalGraphicSizes(format, isLandscape);

    setContent(prev => ({ 
      ...prev, 
      format,
      nordicSwoosh: prev.nordicSwoosh ? {
        ...prev.nordicSwoosh,
        customWidthPx: swooshWidth
      } : undefined,
      ornamentCurves: prev.ornamentCurves ? {
        ...prev.ornamentCurves,
        sizePx: curveSize
      } : undefined
    }));
  };

  // Toggle Orientation (Portrait / Landscape)
  const handleToggleOrientation = () => {
    if (getFlyerProductByTemplate(content.layoutTemplateId)?.dataPolicy.ticketType) return;
    const newOrientation: PaperOrientation = content.orientation === 'portrait' ? 'landscape' : 'portrait';
    const isLandscape = newOrientation === 'landscape';
    const fmt = content.format || 'A4';
    const { swooshWidth, curveSize } = getOptimalGraphicSizes(fmt, isLandscape);

    setContent(prev => ({
      ...prev,
      orientation: newOrientation,
      nordicSwoosh: prev.nordicSwoosh ? {
        ...prev.nordicSwoosh,
        customWidthPx: swooshWidth
      } : undefined,
      ornamentCurves: prev.ornamentCurves ? {
        ...prev.ornamentCurves,
        sizePx: curveSize
      } : undefined
    }));
  };

  // Toggle Crop Marks
  const handleToggleCropMarks = () => {
    setContent(prev => ({ ...prev, showCropMarks: !prev.showCropMarks }));
  };

  // The layout engine lives in a dedicated feature; App only connects UI state.
  const handleMakeItPerfect = async () => {
    const message = await runMakeItPerfect({
      content,
      applyContent: setContent,
      adjustHeroHeight: height => setContent(prev => ({ ...prev, heroImageHeightPx: height })),
      getCanvas: () => flyerRef.current,
    });
    setPerfectToast(message);
    setTimeout(() => setPerfectToast(null), 6000);
  };

  // State for Multilingual Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Export from a separate, native-size render: never rasterize the zoomed editor preview.
  // Language changes do not mutate the working draft or trigger autosave.
  const renderCanvasForLang = async (lang: LanguageCode) => {
    flushSync(() => setExportContent({ ...getContentForLanguage(content, lang), activeLanguage: lang }));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const flyerElement = exportFlyerRef.current;
    if (!flyerElement) throw new Error('Export canvas not mounted');
    // Export remains distinct from live editor: language and scale stay stable.
    for (let i = 0; i < 40 && flyerElement.dataset.pricingState === 'loading'; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (flyerElement.dataset.pricingState !== 'ready') throw new Error('Official prices unavailable during export');
    return captureCreativeFlyer(flyerElement);
  };

  // One PDF engine for every flyer. PNG remains a raster export.
  const renderPrintPageForLang = async (lang: LanguageCode): Promise<HTMLElement> => {
    flushSync(() => setExportContent({ ...getContentForLanguage(content, lang), activeLanguage: lang }));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const element=exportFlyerRef.current;
    if (!element) throw new Error('Export canvas not mounted');
    for(let i=0;i<50 && element.dataset.pricingState==='loading';i++) await new Promise(resolve=>setTimeout(resolve,100));
    if(element.dataset.pricingState && element.dataset.pricingState!=='ready') throw new Error('Official prices unavailable during export');
    return element.cloneNode(true) as HTMLElement;
  };
  const exportVectorPages = async (languages:LanguageCode[]) => {
    if(isExporting||!flyerRef.current) return;
    setIsExporting(true);
    try {
      const pages:HTMLElement[]=[];
      for(const language of languages) pages.push(await renderPrintPageForLang(language));
      await printVectorFlyerFromDOM(pages,{format:content.format,orientation:content.orientation});
    } catch(error) {
      console.error('Native PDF export failed:',error);
      window.alert(uiLanguage==='de'?'PDF-Druck fehlgeschlagen. Bitte Bilder und Layout prüfen.':'Stampa PDF non riuscita. Controlla immagini e impaginazione.');
    } finally {
      setExportContent(null);
      setIsExporting(false);
    }
  };
  const exportPngPages = async (languages:LanguageCode[]) => {
    if(isExporting||!flyerRef.current) return;
    setIsExporting(true);
    try {
      const geometry={format:content.format,orientation:content.orientation};
      for(const language of languages){
        const canvas=await renderCanvasForLang(language);
        await exportCreativePNG({canvases:[canvas],geometry,filename:`Dolomiti_NordicSki_${language.toUpperCase()}_${content.format}_${Date.now()}.png`});
      }
    } catch(error) {
      console.error('PNG export failed:',error);
      window.alert(uiLanguage==='de'?'PNG-Export fehlgeschlagen.':'Esportazione PNG non riuscita.');
    } finally {
      setExportContent(null);
      setIsExporting(false);
    }
  };
  const handleExportPdfBundle = () => exportVectorPages(['de','it','en']);
  const handleExportPdfSeparate = async () => {
    // The browser supports only one print dialog at a time.
    await exportVectorPages(['de','it','en']);
  };
  const handleExportPdfSingle = (language:LanguageCode) => exportVectorPages([language]);
  const handleExportPngSeparate = () => exportPngPages(['de','it','en']);
  const handleExportPngSingle = (language:LanguageCode) => exportPngPages([language]);
  const handleDNSNativePrint = () => exportVectorPages([content.activeLanguage || 'de']);

  const handleExportPng = () => handleExportPngSingle(content.activeLanguage || 'it');

  const handleExportCode = async () => {
    const product = getFlyerProductByTemplate(content.layoutTemplateId);
    if (product?.exportPolicy?.code !== 'html' || !flyerRef.current) return;
    setIsExporting(true);
    try {
      await downloadFlyerCodeHtml(flyerRef.current, content, content.activeLanguage || 'it');
    } catch (error) {
      console.error('Code export failed:', error);
      window.alert(uiLanguage === 'de' ? 'Code-Export fehlgeschlagen.' : 'Esportazione Code non riuscita.');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const isOnlineTicketModel = content.graphicStyle === 'online_ticket_manifesto' || content.graphicStyle === 'online_ticket_manifesto_v1';

  const uiCopy = uiLanguage === 'de'
    ? {
        format: 'Format',
        saveOpen: 'Projekte speichern/öffnen',
        rotate: 'Seite drehen',
        crop: 'Beschnitt',
        canvasHint: 'Inhalte und Gestaltung folgen dem Corporate Design von Dolomiti NordicSki (Be Vietnam Pro, Roboto, institutionelle Farbpalette).',
      }
    : {
        format: 'Formato',
        saveOpen: 'Salva/Apri Progetti',
        rotate: 'Ruota Pagina',
        crop: 'Rifilo',
        canvasHint: 'I contenuti inseriti e la grafica rispettano il Corporate Identity Manual di Dolomiti NordicSki (Be Vietnam Pro, Roboto, Palette Istituzionale).',
      };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-roboto select-none">
      
      {/* Top Navbar */}
      <Navbar
        paperFormat={content.format}
        onChangeFormat={handleChangeFormat}
        orientation={content.orientation}
        onToggleOrientation={handleToggleOrientation}
        showCropMarks={content.showCropMarks}
        onToggleCropMarks={handleToggleCropMarks}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onPrintPdf={() => setIsExportModalOpen(true)}
        onExportPng={() => setIsExportModalOpen(true)}
        isExporting={isExporting}
        activeView={activeView}
        onToggleView={(view) => setActiveView(view)}
        isOnlineTicketModel={isOnlineTicketModel}
        uiLanguage={uiLanguage}
        onUiLanguageChange={setUiLanguage}
        coreStatus={coreStatus}
        coreUserEmail={coreUserEmail}
        onCoreSignIn={handleCoreSignIn}
        onCoreSignOut={handleCoreSignOut}
      />
      {coreAuthError && (
        <div role="alert" className="bg-red-50 border-b border-red-200 text-red-800 px-4 py-2 text-sm flex items-center justify-between gap-4 no-print">
          <span>{coreAuthError}</span>
          <button type="button" className="font-bold underline" onClick={() => setCoreAuthError(null)}>Chiudi</button>
        </div>
      )}

      {coreUserId && canReadFlyer && currentStateError && (
        <div role="alert" className="bg-red-50 border-b border-red-300 text-red-900 px-5 py-3 text-sm no-print flex flex-wrap items-center justify-between gap-3">
          <span>{uiLanguage === 'de'
            ? `Flyer konnte nicht sicher aus DNS Core geladen werden (${currentStateError}). Automatisches Speichern ist gesperrt, um vorhandene Daten zu schützen.`
            : `Impossibile caricare in sicurezza il flyer da DNS Core (${currentStateError}). Salvataggio automatico bloccato per proteggere i dati esistenti.`}</span>
          <button type="button" className="font-bold underline" onClick={() => void handleApplyTemplate(activeTemplateId)}>
            {uiLanguage === 'de' ? 'Erneut versuchen' : 'Riprova'}
          </button>
        </div>
      )}
      {coreUserId && canReadFlyer && availabilityStatus !== 'ready' && (
        <div role="alert" className="bg-amber-50 border-b border-amber-300 text-amber-950 px-5 py-3 text-sm no-print">
          {availabilityStatus === 'error'
            ? `Disponibilità flyer non verificabile (Firestore: ${availabilityError ?? 'errore sconosciuto'}). Non è possibile scegliere un nuovo tipo finché non viene ripristinata la lettura.`
            : 'Caricamento disponibilità flyer in corso…'}
        </div>
      )}
      {coreUserId && canReadFlyer ? (
      <>
      {/* Make It Perfect Floating Toast Notification */}
      {perfectToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#0D4D5E] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#AAD0D1] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs font-bold font-vietnam">{perfectToast}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
        </div>
      )}

      {isDNSAdmin && !isLegacyMode && <div className="no-print flex justify-end gap-2 border-b bg-white px-5 py-2">
        <button type="button" onClick={() => setAvailabilityPanelOpen(true)} className="rounded-lg border border-[#0D4D5E] px-4 py-2 text-sm font-semibold text-[#0D4D5E]">Flyer disponibili</button>
        <button type="button" onClick={() => setDesignPanelOpen(true)} className="rounded-lg border border-[#0D4D5E] px-4 py-2 text-sm font-semibold text-[#0D4D5E]">DNS Design Control</button>
      </div>}
      {isDNSAdmin && availabilityPanelOpen && <DNSFlyerAvailabilityControl policy={availabilityPolicy} onClose={() => setAvailabilityPanelOpen(false)} />}
      {isDNSAdmin && designPanelOpen && <DNSDesignControl policy={designPolicy} onClose={() => setDesignPanelOpen(false)} />}
      {/* Main View Switching */}
      {activeView === 'dashboard' ? (
        <FlyerDashboard 
          uiLanguage={uiLanguage}
          onLoadFlyerIntoEditor={(loadedContent) => {
            autosave.selectDraft(null);
            setContent(loadedContent);
            setActiveView('editor');
          }}
        />
      ) : (
        /* Main Studio Workbench Area */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Sidebar Editor Controls */}
            {isLegacyMode ? (
              <LegacyEditorPanel
                uiLanguage={uiLanguage}
                content={content}
                onChangeContent={handleUpdateContent}
                onApplyTemplate={handleApplyLegacyTemplate}
                onMakeItPerfect={handleMakeItPerfect}
                onExitLegacy={() => setLegacyReviewMode(false)}
              />
            ) : (
              <EditorPanel
                autosaveStatus={autosave.status}
                autosaveErrorCode={autosave.errorCode}
                uiLanguage={uiLanguage}
                content={content}
                onChangeContent={handleUpdateContent}
                onApplyTemplate={handleApplyTemplate}
                onMakeItPerfect={handleMakeItPerfect}
                onChangeFormat={handleChangeFormat}
                onToggleOrientation={handleToggleOrientation}
                isDNSAdmin={isDNSAdmin || hasDNSNetworkAccess}
                availabilityPolicy={availabilityStatus === 'ready' ? availabilityPolicy : { ...DEFAULT_FLYER_AVAILABILITY, enabled: Object.fromEntries(Object.keys(DEFAULT_FLYER_AVAILABILITY.enabled).map(key => [key, false])) as DNSFlyerAvailabilityPolicy['enabled'] }}
                canBypassAvailability={isDNSAdmin}
                onOpenLegacy={() => setLegacyReviewMode(true)}
              />
            )}

          {/* Center / Right Canvas Live Preview Area */}
          <main 
            ref={containerRef}
            className="flex-1 bg-slate-100/90 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col items-center justify-start"
          >
            
            {/* Quick Format & Toolbar Info Overlay */}
            <div className="w-full max-w-[650px] mb-3 flex items-center justify-between text-xs text-slate-600 no-print">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-vietnam uppercase bg-[#0D4D5E] px-2.5 py-0.5 rounded-md shadow-xs">
                  {uiCopy.format} {content.format}
                </span>
                <span>•</span>
                <span className="capitalize font-medium text-slate-700">{content.orientation}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleOrientation}
                  className="hover:text-slate-900 flex items-center gap-1 transition-all text-slate-600 font-medium"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#417483]" />
                  <span>{uiCopy.rotate}</span>
                </button>
                <button
                  onClick={handleToggleCropMarks}
                  className={`flex items-center gap-1 transition-all font-medium ${content.showCropMarks ? 'text-[#0D4D5E] font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Eye className="w-3.5 h-3.5 text-[#417483]" />
                  <span>{uiCopy.crop}</span>
                </button>
              </div>
            </div>

            {/* The WYSIWYG Flyer Canvas */}
            <FlyerCanvas
              designPolicy={designPolicy}
              ref={flyerRef}
              content={content}
              scale={scale}
            />

            {/* Bottom Hint */}
            <div className="mt-4 text-center text-xs text-slate-500 no-print max-w-md font-medium">
              {uiCopy.canvasHint}
            </div>

          </main>

        </div>
      )}

      <footer data-dns-tool-footer className="no-print">
        <div className="dns-tool-footer-shell">
          <div className="dns-tool-footer-primary">Dolomiti NordicSki · Flyer Studio</div>
          <div className="dns-tool-footer-meta">
            {uiLanguage === 'de' ? 'Gemeinsame DNS Foundation · Benutzeroberfläche DE / IT' : 'DNS Foundation condivisa · Interfaccia DE / IT'}
          </div>
        </div>
      </footer>

      {/* Social Media Direct Sharing Modal */}
      <SocialShareModal
        uiLanguage={uiLanguage}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        content={content}
        onDownloadPng={handleExportPng}
      />

      {/* Native-sized print rasterization. Outside the editor preview and without CSS scale. */}
      {isExporting && exportContent && (
        <div data-dns-export-stage aria-hidden="true" style={{ position: 'fixed', left: '-20000px', top: 0, pointerEvents: 'none' }}>
          <FlyerCanvas ref={exportFlyerRef} content={exportContent} scale={1} designPolicy={designPolicy} />
        </div>
      )}

      {/* Multilingual Export & Print Modal */}
      <ExportModal
        uiLanguage={uiLanguage}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        format={content.format}
        activeLanguage={content.activeLanguage || 'it'}
        onExportPdfBundle={handleExportPdfBundle}
        onExportPdfSeparate={handleExportPdfSeparate}
        onExportPdfSingle={handleExportPdfSingle}
        onDNSNativeVectorPrint={handleDNSNativePrint}
        onExportPngSeparate={handleExportPngSeparate}
        onExportPngSingle={handleExportPngSingle}
        isExporting={isExporting}
        codeExportEnabled={getFlyerProductByTemplate(content.layoutTemplateId)?.exportPolicy?.code === 'html'}
        onExportCode={handleExportCode}
        isPriceTable={content.graphicStyle === 'official_price_table' || content.graphicStyle === 'official_price_table_v1'}
      />
      </>
      ) : (
        <section className="flex-1 flex items-center justify-center p-8 no-print">
          <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-[#0D4D5E]">DNS Flyer Studio</h1>
            <p className="my-3 text-sm text-slate-700">{coreUserId ? 'Account non autorizzato a Flyer Studio oppure accesso in verifica.' : 'Accedi con il tuo account DNS Identity.'}</p>
            {!coreUserId && <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
              <input aria-label="Email" type="email" required autoComplete="username" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} className="rounded border p-2" placeholder="Email" />
              <input aria-label="Password" type="password" required autoComplete="current-password" value={loginPassword} onChange={event => setLoginPassword(event.target.value)} className="rounded border p-2" placeholder="Password" />
              <button type="submit" className="rounded bg-[#0D4D5E] p-2 font-bold text-white">Accedi</button>
              <button type="button" onClick={handleCoreSignIn} className="rounded border p-2">Accedi con Google</button>
            </form>}
          </div>
        </section>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { Navbar } from './components/Navbar';
import { FlyerCanvas } from './components/FlyerCanvas';
import { EditorPanel } from './components/EditorPanel';
import { SocialShareModal } from './components/SocialShareModal';
import { SavedDesignsModal } from './components/SavedDesignsModal';
import { FlyerDashboard } from './components/FlyerDashboard';
import { FlyerContent, PaperFormat, PaperOrientation, LayoutTemplateId, LanguageCode } from './types';
import { FLYER_TEMPLATES } from './data/templates';
import { Printer, Download, Eye, RotateCw, Cloud, Sparkles, CheckCircle2 } from 'lucide-react';
import { ExportModal } from './components/ExportModal';
import { getContentForLanguage } from './utils/multilingual';
import { optimizeLayout } from './utils/layoutOptimizer';
import { probeDNSCoreHeader, type DNSCoreHeaderStatus } from './lib/dnsCoreHeader';
import { getDNSFoundationRuntime } from './lib/foundationRuntime';
import { createFlyerDocumentV1, normalizeFlyerContent } from './model/flyerDocument';
import { signInDNSCore, signOutDNSCore, subscribeDNSCoreUser } from './lib/dnsCore';
import { loadCurrentFlyerAccess } from './data/currentFlyerAccess';
import { getFlyerProductByTemplate, lockContentToProduct } from './model/flyerProductModel';

export default function App() {
  // View mode: 'editor' | 'dashboard'
  const [activeView, setActiveView] = useState<'editor' | 'dashboard'>('editor');
  const [perfectToast, setPerfectToast] = useState<string | null>(null);
  const foundation = getDNSFoundationRuntime();
  const [uiLanguage, setUiLanguageState] = useState<'de' | 'it'>(() => foundation.getLanguage());
  const [coreStatus, setCoreStatus] = useState<DNSCoreHeaderStatus>({ state: 'loading' });
  const [coreUserEmail, setCoreUserEmail] = useState<string | null>(null);
  const [currentReportingAreaId, setCurrentReportingAreaId] = useState<string | null>(null);
  const [isDNSAdmin, setIsDNSAdmin] = useState(false);

  // Initial Flyer Content from Template 1 or LocalStorage
  const [content, setContent] = useState<FlyerContent>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('dns_active_flyer');
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
      setCoreUserEmail(user?.email ?? null);
      if (!user) {
        setCurrentReportingAreaId(null);
        setIsDNSAdmin(false);
        return;
      }
      void loadCurrentFlyerAccess()
        .then(access => {
          setCurrentReportingAreaId(access.reportingAreaId ?? null);
          setIsDNSAdmin(access.isAdmin);
        })
        .catch(error => {
          console.error('Failed to resolve DNS Core Flyer access:', error);
          setCurrentReportingAreaId(null);
          setIsDNSAdmin(false);
        });
    });
  }, []);

  const handleCoreSignIn = async () => {
    try {
      await signInDNSCore();
    } catch (error) {
      console.error('DNS Core sign-in failed:', error);
    }
  };

  const handleCoreSignOut = async () => {
    try {
      await signOutDNSCore();
    } catch (error) {
      console.error('DNS Core sign-out failed:', error);
    }
  };

  // Save to localStorage whenever content changes
  React.useEffect(() => {
    localStorage.setItem('dns_active_flyer', JSON.stringify(createFlyerDocumentV1(content, { source: 'editor' })));
  }, [content]);

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
  const [isSavedDesignsModalOpen, setIsSavedDesignsModalOpen] = useState(false);
  
  // Canvas DOM Reference for PDF & PNG capture
  const flyerRef = useRef<HTMLDivElement>(null);
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
    setContent(prev => ({ ...prev, ...updated }));
  };

  // Apply Pre-built Template
  const handleApplyTemplate = (templateId: LayoutTemplateId) => {
    const template = FLYER_TEMPLATES.find(t => t.id === templateId);
    if (template && template.defaultContent) {
      const selectedProduct = getFlyerProductByTemplate(templateId);
      if (selectedProduct?.dataPolicy.access === 'dns-only' && !isDNSAdmin) {
        return;
      }
      setActiveTemplateId(templateId);
      setContent(prev => {
        const defaultVis = template.defaultContent.sectionVisibility || {
          header: true,
          bigTitle: true,
          heroImage: true,
          earlyBird: false,
          promotionBox: true,
          priceTables: true,
          servicesBox: true,
          sportsIcons: true,
          ecoBanner: true,
          qrCode: true,
          disclaimer: true,
          footer: true,
        };

        const product = getFlyerProductByTemplate(templateId);
        const newContent: FlyerContent = {
          ...prev,
          ...template.defaultContent,

          layoutTemplateId: templateId,
          regionId: product?.dataPolicy.access === 'dns-only'
            ? 'dns_central'
            : (currentReportingAreaId
              || template.defaultContent.regionId
              || prev.regionId
              || 'dns_central'),

          // Canonical monolingual ticket templates carry their approved DE/IT/EN
          // text sets; other products continue to initialize translations lazily.
          translations: product?.dataPolicy.languageMode === 'monolingual'
            ? template.defaultContent.translations
            : undefined,

          sectionVisibility: defaultVis,
          visibility: defaultVis,

          // Carry over persistent app preferences
          format: prev.format || 'A4',
          orientation: prev.orientation || 'portrait',
          activeLanguage: prev.activeLanguage || 'it',
          logoVariant: prev.logoVariant || 'default',
          logoCornerStyle: prev.logoCornerStyle || 'rounded',
          showCropMarks: prev.showCropMarks,
          importedImages: prev.importedImages || [],
        };

        return product ? lockContentToProduct(newContent, product) : newContent;
      });
    }
  };

  // Load Saved Design from Firebase
  const handleLoadSavedDesign = (savedContent: FlyerContent) => {
    const product = getFlyerProductByTemplate(savedContent.layoutTemplateId);
    const scopedContent = currentReportingAreaId
      ? { ...savedContent, regionId: currentReportingAreaId }
      : savedContent;
    setContent(product ? lockContentToProduct(scopedContent, product) : scopedContent);
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

  // MAKE IT PERFECT: Standardized layout-specific optimization algorithm for A3, A4, A5 (Portrait/Landscape)
  const handleMakeItPerfect = () => {
    const { content: updatedContent, message } = optimizeLayout(content);
    setContent(updatedContent);

    setPerfectToast(message);
    setTimeout(() => setPerfectToast(null), 4000);
  };

  // State for Multilingual Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Helper function to render a flyer canvas snapshot for a specific language
  const renderCanvasForLang = async (lang: LanguageCode) => {
    const flyerElement = flyerRef.current;
    if (!flyerElement) return null;

    const langContent = getContentForLanguage(content, lang);
    setContent(langContent);
    // Wait for React re-render tick
    await new Promise(r => setTimeout(r, 450));

    const canvas = await html2canvas(flyerElement, {
      scale: 3, // 300 DPI clarity
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    return canvas;
  };

  // 1. Export PDF Bundle (3 Pages: DE, IT, EN)
  const handleExportPdfBundle = async () => {
    if (!flyerRef.current) return;
    setIsExporting(true);
    const originalContent = { ...content };

    try {
      const doc = new jsPDF({
        orientation: content.orientation,
        unit: 'mm',
        format: content.format.toLowerCase() as any
      });

      const languages: LanguageCode[] = ['de', 'it', 'en'];
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        const canvas = await renderCanvasForLang(lang);
        if (!canvas) continue;

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) {
          doc.addPage();
        }
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      }

      doc.save(`Dolomiti_NordicSki_3Pagine_DE_IT_EN_${content.format}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF bundle:', err);
      window.print();
    } finally {
      setContent(originalContent);
      setIsExporting(false);
    }
  };

  // 2. Export 3 Separate PDF Files
  const handleExportPdfSeparate = async () => {
    if (!flyerRef.current) return;
    setIsExporting(true);
    const originalContent = { ...content };

    try {
      const languages: LanguageCode[] = ['de', 'it', 'en'];
      for (const lang of languages) {
        const canvas = await renderCanvasForLang(lang);
        if (!canvas) continue;

        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF({
          orientation: content.orientation,
          unit: 'mm',
          format: content.format.toLowerCase() as any
        });
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
        doc.save(`Dolomiti_NordicSki_${lang.toUpperCase()}_${content.format}_${Date.now()}.pdf`);
      }
    } catch (err) {
      console.error('Error exporting separate PDFs:', err);
    } finally {
      setContent(originalContent);
      setIsExporting(false);
    }
  };

  // 3. Export Single Language PDF
  const handleExportPdfSingle = async (lang: LanguageCode) => {
    if (!flyerRef.current) return;
    setIsExporting(true);
    const originalContent = { ...content };

    try {
      const canvas = await renderCanvasForLang(lang);
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({
        orientation: content.orientation,
        unit: 'mm',
        format: content.format.toLowerCase() as any
      });
      doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      doc.save(`Dolomiti_NordicSki_${lang.toUpperCase()}_${content.format}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error exporting single PDF:', err);
    } finally {
      setContent(originalContent);
      setIsExporting(false);
    }
  };

  // 4. Export 3 Separate PNG Files
  const handleExportPngSeparate = async () => {
    if (!flyerRef.current) return;
    setIsExporting(true);
    const originalContent = { ...content };

    try {
      const languages: LanguageCode[] = ['de', 'it', 'en'];
      for (const lang of languages) {
        const canvas = await renderCanvasForLang(lang);
        if (!canvas) continue;

        const link = document.createElement('a');
        link.download = `Dolomiti_NordicSki_${lang.toUpperCase()}_${content.format}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Error exporting separate PNGs:', err);
    } finally {
      setContent(originalContent);
      setIsExporting(false);
    }
  };

  // 5. Export Single Language PNG
  const handleExportPngSingle = async (lang: LanguageCode) => {
    if (!flyerRef.current) return;
    setIsExporting(true);
    const originalContent = { ...content };

    try {
      const canvas = await renderCanvasForLang(lang);
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `Dolomiti_NordicSki_${lang.toUpperCase()}_${content.format}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error exporting single PNG:', err);
    } finally {
      setContent(originalContent);
      setIsExporting(false);
    }
  };

  const handleExportPng = () => handleExportPngSingle(content.activeLanguage || 'it');

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
      />

      {/* Make It Perfect Floating Toast Notification */}
      {perfectToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#0D4D5E] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#AAD0D1] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs font-bold font-vietnam">{perfectToast}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
        </div>
      )}

      {/* Main View Switching */}
      {activeView === 'dashboard' ? (
        <FlyerDashboard 
          uiLanguage={uiLanguage}
          onLoadFlyerIntoEditor={(loadedContent) => {
            setContent(loadedContent);
            setActiveView('editor');
          }}
        />
      ) : (
        /* Main Studio Workbench Area */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Sidebar Editor Controls */}
            <EditorPanel
              uiLanguage={uiLanguage}
              content={content}
              onChangeContent={handleUpdateContent}
              onApplyTemplate={handleApplyTemplate}
              onOpenSavedDesignsModal={() => setIsSavedDesignsModalOpen(true)}
              onMakeItPerfect={handleMakeItPerfect}
              isDNSAdmin={isDNSAdmin}
            />

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
                  onClick={() => setIsSavedDesignsModalOpen(true)}
                  className="hover:text-slate-900 flex items-center gap-1 transition-all text-[#0D4D5E] font-bold"
                >
                  <Cloud className="w-3.5 h-3.5 text-[#417483]" />
                  <span>{uiCopy.saveOpen}</span>
                </button>
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

      {/* Firebase Cloud Saved Designs Modal */}
      <SavedDesignsModal
        uiLanguage={uiLanguage}
        isOpen={isSavedDesignsModalOpen}
        onClose={() => setIsSavedDesignsModalOpen(false)}
        currentContent={content}
        onLoadDesign={handleLoadSavedDesign}
      />

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
        onExportPngSeparate={handleExportPngSeparate}
        onExportPngSingle={handleExportPngSingle}
        isExporting={isExporting}
        isPriceTable={content.graphicStyle === 'official_price_table' || content.graphicStyle === 'official_price_table_v1'}
      />

    </div>
  );
}

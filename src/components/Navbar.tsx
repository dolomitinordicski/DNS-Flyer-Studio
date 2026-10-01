import React, { useEffect, useRef } from 'react';
import { Download, Eye, Printer, RotateCw, Share2 } from 'lucide-react';
import { DNS_DESIGN_SYSTEM } from '@dolomitinordicski/dns-shared-data/design-system';
import { initDNSNavigationRuntime } from '@dolomitinordicski/dns-shared-data/ui/navigation';
import { PaperFormat, PaperOrientation } from '../types';
import { AccessibilityMount } from './AccessibilityMount';
import type { DNSCoreHeaderStatus } from '../lib/dnsCoreHeader';

type UILanguage = 'de' | 'it';

interface NavbarProps {
  paperFormat: PaperFormat;
  onChangeFormat: (format: PaperFormat) => void;
  orientation: PaperOrientation;
  onToggleOrientation: () => void;
  showCropMarks: boolean;
  onToggleCropMarks: () => void;
  onOpenShareModal: () => void;
  onPrintPdf: () => void;
  onExportPng: () => void;
  isExporting: boolean;
  activeView: 'editor' | 'dashboard';
  onToggleView: (view: 'editor' | 'dashboard') => void;
  isOnlineTicketModel?: boolean;
  uiLanguage: UILanguage;
  onUiLanguageChange: (language: UILanguage) => void;
  coreStatus: DNSCoreHeaderStatus;
}

const copy = {
  de: {
    subtitle: 'Drucksorten & Layout',
    editor: 'Editor',
    dashboard: 'Übersicht',
    format: 'Format',
    portrait: 'Hochformat',
    landscape: 'Querformat',
    crop: 'Schnitt',
    share: 'Teilen',
    pdf: 'PDF',
  },
  it: {
    subtitle: 'Materiali grafici & layout',
    editor: 'Editor',
    dashboard: 'Dashboard',
    format: 'Formato',
    portrait: 'Verticale',
    landscape: 'Orizzontale',
    crop: 'Rifilo',
    share: 'Condividi',
    pdf: 'PDF',
  },
} as const;

export const Navbar: React.FC<NavbarProps> = ({
  paperFormat,
  onChangeFormat,
  orientation,
  onToggleOrientation,
  showCropMarks,
  onToggleCropMarks,
  onOpenShareModal,
  onPrintPdf,
  onExportPng,
  isExporting,
  activeView,
  onToggleView,
  isOnlineTicketModel = false,
  uiLanguage,
  onUiLanguageChange,
  coreStatus,
}) => {
  const t = copy[uiLanguage];
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!headerRef.current || !navRef.current) return;
    const runtime = initDNSNavigationRuntime({
      header: headerRef.current,
      nav: navRef.current,
      progressTrack: progressTrackRef.current,
      progressBar: progressBarRef.current,
      navigation: DNS_DESIGN_SYSTEM.navigation,
      responsive: DNS_DESIGN_SYSTEM.responsive,
      headerTokens: DNS_DESIGN_SYSTEM.header,
      motion: DNS_DESIGN_SYSTEM.motion,
    });
    return () => runtime.disconnect();
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        id="dns-flyer-header"
        className="sticky top-0 z-30 bg-[#0D4D5E] text-white shadow-[0_1px_0_rgba(255,255,255,.08)] no-print"
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-5 py-3.5 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src="https://dolomitinordicski.github.io/dns-shared-data/brand/logo-web.png"
              alt="Dolomiti NordicSki"
              className="h-10 w-auto shrink-0 object-contain"
            />
            <div className="min-w-0">
              <div className="whitespace-nowrap text-[22px] uppercase leading-none tracking-[.035em] text-white">
                <strong>DNS</strong> <span className="font-normal">FLYER STUDIO</span>
              </div>
              <div className="mt-1.5 truncate font-roboto text-[11px] font-normal uppercase leading-tight tracking-[.06em] text-[#AAD0D1]">
                {t.subtitle}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="flex items-center gap-3">
              <AccessibilityMount language={uiLanguage} />
              <div className="flex gap-3 text-[10px] font-bold uppercase tracking-[.06em]">
                {(['de', 'it'] as const).map(language => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => onUiLanguageChange(language)}
                    className={[
                      'border-0 border-b-2 bg-transparent px-1 py-1 text-white',
                      uiLanguage === language ? 'border-white' : 'border-transparent opacity-60',
                    ].join(' ')}
                    aria-pressed={uiLanguage === language}
                  >
                    {language.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={[
                'hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[.05em] xl:flex',
                coreStatus.state === 'ready' ? 'text-[#d8f0e7]' : '',
                coreStatus.state === 'error' ? 'text-[#ffd7d0]' : 'text-white/65',
              ].join(' ')}
              aria-live="polite"
            >
              <span
                className={[
                  'h-2 w-2 rounded-full',
                  coreStatus.state === 'ready' ? 'bg-emerald-400' : '',
                  coreStatus.state === 'error' ? 'bg-orange-400' : 'bg-[#AAD0D1]',
                ].join(' ')}
              />
              {coreStatus.state === 'ready'
                ? `${uiLanguage === 'de' ? 'DNS_Core verbunden' : 'DNS_Core connesso'} · ${coreStatus.reportingAreas}/${coreStatus.organizations}`
                : coreStatus.state === 'error'
                  ? (uiLanguage === 'de' ? 'DNS_Core nicht erreichbar' : 'DNS_Core non raggiungibile')
                  : (uiLanguage === 'de' ? 'DNS_Core verbindet…' : 'Connessione a DNS_Core…')}
            </div>
          </div>
        </div>
      </header>

      <nav ref={navRef} id="dns-flyer-nav" className="dns-tab-nav no-print" aria-label="DNS Flyer Studio">
        <div
          ref={progressTrackRef}
          className="dns-scroll-progress-track"
          role="progressbar"
          aria-label="Page scroll progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <span ref={progressBarRef} className="dns-scroll-progress-bar" />
        </div>

        <div className="dns-tab-nav-inner gap-1">
          <button
            type="button"
            onClick={() => onToggleView('editor')}
            className={['dns-tab', activeView === 'editor' ? 'dns-tab-active' : ''].join(' ')}
          >
            {t.editor}
          </button>
          <button
            type="button"
            onClick={() => onToggleView('dashboard')}
            className={['dns-tab', activeView === 'dashboard' ? 'dns-tab-active' : ''].join(' ')}
          >
            {t.dashboard}
          </button>

          <span className="mx-2 h-5 w-px shrink-0 bg-white/20" aria-hidden="true" />

          <div className="flex shrink-0 items-center gap-1">
            <span className="px-2 text-[9px] font-bold uppercase tracking-[.06em] text-white/60">{t.format}</span>
            {(['A4', 'A5', 'A3'] as PaperFormat[]).map(fmt => {
              const disabled = isOnlineTicketModel && fmt === 'A3';
              return (
                <button
                  key={fmt}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChangeFormat(fmt)}
                  className={[
                    'rounded px-2.5 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-30',
                    paperFormat === fmt ? 'bg-white text-[#0D4D5E]' : 'text-white/75 hover:text-white',
                  ].join(' ')}
                >
                  {fmt}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onToggleOrientation}
            disabled={isOnlineTicketModel}
            className="inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-[10px] font-semibold text-white/75 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {orientation === 'portrait' ? t.portrait : t.landscape}
          </button>

          <button
            type="button"
            onClick={onToggleCropMarks}
            className={[
              'inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-[10px] font-semibold',
              showCropMarks ? 'bg-white text-[#0D4D5E]' : 'text-white/75 hover:text-white',
            ].join(' ')}
          >
            <Eye className="h-3.5 w-3.5" />
            {t.crop}
          </button>

          <span className="flex-1" />

          <button
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-[10px] font-semibold text-white/75 hover:text-white"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t.share}
          </button>
          <button
            type="button"
            onClick={onExportPng}
            disabled={isExporting}
            className="inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-[10px] font-semibold text-white/75 hover:text-white disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            PNG
          </button>
          <button
            type="button"
            onClick={onPrintPdf}
            disabled={isExporting}
            className="inline-flex shrink-0 items-center gap-1.5 rounded bg-white px-3 py-1.5 text-[10px] font-bold text-[#0D4D5E] disabled:opacity-40"
          >
            <Printer className="h-3.5 w-3.5" />
            {t.pdf} · {paperFormat}
          </button>
        </div>
      </nav>
    </>
  );
};

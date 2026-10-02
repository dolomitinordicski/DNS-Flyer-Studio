import React from 'react';
import { Download, Eye, LogIn, LogOut, Printer, RotateCw, Share2 } from 'lucide-react';
import { formatDNSCoreHeaderStatus } from '@dolomitinordicski/dns-shared-data/ui/header-status';
import { PaperFormat, PaperOrientation } from '../types';
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
  coreUserEmail?: string | null;
  onCoreSignIn: () => void;
  onCoreSignOut: () => void;
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
    signIn: 'Anmelden',
    signOut: 'Abmelden',
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
    signIn: 'Accedi',
    signOut: 'Esci',
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
  coreUserEmail,
  onCoreSignIn,
  onCoreSignOut,
}) => {
  const t = copy[uiLanguage];
  const coreHeader = formatDNSCoreHeaderStatus(coreStatus, uiLanguage);

  return (
    <>
      <header
        data-dns-tool-header
        id="dns-flyer-header"
        className="bg-[#0D4D5E] text-white shadow-[0_1px_0_rgba(255,255,255,.08)] no-print"
      >
        <div className="dns-tool-header-shell">
          <div className="dns-tool-header-brand">
            <img
              src="https://dolomitinordicski.github.io/dns-shared-data/brand/logo-web.png"
              alt="Dolomiti NordicSki"
              className="dns-tool-header-logo"
            />
            <div className="dns-tool-header-identity">
              <div className="dns-tool-header-title"><strong>DNS</strong> <span>FLYER STUDIO</span></div>
              <div className="dns-tool-header-subtitle">{t.subtitle}</div>
            </div>
          </div>

          <div className="dns-tool-header-actions">
            <div className="dns-tool-header-controls">
              <div data-dns-accessibility-mount className="flex items-center" />
              <div className="dns-tool-header-language">
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

            <div className="flex items-center gap-2">
              <div className="dns-tool-header-status" data-state={coreHeader.state} aria-live="polite">
                <span className="dns-tool-header-status-dot" />
                {coreHeader.text}
              </div>
              {coreUserEmail ? (
                <button
                  type="button"
                  onClick={onCoreSignOut}
                  title={coreUserEmail}
                  className="inline-flex items-center gap-1 rounded border border-white/20 px-2 py-1 text-[9px] font-bold text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3 w-3" />
                  {t.signOut}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCoreSignIn}
                  className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[9px] font-bold text-[#0D4D5E]"
                >
                  <LogIn className="h-3 w-3" />
                  {t.signIn}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav data-dns-tool-nav data-dns-command-bar id="dns-flyer-nav" className="dns-tab-nav no-print" aria-label="DNS Flyer Studio command bar">
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

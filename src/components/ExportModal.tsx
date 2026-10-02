import React, { useState } from 'react';
import { X, Printer, Download, FileText, Globe, Check, Layers, Loader2 } from 'lucide-react';
import { PaperFormat, LanguageCode } from '../types';

interface ExportModalProps {
  uiLanguage: 'de' | 'it';
  isOpen: boolean;
  onClose: () => void;
  format: PaperFormat;
  activeLanguage: LanguageCode;
  onExportPdfBundle: () => Promise<void>;
  onExportPdfSeparate: () => Promise<void>;
  onExportPdfSingle: (lang: LanguageCode) => Promise<void>;
  onExportPngSeparate: () => Promise<void>;
  onExportPngSingle: (lang: LanguageCode) => Promise<void>;
  isExporting: boolean;
  isPriceTable?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  uiLanguage,
  isOpen,
  onClose,
  format,
  activeLanguage,
  onExportPdfBundle,
  onExportPdfSeparate,
  onExportPdfSingle,
  onExportPngSeparate,
  onExportPngSingle,
  isExporting,
  isPriceTable = false
}) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900 font-vietnam">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0D4D5E] to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl ring-1 ring-white/20">
              <Printer className="w-5 h-5 text-[#AAD0D1]" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {isPriceTable ? ui('Offizielle Preisliste exportieren & drucken', 'Esportazione & Stampa Listino Ufficiale') : ui('Mehrsprachig exportieren & drucken', 'Esportazione & Stampa Multilingua')}
              </h3>
              <p className="text-xs text-slate-300 font-medium">{ui('Gewähltes Format:', 'Formato Selezionato:')} <strong className="text-white">{format}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {isPriceTable ? (
            <div className="bg-[#0D4D5E]/10 border border-[#0D4D5E]/30 p-3.5 rounded-xl flex items-start gap-3 text-slate-900">
              <Globe className="w-5 h-5 text-[#0D4D5E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-[#0D4D5E] block">Modello Listino DNS e Regioni (Struttura Unificata)</span>
                <span className="text-[11px] text-slate-700 leading-relaxed block mt-0.5">
                  La compilazione in 3 lingue separate è disattivata per questo modello. Verrà generata la versione ufficiale unica ad alta risoluzione pronta per la stampa tipografica.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
              <Globe className="w-5 h-5 text-[#0D4D5E] shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">3 Lingue Configurate (DE / IT / EN)</span>
                <span className="text-[11px] text-slate-500">
                  Puoi scaricare un singolo PDF trilingue con 3 pagine ordinate, 3 file distinti per ciascuna lingua, oppure solo la lingua attiva (<strong>{activeLanguage.toUpperCase()}</strong>).
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">{ui('PDF-Exportoptionen:', 'Opzioni Esportazione PDF:')}</span>

            {isPriceTable ? (
              <button
                onClick={async () => {
                  await onExportPdfSingle(activeLanguage);
                  onClose();
                }}
                disabled={isExporting}
                className="w-full text-left p-4 bg-white hover:bg-slate-50 border border-[#0D4D5E] rounded-xl shadow-xs transition-all flex items-center justify-between group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0D4D5E] text-white rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-[#0D4D5E]">
                      📄 Scarica PDF Listino Prezzi Ufficiale (300 DPI)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Documento PDF vettoriale ad alta definizione per la stampa.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0D4D5E] bg-[#0D4D5E]/10 px-2.5 py-1 rounded-md shrink-0">Stampa HQ</span>
              </button>
            ) : (
              <>
                {/* Option 1: PDF Bundle 3 Pages */}
                <button
                  onClick={async () => {
                    await onExportPdfBundle();
                    onClose();
                  }}
                  disabled={isExporting}
                  className="w-full text-left p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-xl shadow-2xs transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0D4D5E]/10 group-hover:bg-[#0D4D5E] text-[#0D4D5E] group-hover:text-white rounded-lg transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block group-hover:text-[#0D4D5E] transition-colors">
                        📄 Documento Unico PDF (3 Pagine Trilingue: DE + IT + EN)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Un unico file PDF ad alta risoluzione (300 DPI) con Pagina 1: Tedesco, Pagina 2: Italiano, Pagina 3: Inglese.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0D4D5E] bg-[#0D4D5E]/10 px-2.5 py-1 rounded-md shrink-0">Consigliato</span>
                </button>

                {/* Option 2: 3 Separate PDF Files */}
                <button
                  onClick={async () => {
                    await onExportPdfSeparate();
                    onClose();
                  }}
                  disabled={isExporting}
                  className="w-full text-left p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-xl shadow-2xs transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white rounded-lg transition-all">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block group-hover:text-emerald-700 transition-colors">
                        📁 3 File PDF Separati (DE.pdf, IT.pdf, EN.pdf)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Genera e scarica 3 file PDF indipendenti, uno per ogni lingua.
                      </span>
                    </div>
                  </div>
                </button>

                {/* Option 3: Single Active Language PDF */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={async () => {
                      await onExportPdfSingle('de');
                      onClose();
                    }}
                    disabled={isExporting}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <span>🇩🇪</span>
                    <span>PDF DE</span>
                  </button>

                  <button
                    onClick={async () => {
                      await onExportPdfSingle('it');
                      onClose();
                    }}
                    disabled={isExporting}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <span>🇮🇹</span>
                    <span>PDF IT</span>
                  </button>

                  <button
                    onClick={async () => {
                      await onExportPdfSingle('en');
                      onClose();
                    }}
                    disabled={isExporting}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <span>🇬🇧</span>
                    <span>PDF EN</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">{ui('PNG-Bildexport:', 'Esportazione Immagine PNG:')}</span>
            
            <div className={isPriceTable ? "grid grid-cols-1" : "grid grid-cols-2 gap-2"}>
              {!isPriceTable && (
                <button
                  onClick={async () => {
                    await onExportPngSeparate();
                    onClose();
                  }}
                  disabled={isExporting}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>3 Immagini PNG (DE, IT, EN)</span>
                </button>
              )}

              <button
                onClick={async () => {
                  await onExportPngSingle(activeLanguage);
                  onClose();
                }}
                disabled={isExporting}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#0D4D5E]" />
                <span>Scarica Immagine PNG Listino</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          {isExporting ? (
            <div className="flex items-center gap-2 text-[#0D4D5E] font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{ui('Dokumente werden erstellt...', 'Generazione documenti in corso...')}</span>
            </div>
          ) : (
            <span>{ui('Bereit für den Export', "Pronto per l'esportazione tipografica")}</span>
          )}

          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-all"
          >
            Annulla
          </button>
        </div>

      </div>
    </div>
  );
};

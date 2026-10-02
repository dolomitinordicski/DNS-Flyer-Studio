import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Dumbbell,
  Eye,
  Globe,
  Hotel,
  Move,
  Plus,
  ShieldCheck,
  Ticket,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import type {
  FlyerContent,
  FlyerSectionId,
  LanguageCode,
  MultilingualTextSet,
} from '../../types';
import {
  DEFAULT_PRICE_LIST_TEXTS,
  DIGITAL_PASS_PRESETS,
} from '../../data/templates';
import { DIGITAL_PASS_REGIONS } from '../blocks/RegionalAreasGridBlock';
import { DEFAULT_SECTION_ORDER } from '../flyer-variants/VariantTypes';
import {
  LANGUAGE_OPTIONS,
  getContentForLanguage,
  getInitialTranslations,
} from '../../utils/multilingual';
import { WireframeIcon } from '../WireframeIcon';
import { STOCK_IMAGES } from './editorAssets';

interface ContentEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  activeOrderOrientation: 'portrait' | 'landscape';
  setActiveOrderOrientation: React.Dispatch<React.SetStateAction<'portrait' | 'landscape'>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenIconsTab: () => void;
  onAddFeature: () => void;
  onUpdateFeature: (id: string, text: string) => void;
  onRemoveFeature: (id: string) => void;
}

export function ContentEditorTab({
  uiLanguage,
  content,
  onChangeContent,
  activeOrderOrientation,
  setActiveOrderOrientation,
  fileInputRef,
  onOpenIconsTab,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature,
}: ContentEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const setActiveTab = (tab: string) => {
    if (tab === 'icons') onOpenIconsTab();
  };
  const handleAddFeature = onAddFeature;
  const handleUpdateFeature = onUpdateFeature;
  const handleRemoveFeature = onRemoveFeature;

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
                    {ui('Flyer-Inhalte & Texte', 'Contenuti & Testi Volantino')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ui('Texte in DE / IT / EN bearbeiten, Bereiche ein-/ausblenden und ihre Reihenfolge festlegen.', 'Modifica i testi nelle 3 lingue (DE / IT / EN), attiva/disattiva le sezioni e regolane l\'ordinamento.')}
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
                      <span className="font-bold text-xs tracking-wide">{ui('Mehrsprachige Bearbeitung (3 Sprachen)', 'Compilazione Multilingua (3 Lingue)')}</span>
                    </div>
                    <span className="text-[10px] bg-[#AAD0D1]/20 text-[#AAD0D1] font-bold px-2 py-0.5 rounded-full">
                      {ui('Aktive Sprache:', 'Lingua Attiva:')} {activeLang.toUpperCase()}
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
                  <span className="text-xs font-bold font-vietnam">{ui('Bereichsreihenfolge nach Format:', 'Ordinamento Sezioni per Formato:')}</span>
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
                      {ui('Digital-Pass-Vorlage', 'Modello Digital Pass')}
                    </span>
                  </div>

                  {/* 1. SELETTORE PASS PRESET & TABELLA VALIDITÀ 8 REGIONI */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3 shadow-2xs">
                    <div className="font-extrabold text-[11px] text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center justify-between">
                      <span>🎫 Tipologia Pass & Tabella 8 Aree</span>
                    </div>

                    {/* Preset Buttons */}
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold mb-1">{ui('Pass-Vorlage wählen:', 'Seleziona Preset Modello Pass:')}</label>
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
                              <span>{ui('Laden', 'Carica')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Galleria rapida foto di esempio */}
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">{ui('Beispielbild wählen:', 'Seleziona Immagine di Esempio:')}</label>
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
                            <span>{ui('Bildhöhe (px):', 'Altezza Immagine (Px):')}</span>
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
                          <span className="text-[9.5px] font-black text-[#0D4D5E] uppercase block">{ui('Preis- und Tarifdetails:', 'Dettagli Prezzo e Tariffa:')}</span>
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
                              <span>{ui('Laden', 'Carica')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Galleria rapida foto di esempio */}
                        <div>
                          <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">{ui('Beispielbild wählen:', 'Seleziona Immagine di Esempio:')}</label>
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
                            <span>{ui('Bildhöhe (px):', 'Altezza Immagine (Px):')}</span>
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
                              {ui('Aktive Icons:', 'Icone attive sul listino:')}
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
                            <span>{ui('Icon-Bibliothek verwalten →', 'Gestisci Libreria Icone →')}</span>
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
                              <span>{ui('Eintrag hinzufügen', 'Aggiungi Voce')}</span>
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
                                    title={ui('Eintrag löschen', 'Elimina voce')}
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
                              {ui('Aktive Icons:', 'Icone attive sul listino:')}
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
                            <span>{ui('Icon-Bibliothek verwalten →', 'Gestisci Libreria Icone →')}</span>
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
                                <span>{ui('Fotohöhe:', 'Altezza Foto:')}</span>
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
                                title={ui('Eintrag löschen', 'Elimina voce')}
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
                            <span>{ui('Leistung hinzufügen', 'Aggiungi Servizio al Pacchetto')}</span>
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
                            <span>{ui('Icon-Bibliothek verwalten', 'Gestisci Libreria Icone')}</span>
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
        
}

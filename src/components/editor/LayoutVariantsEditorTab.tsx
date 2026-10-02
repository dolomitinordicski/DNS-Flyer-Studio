import React from 'react';
import { CheckCircle2, Layout, ShieldCheck, Sparkles, Square } from 'lucide-react';
import type { FlyerContent } from '../../types';

interface LayoutVariantsEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  onMakeItPerfect?: () => void;
}

export function LayoutVariantsEditorTab({ uiLanguage, content, onChangeContent, onMakeItPerfect }: LayoutVariantsEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  return (
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
                        <span>{ui('Kanten & Ecken', 'Stile Bordi ed Angoli Elementi')}</span>
                      </h4>
                      <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                        {content.cornerStyle === 'sharp' ? 'A Spigolo' : content.cornerStyle === 'none' ? 'Senza Bordo' : 'Arrotondati'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {ui('Wähle abgerundete, eckige oder randlose Elemente.', 'Scegli se applicare angoli morbidi arrotondati, spigoli squadrati oppure rimuovere completamente il bordo a card, box e immagini.')}
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
                        id: 'modern_glacier',
                        name: '2. Modern Glacier Carousel (Blocchi)',
                        desc: 'Layout contemporaneo con blocco azzurro ghiacciaio in alto, ampia foto panoramica split e card fluttuanti.',
                        badge: 'Stile Carosello'
                      },
                      {
                        id: 'nordic_modern',
                        name: '3. Nordic Modern High-Contrast (Blocchi)',
                        desc: 'Stile moderno scuro ad alto contrasto con dettagli cyan, gradienti sportivi e grafica dinamica.',
                        badge: 'Modern Dark'
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
  );
}

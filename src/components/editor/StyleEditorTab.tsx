import React from 'react';
import { Check, Palette, Sliders, Square } from 'lucide-react';
import type { BrandColorScheme, FlyerContent } from '../../types';

interface StyleEditorTabProps {
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
}

export function StyleEditorTab({ content, onChangeContent }: StyleEditorTabProps) {
  return (
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
  );
}

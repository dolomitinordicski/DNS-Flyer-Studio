import React from 'react';
import { Eye, Sparkles } from 'lucide-react';
import type { FlyerContent, SectionVisibility } from '../../types';
import { OFFICIAL_ASSET_PATHS } from '../CorporateVectors';

interface GraphicElementsEditorTabProps {
  uiLanguage: 'de' | 'it';
  content: FlyerContent;
  currentVis: SectionVisibility;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  onOpenContentTab: () => void;
}

export function GraphicElementsEditorTab({ uiLanguage, content, currentVis, onChangeContent, onOpenContentTab }: GraphicElementsEditorTabProps) {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const setActiveTab = () => onOpenContentTab();
  return (
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
                            {ui('Offizielle Grafikvariante', 'Variante Grafica Ufficiale')}
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
                            <span>{ui('Größe / Skalierung', 'Dimensione / Ingrandimento Grafica')}</span>
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
                                {ui('✏️ Texte bearbeiten →', '✏️ Modifica Testi →')}
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
  );
}

import React from 'react';
import { BlockProps } from './BlockTypes';
import { OFFICIAL_ASSET_PATHS } from '../CorporateVectors';
import { getPriceTablePresentation } from './priceTablePresentation';

export const PriceTableBlock: React.FC<BlockProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  visibility,
  format
}) => {
  if (visibility && visibility.priceTables === false) return null;
  if (!plt) return null;

  const presentation = getPriceTablePresentation(content, plt);
  const isRegionalList = presentation.singleColumn;
  const isDNSList = presentation.networkEmphasis;
  // For both official price lists all commercial descriptions are printed
  // together in DE / IT / EN, independently of the editor UI language.
  const isRegionalProduct = content.layoutTemplateId === 'regional_price_list';
  const regionCompact = isRegionalProduct && content.orientation === 'landscape'
    && !content.regionalLocalText?.trim() && !(content.regionalLocalServices?.length);
  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';

  const primaryColor = theme.primaryHex || '#004B87';
  const secondaryColor = theme.secondaryHex || '#003366';
  const accentColor = theme.accentHex || '#3399FF';

  return (
    <div className="space-y-1 shrink-0 min-w-0 w-full" data-price-list-variant={presentation.kind}>
      <div className={`grid ${isRegionalList || regionCompact ? "grid-cols-1" : "grid-cols-2"} ${isA5 ? 'gap-1.5' : 'gap-2 sm:gap-3'}`}>
        {/* Regional rates: main section for area flyers, comparative section on network flyers. */}
        <div 
          className={`border bg-white/95 overflow-hidden flex flex-col ${isRegionalProduct ? "order-2" : "order-1"} ${isDNSList ? "rounded-sm" : isRegionalList ? "rounded-md border-2 shadow-xs" : "rounded-xl shadow-xs"}`} 
          style={{ borderColor: isRegionalList ? primaryColor : `${accentColor}80` }}
        >
          <div 
            className={`text-white ${isA5 ? 'p-1.5' : isA3 ? 'p-3' : 'p-2'} flex items-center justify-between uppercase shrink-0`} 
            style={{ backgroundColor: primaryColor }}
          >
            <div className="min-w-0 flex flex-col">
              <span className={`${isA5 ? 'text-[6.5px]' : isA3 ? 'text-xs' : 'text-[7.5px]'} font-bold opacity-80 tracking-widest leading-none`}>
                {presentation.areaHeader}
              </span>
              <span className={`${isA5 ? 'text-[9.5px]' : isA3 ? 'text-base' : 'text-[11px]'} font-black tracking-tight leading-tight break-words`}>
                {presentation.areaName || (regionLogo?.id === 'dns_central' ? regionLogo.regionName : regionLogo?.regionName || regionLogo?.name) || 'REGIONAL AREA'}
              </span>
            </div>
            {regionLogo && regionLogo.id !== 'dns_central' && (
              <div 
                className={`shrink-0 flex items-center justify-center gap-1.5 ${
                  (content.logoCornerStyle || 'rounded') === 'none' 
                    ? '' 
                    : (content.logoCornerStyle === 'sharp' ? 'rounded-none border p-1 bg-white/20' : 'rounded border p-1 bg-white/20 shadow-2xs')
                } ${
                  (content.logoCornerStyle || 'rounded') !== 'none' ? 'backdrop-blur-xs border-white/30' : ''
                }`}
                style={{ transform: `scale(${(regionLogo.regionalLogoScale || 100) / 100})`, transformOrigin: 'right center' }}
              >
                <img 
                  src={regionLogo.logoWhiteSrc || regionLogo.logoSrc || OFFICIAL_ASSET_PATHS.logoNegativ} 
                  className={`${isA5 ? 'h-3' : isA3 ? 'h-6' : 'h-3.5'} w-auto object-contain max-w-[65px]`} 
                  alt={regionLogo.name} 
                />
                {regionLogo.secondaryLogoSrc && (
                  <img 
                    src={regionLogo.secondaryLogoWhiteSrc || regionLogo.secondaryLogoSrc} 
                    className={`${isA5 ? 'h-3' : isA3 ? 'h-6' : 'h-3.5'} w-auto object-contain max-w-[65px]`} 
                    alt={`${regionLogo.name} Secondary`} 
                  />
                )}
              </div>
            )}
          </div>
          <div className={`${isA5 ? 'p-1.5 space-y-0.5' : isA3 ? 'p-3.5 space-y-2' : 'p-2 space-y-1'}`}>
            {[
              { title: plt.regionalDayTitle, sub: plt.regionalDaySub, price: plt.regionalDayPrice, supplement: isRegionalProduct ? plt.regionalDayTrackSupplement : undefined },
              { title: plt.regionalWeekTitle, sub: plt.regionalWeekSub, price: plt.regionalWeekPrice, supplement: isRegionalProduct ? plt.regionalWeekTrackSupplement : undefined },
              { title: plt.regionalSeasonTitle, sub: plt.regionalSeasonSub, price: plt.regionalSeasonPrice, supplement: undefined as string | undefined }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0 gap-1.5">
                <div className="min-w-0 flex-1">
                  <span className={`font-black ${isA5 ? 'text-[8px]' : isA3 ? 'text-sm' : 'text-[9.5px]'} block leading-tight break-words`} style={{ color: primaryColor }}>{item.title}</span>
                  {item.sub && <span className={`${isA3 ? 'text-[10px]' : 'text-[7px]'} text-slate-500 block leading-tight font-medium mt-0.5 uppercase tracking-tight opacity-90 break-words`}>{item.sub}</span>}
                </div>
                <div className={`${isA5 ? 'text-[8px] px-1 py-0.5' : isA3 ? 'text-sm px-2.5 py-1' : isDNSList || isRegionalProduct ? 'text-[12px] px-1 py-1' : 'text-[9.5px] px-1.5 py-0.5'} shrink-0 ${isDNSList ? "" : "bg-slate-50 rounded border border-slate-100"} flex flex-col items-end text-right leading-tight max-w-[155px]`} style={{ color: primaryColor }}>
                  {(() => {
                    if (!item.price) return null;
                    const match = item.price.match(/^([^(]+)(\(.+\))$/);
                    if (match) {
                      return (
                        <>
                          <span className="font-black whitespace-nowrap">{match[1].trim()}</span>
                          <span className="font-normal italic text-[6.5px] sm:text-[7px] text-slate-600 block mt-0.5 break-words max-w-[100px]">
                            {match[2].trim()}
                          </span>
                        </>
                      );
                    }
                    return <span className="font-black break-words">{item.price}</span>;
                  })()}
                  {item.supplement && item.supplement !== '—' && <span className="font-medium text-[8px] text-slate-600 mt-1 leading-snug max-w-[135px]">Aufpreis Loipe · Supplemento pista · Track surcharge: {item.supplement}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isRegionalList && (
        <div 
          className={`border bg-white/95 overflow-hidden flex flex-col ${isRegionalProduct ? "order-1 rounded-sm" : "order-2 rounded-xl"} shadow-xs`} 
          style={{ borderColor: isDNSList ? secondaryColor : `${accentColor}80`, borderWidth: isDNSList ? 2 : 1 }}
        >
          <div 
            className={`text-white font-black ${isA5 ? 'text-[8.5px] p-1.5' : isA3 ? 'text-sm p-3' : 'text-[10px] p-2'} text-center uppercase tracking-widest flex-1 flex items-center justify-center`} 
            style={{ backgroundColor: secondaryColor }}
          >
            {presentation.networkHeader}
          </div>
          <div className={`${isA5 ? 'p-1.5 space-y-0.5' : isA3 ? 'p-3.5 space-y-2' : 'p-2 space-y-1'}`}>
            {[
              { title: plt.carouselWeekTitle, sub: plt.carouselWeekSub, price: plt.carouselWeekPrice, supplement: presentation.weeklyTrackSupplement },
              { title: plt.carouselSeasonTitle, sub: plt.carouselSeasonSub, price: plt.carouselSeasonPrice, supplement: undefined as string | undefined }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0 gap-1.5">
                <div className="min-w-0 flex-1">
                  <span className={`font-black ${isA5 ? 'text-[8px]' : isA3 ? 'text-sm' : 'text-[9.5px]'} block leading-tight break-words`} style={{ color: primaryColor }}>{item.title}</span>
                  {item.sub && <span className={`${isA3 ? 'text-[10px]' : 'text-[7px]'} text-slate-500 block leading-tight font-medium mt-0.5 uppercase tracking-tight opacity-90 break-words`}>{item.sub}</span>}
                </div>
                <div className={`${isA5 ? 'text-[8px] px-1 py-0.5' : isA3 ? 'text-sm px-2.5 py-1' : isDNSList || isRegionalProduct ? 'text-[13px] px-1 py-1' : 'text-[9.5px] px-1.5 py-0.5'} shrink-0 ${isDNSList ? "" : "bg-slate-50 rounded border border-slate-100"} flex flex-col items-end text-right leading-tight ${isDNSList ? "max-w-[150px]" : "max-w-[120px]"}`} style={{ color: primaryColor }}>
                  {(() => {
                    if (!item.price) return null;
                    const match = item.price.match(/^([^(]+)(\(.+\))$/);
                    if (match) {
                      return (
                        <>
                          <span className="font-black whitespace-nowrap">{match[1].trim()}</span>
                          <span className="font-normal italic text-[6.5px] sm:text-[7px] text-slate-600 block mt-0.5 break-words max-w-[100px]">
                            {match[2].trim()}
                          </span>
                        </>
                      );
                    }
                    return <span className="font-black break-words">{item.price}</span>;
                  })()}
                  {item.supplement && item.supplement !== '—' && <span className="font-medium text-[8px] text-slate-600 mt-1 leading-snug max-w-[135px]">Aufpreis Loipe · Supplemento pista · Track surcharge: {item.supplement}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
      {plt.regionalNote && (
        <p className={`${isA3 ? 'text-xs' : 'text-[7.5px]'} text-slate-400 italic px-1 leading-relaxed text-center font-bold tracking-tight`}>
          {plt.regionalNote}
        </p>
      )}
    </div>
  );
};

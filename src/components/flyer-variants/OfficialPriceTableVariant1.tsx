import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as LucideIcons from 'lucide-react';
import { FlyerVariantProps, DEFAULT_SECTION_ORDER } from './VariantTypes';
import { FlyerSectionId } from '../../types';
import { PromoHeroBlock } from '../blocks/PromoHeroBlock';
import { 
  DolomitiCurvesVector, 
  DolomitiNordicSkiLogo,
  OFFICIAL_ASSET_PATHS 
} from '../CorporateVectors';
import { WireframeIcon } from '../WireframeIcon';
import { getSportsIconName } from '../../data/sportsIcons';
import { getLegalNoticeItems } from '../../utils/disclaimerUtils';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';
import { isSvgUrl } from '../../utils/logoUtils';

export const OfficialPriceTableVariant1: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons,
  visibility
}) => {
  const activeColors = {
    primary: theme.primaryHex,
    secondary: theme.secondaryHex,
    accent: theme.accentHex,
  };
  const isBackground = content.heroImagePosition === 'background';
  const isLandscape = content.orientation === 'landscape';

  const translations = content.translations || {};
  const it = translations.it || {};
  const de = translations.de || {};
  const en = translations.en || {};

  const isTrilingualMode = content.languageMode === 'trilingual' || (!content.languageMode && (content.graphicStyle === 'official_price_table' || content.graphicStyle === 'official_price_table_v1'));

  const getTri = (key: string, fallback: string) => {
    if (!isTrilingualMode) {
      return fallback;
    }
    const getVal = (set: any) => {
      // 1. Check direct key (e.g. 'title')
      if (typeof set[key] === 'string' && set[key].trim()) return set[key];
      // 2. Check priceListTexts (e.g. 'mainTitle')
      if (set.priceListTexts && typeof set.priceListTexts[key] === 'string' && set.priceListTexts[key].trim()) return set.priceListTexts[key];
      // 3. Common aliases
      if (key === 'mainTitle' && typeof set.title === 'string' && set.title.trim()) return set.title;
      if (key === 'subTitle' && typeof set.subtitle === 'string' && set.subtitle.trim()) return set.subtitle;
      if (key === 'bannerTitle' && typeof set.badgeText === 'string' && set.badgeText.trim()) return set.badgeText;
      return null;
    };

    const valIt = getVal(it);
    const valDe = getVal(de);
    const valEn = getVal(en);

    if (!valIt && !valDe && !valEn) return fallback;
    return [valDe, valIt, valEn].filter(Boolean).join(' • ');
  };

  const activeSectionOrder = isLandscape
    ? (content.sectionOrderLandscape && content.sectionOrderLandscape.length > 0 ? content.sectionOrderLandscape : DEFAULT_SECTION_ORDER)
    : (content.sectionOrderPortrait && content.sectionOrderPortrait.length > 0 ? content.sectionOrderPortrait : DEFAULT_SECTION_ORDER);
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';

  // Calculate density & format adaptive spacing
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const isAiry = visibleCount < 6;

  // Format-responsive gap & padding
  const mainGap = isA5 
    ? (isLandscape ? 'gap-1' : (isAiry ? 'gap-2' : 'gap-1.5'))
    : isA3 
    ? (isAiry ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-5')
    : (isAiry ? 'gap-5 sm:gap-6' : 'gap-2 sm:gap-3');

  const mainPadding = isA5
    ? (isLandscape ? 'p-1.5' : 'p-2.5')
    : isA3
    ? 'p-8 sm:p-12'
    : (isAiry ? 'p-5 sm:p-6' : 'p-4 sm:p-5');

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between ${isBackground ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} ${mainPadding} font-vietnam space-y-2 overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
    >
      
      {/* Background Image (Full Cover) */}
      {visibility.heroImage && isBackground && content.heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={content.heroImageUrl} 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div 
            className="absolute inset-0 bg-slate-950"
            style={{ opacity: content.heroOverlayOpacity / 100 }}
          />
        </div>
      )}
      
      {/* Integrated Vector Kurve Header Watermark graphic */}
      {(content.ornamentCurves?.enabled ?? true) && (
        <div 
          className="absolute -top-6 right-0 h-36 pointer-events-none z-0 transition-all"
          style={{
            width: `${content.ornamentCurves?.sizePx || (isA5 ? 200 : isA3 ? 520 : 340)}px`,
            opacity: ((content.ornamentCurves?.opacity ?? 25) / 100)
          }}
        >
          <DolomitiCurvesVector color1={activeColors.accent} color2={isBackground ? '#FFFFFF' : activeColors.primary} strokeWidth={6} />
        </div>
      )}

      {/* Header: Clean Title with Trilingual Subtitle */}
      {visibility.header && (
        <div 
          className="relative z-20 flex items-center justify-between border-b-2 pb-2.5 sm:pb-3.5 shrink-0 gap-2"
          style={{ borderColor: isBackground ? 'rgba(255,255,255,0.3)' : activeColors.primary }}
        >
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 sm:gap-3 flex-wrap">
              <span 
                className={`${isA5 ? (isLandscape ? 'text-lg' : 'text-xl') : isA3 ? 'text-6xl sm:text-7xl' : isLandscape ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-black leading-none tracking-tighter`}
                style={{ color: isBackground ? '#FFFFFF' : activeColors.primary }}
              >
                {plt.seasonYear}
              </span>
              <h2 
                className={`${isA5 ? (isLandscape ? 'text-xs' : 'text-sm') : isA3 ? 'text-3xl sm:text-4xl' : isLandscape ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tight break-words`}
                style={{ color: isBackground ? '#FFFFFF' : activeColors.primary }}
              >
                {getTri('mainTitle', content.title || 'PRICES & INFORMATION').replace(new RegExp(`^${(plt.seasonYear || '').replace('/', '\\/')}\\s*`, 'i'), '')}
              </h2>
            </div>
            <p 
              className={`${isA5 ? 'text-[7.5px]' : isA3 ? 'text-base sm:text-lg' : 'text-[10px] sm:text-[11px]'} font-extrabold mt-0.5 tracking-wide leading-snug`}
              style={{ color: isBackground ? 'rgba(255,255,255,0.9)' : activeColors.secondary }}
            >
              {getTri('subTitle', plt.subTitle)}
              {content.location && <span className={`ml-2 pl-2 border-l ${isBackground ? 'border-white/30' : 'border-slate-300'} opacity-80 uppercase tracking-widest`}>{content.location}</span>}
            </p>
          </div>

          <div className={`flex ${isLandscape ? 'flex-row items-center' : 'flex-col items-end'} gap-1.5 shrink-0`}>
            {(plt.bannerTitle || content.badgeText) && (
              <span 
                className={`${isA5 ? 'text-[6.5px] px-1 py-0.5' : isA3 ? 'text-xs px-3 py-1.5' : 'text-[8px] sm:text-[9px] px-2.5 py-1'} font-black uppercase tracking-widest rounded shadow-md font-vietnam`}
                style={{ backgroundColor: activeColors.accent, color: activeColors.primary }}
              >
                {getTri('bannerTitle', plt.bannerTitle || content.badgeText || 'PRICES')}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              {regionLogo && regionLogo.id !== 'dns_central' && (
                <div 
                  className={`flex flex-col items-end justify-center ${isA5 ? 'px-1.5 py-0.5' : isA3 ? 'px-4 py-2' : 'px-3 py-1.5'} rounded-xl border text-right shadow-2xs`}
                  style={{ 
                    backgroundColor: isBackground ? 'rgba(255,255,255,0.2)' : `${activeColors.primary}0D`, 
                    borderColor: isBackground ? 'rgba(255,255,255,0.3)' : `${activeColors.primary}20` 
                  }}
                >
                  <span 
                    className={`${isA5 ? 'text-[8px]' : isA3 ? 'text-sm' : 'text-[11px]'} font-black uppercase font-vietnam leading-tight tracking-tight`}
                    style={{ color: isBackground ? '#FFFFFF' : activeColors.primary }}
                  >
                    {regionLogo.regionName}
                  </span>
                  {!isLandscape && !isA5 && (
                    <span 
                      className={`${isA3 ? 'text-xs' : 'text-[8px]'} font-bold font-vietnam opacity-80`}
                      style={{ color: isBackground ? 'rgba(255,255,255,0.8)' : activeColors.secondary }}
                    >
                      {regionLogo.subTitle}
                    </span>
                  )}
                </div>
              )}

              {(regionLogo.dnsLogoPlacement === 'header' || !regionLogo.dnsLogoPlacement) && (
                <DolomitiNordicSkiLogo 
                  variant={content.logoVariant || (isBackground ? 'negative' : 'original')} 
                  className={`${isA5 ? (isLandscape ? 'h-6' : 'h-7') : isA3 ? 'h-18 sm:h-22' : isLandscape ? 'h-9 sm:h-10' : 'h-11 sm:h-12'} shrink-0`} 
                  customPrimary={isBackground ? '#FFFFFF' : theme.primaryHex}
                  customSecondary={isBackground ? 'rgba(255,255,255,0.8)' : theme.secondaryHex}
                  customAccent={theme.accentHex}
                  cornerStyle={content.logoCornerStyle}
                />
              )}
            </div>
          </div>
        </div>
      )}

    <div className="relative z-20 flex-1 flex flex-col gap-2 sm:gap-2.5 min-h-0 py-1">
      {activeSectionOrder.map((sectionId) => {
        switch (sectionId) {
          case 'heroImage':
            return (
              visibility.heroImage !== false && !isBackground && (
                <div 
                  key="heroImage" 
                  className={`relative w-full ${!content.heroImageHeightPx ? (isA5 ? 'flex-1 min-h-[60px] max-h-[160px]' : isA3 ? 'flex-1 min-h-[180px] max-h-[450px]' : isLandscape ? 'flex-1 min-h-[80px] max-h-[220px]' : 'flex-1 min-h-[110px] max-h-[380px]') : 'shrink-0'} rounded-xl overflow-hidden shadow-sm border border-slate-200 transition-all duration-300`}
                  style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
                >
                  <img 
                    src={content.heroImageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'} 
                    alt={content.title || 'Dolomiti NordicSki'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div 
                    className="absolute inset-0 flex items-end p-2.5 sm:p-3.5"
                    style={{
                      background: `linear-gradient(to top, ${activeColors.primary}F2, ${activeColors.primary}80, transparent)`
                    }}
                  >
                    <div className="text-white w-full flex items-end justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        {(plt.bannerTitle || content.badgeText) && (
                          <span 
                            className={`${isA5 ? 'text-[8px] px-2 py-0.5' : isA3 ? 'text-xs px-3 py-1' : 'text-[9.5px] px-2.5 py-1'} font-black uppercase tracking-widest rounded shadow-md font-vietnam inline-block`}
                            style={{ backgroundColor: activeColors.accent, color: activeColors.primary }}
                          >
                            {plt.bannerTitle || content.badgeText}
                          </span>
                        )}
                        <h3 className={`${isA5 ? 'text-xs sm:text-sm' : isA3 ? 'text-2xl sm:text-3xl' : 'text-sm sm:text-base'} font-black font-vietnam uppercase drop-shadow-md leading-tight truncate`}>
                          {getTri('mainTitle', content.title || 'PRICES & INFORMATION')}
                        </h3>
                      </div>
                      {regionLogo && regionLogo.id !== 'dns_central' && (
                        <span className={`${isA5 ? 'text-[8.5px] px-1.5 py-0.5' : isA3 ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-1'} font-black bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30 font-vietnam shrink-0 shadow-2xs`}>
                          {regionLogo.regionName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            );

          case 'earlyBird':
            return (
              visibility.earlyBird && (plt.earlyBirdLabel || plt.earlyBirdDiscount || plt.earlyBirdSub) && (
                <div 
                  key="earlyBird"
                  className="w-full rounded-xl p-2 sm:p-2.5 border-2 shadow-sm flex items-center justify-between gap-2.5 shrink-0"
                  style={{ 
                    backgroundColor: `${activeColors.accent}1F`, 
                    borderColor: activeColors.accent,
                    color: activeColors.primary
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: activeColors.accent, color: activeColors.primary }}
                    >
                      %
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs font-black uppercase font-vietnam tracking-wider leading-tight">
                        {getTri('earlyBirdLabel', plt.earlyBirdLabel || 'PREVENDITA')}
                      </div>
                      {plt.earlyBirdSub && (
                        <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-600 truncate">
                          {getTri('earlyBirdSub', plt.earlyBirdSub)}
                        </div>
                      )}
                    </div>
                  </div>
                  {plt.earlyBirdDiscount && (
                    <div 
                      className="px-2.5 py-1 rounded-lg text-xs font-black font-vietnam uppercase tracking-wide shadow-xs shrink-0"
                      style={{ backgroundColor: activeColors.primary, color: '#FFFFFF' }}
                    >
                      {plt.earlyBirdDiscount}
                    </div>
                  )}
                </div>
              )
            );

          case 'bigTitle':
            return (
              visibility.bigTitle !== false && (
                <div key="bigTitle" className="space-y-1.5 min-w-0 w-full shrink-0">
                  {(plt.bannerTitle || content.badgeText) && (
                    <div className="inline-block mb-0.5">
                      <span 
                        className="px-3 py-1 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-md font-vietnam inline-block"
                        style={{ backgroundColor: activeColors.accent, color: activeColors.primary }}
                      >
                        {getTri('bannerTitle', plt.bannerTitle || content.badgeText || 'PRICES')}
                      </span>
                    </div>
                  )}

                  <h2 
                    className={`${isA5 ? 'text-2xl sm:text-3xl' : isA3 ? 'text-5xl sm:text-7xl' : isLandscape ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl'} font-black leading-[1.05] tracking-tight break-words uppercase`}
                    style={{ 
                      color: activeColors.primary,
                      fontFamily: "'Be Vietnam Pro', sans-serif" 
                    }}
                  >
                    {getTri('mainTitle', content.title || 'PRICES & INFORMATION')}
                  </h2>
                  
                  {(plt.subTitle || content.subtitle) && (
                    <p 
                      className={`${isA5 ? 'text-xs sm:text-sm' : isA3 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-bold leading-relaxed break-words`}
                      style={{ color: activeColors.secondary }}
                    >
                      {getTri('subTitle', plt.subTitle || content.subtitle)}
                    </p>
                  )}

                  {(plt.seasonYear || content.validityPeriod || content.location) && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold">
                      {(plt.seasonYear || content.validityPeriod) && (
                        <span 
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border shadow-2xs text-[10.5px] font-black"
                          style={{
                            backgroundColor: `${activeColors.primary}0D`,
                            color: activeColors.primary,
                            borderColor: `${activeColors.primary}20`
                          }}
                        >
                          <span>📅 {getTri('validityPeriod', plt.seasonYear || content.validityPeriod || '2026/27')}</span>
                        </span>
                      )}
                      {content.location && (
                        <span 
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border shadow-2xs text-[10.5px] font-black"
                          style={{
                            backgroundColor: `${activeColors.secondary}0D`,
                            color: activeColors.secondary,
                            borderColor: `${activeColors.secondary}20`
                          }}
                        >
                          <span>📍 {getTri('location', content.location)}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            );

          case 'promotionBox':
            return (
              visibility.promotionBox && (content.priceAmount || content.pricePrefix) && (
                <div 
                  key="promotionBox"
                  className={`p-3 sm:p-4 ${isA5 ? 'rounded-xl' : 'rounded-2xl'} shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full shrink-0`}
                  style={theme.priceBgStyle}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest font-vietnam opacity-90">
                      {content.pricePrefix || 'OFFERTA PACCHETTO'}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                      <span className={`${isLandscape ? (isA5 ? 'text-2xl' : isA3 ? 'text-4xl' : 'text-3xl') : (isA5 ? 'text-3xl' : isA3 ? 'text-6xl' : 'text-5xl')} font-black tracking-tighter font-vietnam break-all`}>
                        {content.priceAmount} {content.priceCurrency}
                      </span>
                      {content.priceSuffix && (
                        <span className="text-xs font-bold opacity-90 uppercase tracking-wide">
                          {content.priceSuffix}
                        </span>
                      )}
                    </div>
                  </div>
                  {content.priceNote && (
                    <div className="text-[9px] sm:text-[10px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/30 max-w-sm leading-relaxed min-w-0">
                      {content.priceNote}
                    </div>
                  )}
                </div>
              )
            );

          case 'priceTables':
            return (
              visibility.priceTables && (
                <div key="priceTables" className="space-y-1 shrink-0 min-w-0 w-full">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     {/* REGIONAL AREA */}
                     <div className="border rounded-xl bg-white/95 overflow-hidden flex flex-col shadow-xs" style={{ borderColor: `${activeColors.accent}80` }}>
                        <div 
                          className={`text-white ${isA5 ? 'p-1.5' : isA3 ? 'p-3' : 'p-2'} flex items-center justify-between uppercase shrink-0`} 
                          style={{ backgroundColor: activeColors.primary }}
                        >
                          <div className="min-w-0 flex flex-col">
                            <span className={`${isA5 ? 'text-[6.5px]' : isA3 ? 'text-xs' : 'text-[7.5px]'} font-bold opacity-80 tracking-widest leading-none`}>
                              {getTri('regionalHeader', plt.regionalHeader)}
                            </span>
                            <span className={`${isA5 ? 'text-[9.5px]' : isA3 ? 'text-base' : 'text-[11px]'} font-black tracking-tight leading-tight truncate`}>
                              {content.customRegionName || regionLogo?.regionName || 'REGIONAL AREA'}
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
                            { 
                              title: getTri('regionalDayTitle', plt.regionalDayTitle), 
                              sub: getTri('regionalDaySub', plt.regionalDaySub), 
                              price: plt.regionalDayPrice 
                            },
                            { 
                              title: getTri('regionalWeekTitle', plt.regionalWeekTitle), 
                              sub: getTri('regionalWeekSub', plt.regionalWeekSub), 
                              price: plt.regionalWeekPrice 
                            },
                            { 
                              title: getTri('regionalSeasonTitle', plt.regionalSeasonTitle), 
                              sub: getTri('regionalSeasonSub', plt.regionalSeasonSub), 
                              price: plt.regionalSeasonPrice 
                            }
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0 gap-1.5">
                              <div className="min-w-0 flex-1">
                                <span className={`font-black ${isA5 ? 'text-[8px]' : isA3 ? 'text-sm' : 'text-[9.5px]'} block leading-tight break-words`} style={{ color: activeColors.primary }}>{item.title}</span>
                                {item.sub && <span className={`${isA3 ? 'text-[10px]' : 'text-[7px]'} text-slate-500 block leading-tight font-medium mt-0.5 uppercase tracking-tight opacity-90 break-words`}>{item.sub}</span>}
                              </div>
                              <div className={`${isA5 ? 'text-[8px] px-1 py-0.5' : isA3 ? 'text-sm px-2.5 py-1' : 'text-[9.5px] px-1.5 py-0.5'} shrink-0 bg-slate-50 rounded border border-slate-100 flex flex-col items-end text-right leading-tight max-w-[120px]`} style={{ color: activeColors.primary }}>
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
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>

                     {/* CAROUSEL AREA */}
                     <div className="border rounded-xl bg-white/95 overflow-hidden flex flex-col shadow-xs" style={{ borderColor: `${activeColors.accent}80` }}>
                        <div className={`text-white font-black ${isA5 ? 'text-[8.5px] p-1.5' : isA3 ? 'text-sm p-3' : 'text-[10px] p-2'} text-center uppercase tracking-widest flex-1 flex items-center justify-center`} style={{ backgroundColor: activeColors.secondary }}>
                          {getTri('carouselHeader', plt.carouselHeader)}
                        </div>
                        <div className={`${isA5 ? 'p-1.5 space-y-0.5' : isA3 ? 'p-3.5 space-y-2' : 'p-2 space-y-1'}`}>
                          {[
                            { 
                              title: getTri('carouselWeekTitle', plt.carouselWeekTitle), 
                              sub: getTri('carouselWeekSub', plt.carouselWeekSub), 
                              price: plt.carouselWeekPrice 
                            },
                            { 
                              title: getTri('carouselSeasonTitle', plt.carouselSeasonTitle), 
                              sub: getTri('carouselSeasonSub', plt.carouselSeasonSub), 
                              price: plt.carouselSeasonPrice 
                            }
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0 gap-1.5">
                              <div className="min-w-0 flex-1">
                                <span className={`font-black ${isA5 ? 'text-[8px]' : isA3 ? 'text-sm' : 'text-[9.5px]'} block leading-tight break-words`} style={{ color: activeColors.primary }}>{item.title}</span>
                                {item.sub && <span className={`${isA3 ? 'text-[10px]' : 'text-[7px]'} text-slate-500 block leading-tight font-medium mt-0.5 uppercase tracking-tight opacity-90 break-words`}>{item.sub}</span>}
                              </div>
                              <div className={`${isA5 ? 'text-[8px] px-1 py-0.5' : isA3 ? 'text-sm px-2.5 py-1' : 'text-[9.5px] px-1.5 py-0.5'} shrink-0 bg-slate-50 rounded border border-slate-100 flex flex-col items-end text-right leading-tight max-w-[120px]`} style={{ color: activeColors.primary }}>
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
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                  {plt.regionalNote && (
                    <p className={`${isA3 ? 'text-xs' : 'text-[7.5px]'} text-slate-400 italic px-1 leading-relaxed text-center font-bold tracking-tight`}>
                      {plt.regionalNote}
                    </p>
                  )}
                </div>
              )
            );

          case 'servicesBox':
            return (
              visibility.servicesBox && (
                <div key="servicesBox" className={`bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl ${isA5 ? 'p-1.5 space-y-0.5 text-[7.5px]' : isA3 ? 'p-4 space-y-2 text-xs' : 'p-2 space-y-1 text-[8.5px]'} shadow-2xs shrink-0 flex flex-col justify-between w-full`}>
                  <div className={`font-black font-vietnam uppercase flex items-center justify-between ${isA3 ? 'text-xs' : 'text-[8.5px]'}`}>
                    <span style={{ color: activeColors.primary }}>
                      {getTri('infoServicesHeader', plt.infoServicesHeader || 'INFO & SERVICES')}
                    </span>
                    <span className={`${isA3 ? 'text-xs' : 'text-[7.5px]'} font-extrabold`} style={{ color: activeColors.secondary }}>
                      {content.validityPeriod || plt.seasonYear || '2026/27'}
                    </span>
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-x-2 gap-y-1 ${isA3 ? 'text-xs' : 'text-[7.5px]'} text-slate-700 font-medium`}>
                    {plt.infoKidsText && (
                      <div className="flex items-start gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: activeColors.primary }} />
                        <span className="break-words leading-tight font-semibold">
                          {getTri('infoKidsText', plt.infoKidsText)}
                        </span>
                      </div>
                    )}
                    {plt.infoSchoolsText && (
                      <div className="flex items-start gap-1 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: activeColors.primary }} />
                        <span className="break-words leading-tight font-semibold">
                          {getTri('infoSchoolsText', plt.infoSchoolsText)}
                        </span>
                      </div>
                    )}
                    {content.features && content.features.map((feat, fidx) => {
                      const featText = [it.features?.[fidx]?.text, de.features?.[fidx]?.text, en.features?.[fidx]?.text]
                        .filter(Boolean)
                        .join(' • ') || feat.text;
                      return (
                        <div key={feat.id} className="flex items-start gap-1 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: activeColors.secondary }} />
                          <span className="break-words leading-tight font-semibold">{featText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Sports Icons Row */}
                  {visibility.sportsIcons !== false && activeSportsIcons.length > 0 && (
                    <div className="pt-1 border-t border-slate-100 flex items-center gap-1 overflow-hidden">
                      <div className="flex items-center gap-1 flex-wrap">
                        {activeSportsIcons.slice(0, isA5 ? 3 : 5).map((icon) => {
                          if (!icon) return null;
                          return (
                            <div 
                              key={icon.id}
                              className={`flex items-center gap-1 bg-slate-50 border border-slate-200 rounded ${isA3 ? 'px-2 py-0.5 text-xs' : 'px-1 py-0.5 text-[7px]'} font-bold`}
                              style={{ color: activeColors.primary }}
                            >
                              <WireframeIcon icon={icon} className={`${isA3 ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} shrink-0`} style={{ color: activeColors.primary }} />
                              <span className="truncate max-w-[80px]">{getSportsIconName(icon, content.language || 'it')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            );

          case 'sportsIcons':
            return (
              visibility.sportsIcons !== false && !visibility.servicesBox && activeSportsIcons.length > 0 && (
                <div key="sportsIcons" className={`bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl ${isA5 ? 'p-1.5' : isA3 ? 'p-3' : 'p-2'} shadow-2xs shrink-0 w-full`}>
                  <div className="flex items-center gap-1 flex-wrap">
                    {activeSportsIcons.map((icon) => {
                      if (!icon) return null;
                      return (
                        <div 
                          key={icon.id}
                          className={`flex items-center gap-1 bg-slate-50 border border-slate-200 rounded ${isA3 ? 'px-2 py-0.5 text-xs' : 'px-1 py-0.5 text-[7px]'} font-bold`}
                          style={{ color: activeColors.primary }}
                        >
                          <WireframeIcon icon={icon} className={`${isA3 ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} shrink-0`} style={{ color: activeColors.primary }} />
                          <span className="truncate max-w-[80px]">{getSportsIconName(icon, content.language || 'it')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            );

          case 'ecoBanner':
            return (
              visibility.ecoBanner && (
                <div 
                  key="ecoBanner"
                  className={`${isA3 ? 'p-4' : 'p-2'} text-white rounded-xl flex items-center justify-between gap-2 shadow-2xs shrink-0 backdrop-blur-xs w-full`}
                  style={{
                    background: content.customBanner?.color 
                      ? content.customBanner.color 
                      : (isBackground 
                          ? `linear-gradient(to right, ${activeColors.primary}E6, ${activeColors.secondary}E6)`
                          : `linear-gradient(to right, ${activeColors.primary}, ${activeColors.secondary})`),
                    boxShadow: `0 4px 12px -2px ${activeColors.primary}40`
                  }}
                >
                  <div className="min-w-0 flex-1">
                    {(plt.ecoTagline || content.customBanner?.title) && (
                      <div className={`${isA3 ? 'text-xs' : 'text-[6.5px]'} font-black opacity-90 mb-0.5 tracking-wider uppercase font-vietnam`}>
                        {getTri('ecoTagline', plt.ecoTagline || 'INFO & GREEN MOBILITY')}
                      </div>
                    )}
                    <p className={`${isA3 ? 'text-sm sm:text-base' : 'text-[8.5px]'} font-black text-white leading-tight uppercase font-vietnam truncate`}>
                      {content.customBanner?.title || getTri('ecoTitle', plt.ecoTitle)}
                    </p>
                    {(content.customBanner?.text || plt.ecoSub) && (
                      <p className={`${isA3 ? 'text-xs' : 'text-[7px]'} text-slate-100 font-medium leading-tight mt-0.5 truncate`}>
                        {content.customBanner?.text || getTri('ecoSub', plt.ecoSub)}
                      </p>
                    )}
                  </div>
                  {visibility.qrCode && content.qrCode.enabled && visibility.footer === false && (
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="bg-white p-1 rounded shadow-2xs shrink-0">
                        <QRCodeSVG value={content.qrCode.url || 'https://www.dolomitinordicski.com'} size={isA3 ? 52 : isA5 ? 26 : 32} fgColor={activeColors.primary} />
                      </div>
                    </div>
                  )}
                </div>
              )
            );

          case 'disclaimer':
            {
              const legalItems = getLegalNoticeItems(plt, content);
              return (
                visibility.disclaimer && legalItems.length > 0 && (
                  <div key="disclaimer" className={`${isA3 ? 'text-xs leading-relaxed p-2.5 space-y-1' : 'text-[7px] sm:text-[7.5px] leading-tight p-1.5 space-y-0.5'} ${isBackground ? 'bg-black/40 text-slate-200 border-white/10' : 'bg-white/60 text-slate-600 border-slate-200/50'} backdrop-blur-xs rounded-lg border shrink-0 w-full font-medium`}>
                    {legalItems.map((item) => (
                      <div key={item.lang} className="flex items-start gap-1 min-w-0">
                        <span className="font-black text-[6.5px] sm:text-[7px] uppercase tracking-wider text-slate-800 shrink-0 bg-slate-200/80 px-1 py-0.2 rounded font-vietnam select-none">
                          {item.lang}:
                        </span>
                        <span className="break-words flex-1 min-w-0">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )
              );
            }

          default:
            return null;
        }
      })}
    </div>

    {/* Footer */}
    {visibility.footer && (
      <BrandFooterBlock 
        content={content}
        theme={theme}
        plt={plt}
        regionLogo={regionLogo}
        visibility={visibility}
        isA3={isA3}
        isA5={isA5}
        isBackground={isBackground}
        activeColors={activeColors}
        isTrilingual={true}
      />
    )}

  </div>
  );
};

export const OfficialPriceTableVariant = OfficialPriceTableVariant1;

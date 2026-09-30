import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as LucideIcons from 'lucide-react';
import { FlyerVariantProps, getCornerClass } from './VariantTypes';
import { 
  DolomitiFullLogo, 
  DolomitiSwooshVector,
  OFFICIAL_ASSET_PATHS 
} from '../CorporateVectors';
import { SPORTS_ICONS, getSportsIconName } from '../../data/sportsIcons';
import { WireframeIcon } from '../WireframeIcon';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';
import { isSvgUrl } from '../../utils/logoUtils';

export const ClassicVariant1: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons,
  visibility
}) => {
  const renderIcon = (name: string, className?: string, style?: any) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Activity;
    return <IconComponent className={className} style={style} />;
  };

  // Detect format & calculate adaptive layout scale
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = content.orientation === 'landscape';

  // Calculate density to adjust spacing
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const isAiry = visibleCount < 6;

  const mainGap = isA5 
    ? (isLandscape ? 'gap-1' : (isAiry ? 'gap-2' : 'gap-1.5')) 
    : isA3 
    ? (isAiry ? 'gap-12' : 'gap-6') 
    : (isAiry ? 'gap-8 sm:gap-10' : 'gap-4 sm:gap-5');

  const mainPadding = isA5 
    ? (isLandscape ? 'px-2 py-1.5' : 'px-3 py-2') 
    : isA3 
    ? 'px-12 py-8' 
    : (isAiry ? 'px-8 py-8' : 'px-6 py-4');

  const titleSize = isA5 
    ? (isLandscape ? 'text-lg' : 'text-xl') 
    : isA3 
    ? 'text-5xl sm:text-7xl' 
    : 'text-3xl sm:text-5xl';

  const subtitleSize = isA5 
    ? 'text-[10px]' 
    : isA3 
    ? 'text-xl sm:text-2xl' 
    : 'text-base sm:text-xl';

  const priceAmountSize = isA5 
    ? 'text-2xl' 
    : isA3 
    ? 'text-5xl sm:text-7xl' 
    : 'text-4xl sm:text-6xl';

  const qrCodeSize = isA5 ? 45 : isA3 ? 120 : 85;

  return (
    <div className={`relative z-10 h-full flex flex-col justify-between overflow-hidden ${
      content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
      content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
    }`}>
      
      {/* 1. BRAND HEADER */}
      {visibility.header && (
        <header 
          className={`${isA5 ? 'px-3 py-2' : 'px-4 sm:px-8 py-3.5 sm:py-5'} shadow-md relative overflow-hidden z-10 shrink-0 ${theme.headerTextColor}`}
          style={theme.headerBgStyle}
        >
          <div className={`flex flex-col ${isA5 ? 'gap-1.5' : 'gap-2 sm:gap-3'} relative z-10 w-full min-w-0`}>
            
            {/* Primary Row: Central Brand Logo & Regional Partner Badge */}
            <div className="flex items-center justify-between gap-3 w-full min-w-0">
              
              {/* Left: Dolomiti NordicSki Central Brand Logo (shown if dnsLogoPlacement is header or default) */}
              <div className="flex items-center gap-3 min-w-0 max-w-[65%] shrink">
                {(regionLogo.dnsLogoPlacement === 'header' || !regionLogo.dnsLogoPlacement) && (
                  <DolomitiFullLogo 
                    variant={content.logoVariant} 
                    isDarkHeader={!theme.isHeaderLight}
                    className={`${isA5 ? (isLandscape ? 'h-6' : 'h-7') : isA3 ? 'h-14 sm:h-18' : 'h-10 sm:h-12'} max-w-full object-contain shrink min-w-0`} 
                    customPrimary={theme.primaryHex}
                    customAccent={theme.accentHex}
                    cornerStyle={content.logoCornerStyle}
                  />
                )}
              </div>

              {/* Right: Selected Regional Partner Badge - ONLY shown when a specific region is selected */}
              {content.regionId && content.regionId !== 'dns_central' && (
                <div 
                  className={`flex items-center gap-2 px-2.5 py-1.5 min-w-0 max-w-[55%] shrink justify-end ${
                    (content.logoCornerStyle || 'rounded') === 'none'
                      ? ''
                      : (content.logoCornerStyle === 'sharp' ? 'rounded-none border backdrop-blur-md shadow-sm' : 'rounded-xl border backdrop-blur-md shadow-sm')
                  }`}
                  style={{
                    ...((content.logoCornerStyle || 'rounded') !== 'none' ? theme.headerBadgeBgStyle : {}),
                    transform: `scale(${(regionLogo.regionalLogoScale || 100) / 100})`,
                    transformOrigin: 'right center'
                  }}
                >
                  <img 
                    src={
                      theme.isHeaderLight
                        ? (regionLogo.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe)
                        : (regionLogo.logoWhiteSrc || regionLogo.logoSrc || OFFICIAL_ASSET_PATHS.logoWhiteSvg)
                    } 
                    alt={regionLogo.name} 
                    className={`${isA5 ? 'h-6 sm:h-7' : isA3 ? 'h-10 sm:h-12' : 'h-7 sm:h-9'} w-auto object-contain shrink-0`} 
                  />
                  {regionLogo.secondaryLogoSrc && (
                    <img 
                      src={
                        theme.isHeaderLight
                          ? regionLogo.secondaryLogoSrc
                          : (regionLogo.secondaryLogoWhiteSrc || regionLogo.secondaryLogoSrc)
                      } 
                      alt={`${regionLogo.name} Secondary`} 
                      className={`${isA5 ? 'h-6 sm:h-7' : isA3 ? 'h-10 sm:h-12' : 'h-7 sm:h-9'} w-auto object-contain shrink-0`} 
                    />
                  )}
                  <div className="text-right min-w-0 flex-1">
                    <div className={`text-[9px] sm:text-[11px] font-black uppercase leading-tight font-vietnam break-words whitespace-normal ${theme.isBadgeLight ? 'text-slate-900' : theme.headerTextColor}`}>
                      {content.customRegionName || regionLogo.name}
                    </div>
                    <div className={`text-[8px] sm:text-[9.5px] font-bold tracking-wide uppercase ${theme.isBadgeLight ? 'text-[#0D4D5E] font-extrabold' : theme.headerAccentColor}`}>REGIONAL PARTNER</div>
                  </div>
                </div>
              )}

            </div>

            {/* Sub-row: Header Tagline / Region Subtitle & Badge */}
            {(content.headerTagline || regionLogo.subTitle || content.badgeText) && (
              <div 
                className={`flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 pt-1.5 border-t min-w-0 w-full text-[9px] sm:text-[11px] font-bold ${theme.headerSubtextColor}`}
                style={theme.headerBorderColorStyle}
              >
                <span className="break-words whitespace-normal leading-snug min-w-[180px] flex-1 uppercase tracking-wider">
                  {content.headerTagline || regionLogo.subTitle || content.customRegionName || regionLogo.regionName}
                </span>
                {content.badgeText && (
                  <span 
                    className="shrink-0 px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase tracking-widest ml-1 shadow-sm"
                    style={theme.headerBadgeBgStyle}
                  >
                    {content.badgeText}
                  </span>
                )}
              </div>
            )}

          </div>

          {/* Decorative Ski Swoosh Accent in header */}
          <div className="absolute -bottom-2 left-0 right-0 opacity-40 pointer-events-none">
            <DolomitiSwooshVector color1={theme.accentHex || '#AAD0D1'} color2={theme.isHeaderLight ? theme.primaryHex : "#FFFFFF"} />
          </div>
        </header>
      )}

      {/* 2. HERO IMAGE (when heroImagePosition === 'top') */}
      {visibility.heroImage && content.heroImagePosition === 'top' && content.heroImageUrl && (
        <div 
          className={`relative w-full ${!content.heroImageHeightPx ? (isA5 ? (isLandscape ? 'flex-1 min-h-[50px] max-h-[100px]' : 'flex-1 min-h-[70px] max-h-[140px]') : isA3 ? 'flex-1 min-h-[220px] max-h-[500px]' : isLandscape ? 'flex-1 min-h-[120px] max-h-[260px]' : 'flex-1 min-h-[140px] max-h-[360px]') : 'shrink-0'} overflow-hidden bg-slate-900 shadow-inner transition-all duration-300`}
          style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
        >
          <img
            src={content.heroImageUrl}
            alt={content.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div 
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: content.heroOverlayOpacity / 100 }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent z-10" />
        </div>
      )}

      {/* 3. MAIN OFFER CONTENT */}
      <main className={`flex-1 ${mainPadding} flex flex-col justify-between ${mainGap} min-w-0 min-h-0`}>
        
        {/* PRIMARY OFFER BLOCK (Titles, Badges, Price Banner) */}
        <div className={`flex flex-col justify-between ${mainGap} w-full min-w-0 min-h-0`}>
          {/* Titles & Badge */}
          {visibility.bigTitle !== false && (
            <div className="space-y-1.5 min-w-0">
              {content.badgeText && (
                <div className="inline-block mb-0.5">
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-md font-vietnam"
                    style={theme.badgeStyle}
                  >
                    {content.badgeText}
                  </span>
                </div>
              )}

              <h2 
                className={`${isLandscape ? (isA5 ? 'text-lg' : isA3 ? 'text-4xl' : 'text-2xl sm:text-3xl') : titleSize} font-black leading-[1.1] tracking-tight break-words`}
                style={{ 
                  color: content.heroImagePosition === 'background' ? '#FFFFFF' : theme.textColorHex,
                  fontFamily: content.headingFont === 'Be Vietnam Pro' ? "'Be Vietnam Pro', sans-serif" : "'Roboto', sans-serif" 
                }}
              >
                {content.title}
              </h2>
              
              <p 
                className={`mt-0.5 ${isLandscape ? (isA5 ? 'text-xs' : isA3 ? 'text-base' : 'text-sm') : subtitleSize} font-semibold leading-relaxed max-w-2xl break-words`}
                style={{ color: content.heroImagePosition === 'background' ? '#E2E8F0' : `${theme.textColorHex}CC` }}
              >
                {content.subtitle}
              </p>

              {/* Validity & Location */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold">
                {content.validityPeriod && (
                  <span 
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border shadow-sm transition-all text-[10.5px]"
                    style={{
                      backgroundColor: `${theme.primaryHex}0D`,
                      color: theme.textColorHex,
                      borderColor: `${theme.primaryHex}20`
                    }}
                  >
                    {renderIcon('Calendar', 'w-3 h-3', { color: theme.primaryHex })}
                    <span>{content.validityPeriod}</span>
                  </span>
                )}
                {content.location && (
                  <span 
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border shadow-sm transition-all text-[10.5px]"
                    style={{
                      backgroundColor: `${theme.secondaryHex}0D`,
                      color: theme.textColorHex,
                      borderColor: `${theme.secondaryHex}20`
                    }}
                  >
                    {renderIcon('MapPin', 'w-3 h-3', { color: theme.secondaryHex })}
                    <span>{content.location}</span>
                  </span>
                )}
              </div>

              {/* Standalone Highlighted Vorverkauf Banner */}
              {visibility.earlyBird !== false && plt && (plt.earlyBirdLabel || plt.earlyBirdDiscount || plt.earlyBirdSub) && (
                <div 
                  className="w-full rounded-xl p-2 sm:p-2.5 border-2 shadow-sm flex items-center justify-between gap-2.5 my-1.5 min-w-0"
                  style={{ 
                    backgroundColor: `${theme.accentHex}20`, 
                    borderColor: theme.accentHex,
                    color: theme.primaryHex
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.accentHex, color: theme.primaryHex }}
                    >
                      %
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs font-black uppercase font-vietnam tracking-wider leading-tight">
                        {plt.earlyBirdLabel || 'PREVENDITA / VORVERKAUF'}
                      </div>
                      {plt.earlyBirdSub && (
                        <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-600 truncate">
                          {plt.earlyBirdSub}
                        </div>
                      )}
                    </div>
                  </div>
                  {plt.earlyBirdDiscount && (
                    <div 
                      className="px-2.5 py-1 rounded-lg text-xs font-black font-vietnam uppercase tracking-wide shadow-xs shrink-0"
                      style={{ backgroundColor: theme.primaryHex, color: '#FFFFFF' }}
                    >
                      {plt.earlyBirdDiscount}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Banner */}
          {visibility.promotionBox && (
            <div 
              className={`p-3 sm:p-4 ${isA5 ? 'rounded-xl' : 'rounded-2xl'} shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0`}
              style={theme.priceBgStyle}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest font-vietnam opacity-90">
                  {content.pricePrefix || 'OFFERTA PACCHETTO'}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                  <span className={`${isLandscape ? (isA5 ? 'text-2xl' : isA3 ? 'text-4xl' : 'text-3xl') : priceAmountSize} font-black tracking-tighter font-vietnam break-all`}>
                    {content.priceAmount} {content.priceCurrency}
                  </span>
                  <span className="text-xs font-bold opacity-90 uppercase tracking-wide">
                    {content.priceSuffix}
                  </span>
                </div>
              </div>
              {content.priceNote && (
                <div className="text-[9px] sm:text-[10px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/30 max-w-sm leading-relaxed min-w-0">
                  {content.priceNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM DETAILS BLOCK (Grid 2 cols in Landscape, Stacked in Portrait) */}
        <div className={`grid ${isLandscape ? 'grid-cols-2 gap-3 sm:gap-4' : 'grid-cols-1 ' + mainGap} w-full min-w-0 min-h-0`}>
          {/* Inclusions */}
          {visibility.servicesBox && (
            <div className="space-y-1.5 min-w-0 flex flex-col justify-between">
              <h3 
                className="text-[9px] sm:text-[11px] uppercase font-black tracking-widest mb-0.5 font-vietnam"
                style={{ color: content.heroImagePosition === 'background' ? '#CBD5E1' : theme.primaryHex }}
              >
                {content.featuresTitle}
              </h3>
              <div className={`grid grid-cols-1 ${isA5 || isLandscape ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-1.5`}>
                {content.features.map((feat) => {
                  const iconData = SPORTS_ICONS.find(s => s.id === feat.icon);
                  const iconName = iconData ? iconData.lucideIconName : 'CheckCircle';
                  return (
                    <div 
                      key={feat.id} 
                      className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs min-w-0"
                      style={
                        feat.highlight
                          ? theme.featureHighlightStyle
                          : {
                              backgroundColor: content.heroImagePosition === 'background' ? 'rgba(15, 23, 42, 0.65)' : theme.cardBgHex,
                              color: content.heroImagePosition === 'background' ? '#F8FAFC' : theme.textColorHex,
                              borderColor: `${theme.primaryHex}15`
                            }
                      }
                    >
                      <div className="mt-0.5 shrink-0">
                        {renderIcon(iconName, 'w-3.5 h-3.5', { color: theme.primaryHex })}
                      </div>
                      <span className="leading-snug break-words min-w-0 flex-1">{feat.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Column in Landscape / Bottom in Portrait: Sports Icons & QR/CTA */}
          <div className="space-y-2 min-w-0 flex flex-col justify-between">
            {/* Sports Icons */}
            {visibility.servicesBox && activeSportsIcons.length > 0 && (
              <div 
                className="flex items-center justify-around rounded-2xl p-2 border shadow-sm"
                style={{
                  backgroundColor: `${theme.primaryHex}05`,
                  borderColor: `${theme.primaryHex}10`
                }}
              >
                {activeSportsIcons.map((icon) => (
                  <div key={icon!.id} className="flex flex-col items-center gap-0.5 text-center group min-w-0">
                    <div 
                      className={`${isA5 ? 'w-6 h-6' : 'w-7 h-7 sm:w-8 sm:h-8'} rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}
                      style={theme.iconCircleStyle}
                    >
                      <WireframeIcon icon={icon} className={isA5 ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                    </div>
                    <span 
                      className="text-[8px] sm:text-[9px] font-black font-vietnam uppercase tracking-tighter line-clamp-1"
                      style={{ color: theme.textColorHex }}
                    >
                      {getSportsIconName(icon!, content.language || 'it')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Standalone QR Code badge (Only rendered when Footer is disabled and QR Code is enabled) */}
            {visibility.qrCode && visibility.footer === false && content.qrCode.enabled && (
              <div className="flex justify-end mt-auto pt-2">
                <div className="flex flex-col items-center bg-white p-2 rounded-2xl shadow-md border border-slate-200 shrink-0">
                  <QRCodeSVG 
                    value={content.qrCode.url || 'https://www.dolomitinordicski.com'} 
                    size={isLandscape ? (isA5 ? 50 : isA3 ? 90 : 65) : qrCodeSize} 
                    fgColor={content.qrCode.fgColor || theme.primaryHex}
                    bgColor={content.qrCode.bgColor || '#FFFFFF'}
                    level="H"
                  />
                  {content.qrCode.label && (
                    <span 
                      className="text-[7.5px] sm:text-[8.5px] font-black uppercase font-vietnam mt-0.5 text-center max-w-[80px] leading-tight tracking-tighter truncate"
                      style={{ color: theme.primaryHex }}
                    >
                      {content.qrCode.label}
                    </span>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      </main>

      {/* Footer */}
      {visibility.footer && (
        <BrandFooterBlock 
          content={content}
          theme={theme}
          plt={plt}
          regionLogo={regionLogo}
          visibility={visibility}
          isA3={content.format === 'A3'}
          isA5={content.format === 'A5'}
          isBackground={content.heroImagePosition === 'background'}
          activeColors={{
            primary: theme.primaryHex,
            secondary: theme.secondaryHex,
            accent: theme.accentHex,
            background: theme.bgHex,
            cardBg: '#FFFFFF',
            textColor: theme.textColorHex
          }}
        />
      )}
    </div>
  );
};

export const ClassicVariant = ClassicVariant1;

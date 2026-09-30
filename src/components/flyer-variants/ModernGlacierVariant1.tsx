import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import * as LucideIcons from 'lucide-react';
import { FlyerVariantProps } from './VariantTypes';
import { 
  DolomitiFullLogo, 
  DolomitiSwooshVector,
  OFFICIAL_ASSET_PATHS 
} from '../CorporateVectors';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';

export const ModernGlacierVariant1: React.FC<FlyerVariantProps> = ({
  content,
  theme,
  regionLogo,
  visibility
}) => {
  const renderIcon = (name: string, className?: string, style?: any) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Activity;
    return <IconComponent className={className} style={style} />;
  };

  // Format awareness
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
    ? (isAiry ? 'gap-8 sm:gap-10' : 'gap-4 sm:gap-5') 
    : (isAiry ? 'gap-6' : 'gap-3 sm:gap-4');

  const mainPadding = isA5 
    ? (isLandscape ? 'p-1.5' : 'p-2.5') 
    : isA3 
    ? 'p-8 sm:p-12' 
    : (isAiry ? 'p-6 sm:p-8' : 'p-4 sm:p-5');

  const titleSize = isA5 
    ? (isLandscape ? 'text-base' : 'text-lg') 
    : isA3 
    ? 'text-5xl sm:text-7xl' 
    : isLandscape ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl';

  const priceSize = isA5 
    ? 'text-2xl' 
    : isA3 
    ? 'text-5xl sm:text-7xl' 
    : isLandscape ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl';

  const qrCodeSize = isA5 ? 42 : isA3 ? 100 : isLandscape ? 65 : 80;

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 overflow-hidden ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.bgHex }}
    >
      
      {/* Top Ice-Cyan Voucher Block Header */}
      {visibility.header && (
        <div 
          className={`${isA5 ? 'p-2.5' : 'p-5 sm:p-8'} text-white relative overflow-hidden shadow-lg shrink-0`}
          style={{ background: `linear-gradient(to right, ${theme.primaryHex}, ${theme.secondaryHex})` }}
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-6 relative z-10 min-w-0">
            
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Official Dolomiti NordicSki Logo */}
              <DolomitiFullLogo 
                variant={content.logoVariant && content.logoVariant !== 'none' ? content.logoVariant : 'negative'} 
                className={`${isA5 ? 'h-7' : isA3 ? 'h-16 sm:h-20' : 'h-11 sm:h-14'} shrink-0 max-w-[40%] object-contain`} 
                customPrimary={theme.primaryHex}
                customAccent={theme.accentHex}
                cornerStyle={content.logoCornerStyle}
              />
              {visibility.bigTitle !== false && (
                <div className="space-y-1 min-w-0 flex-1">
                  <div 
                    className="inline-block text-white text-[9px] sm:text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full font-vietnam tracking-widest mb-0.5 shadow-md truncate max-w-full"
                    style={{ backgroundColor: theme.primaryHex }}
                  >
                    {content.badgeText || 'GUTSCHEIN / BUONO REGALO'}
                  </div>
                  <h2 className={`${titleSize} font-black font-vietnam leading-none text-white tracking-tight break-words`}>
                    {content.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold mt-1 break-words" style={{ color: theme.accentHex }}>
                    {content.subtitle}
                  </p>
                </div>
              )}
            </div>

            {visibility.promotionBox && (
              <div className="sm:text-right space-y-0.5 shrink-0 min-w-0">
                <div className="text-slate-200 text-[9.5px] sm:text-[11px] font-black uppercase tracking-widest opacity-80">
                  {content.pricePrefix || 'PREZZO'}
                </div>
                <div className={`${priceSize} font-black font-vietnam leading-none tracking-tighter break-all`} style={{ color: theme.accentHex }}>
                  {content.priceAmount} {content.priceCurrency}
                </div>
                <div className="text-xs sm:text-sm text-white/90 font-bold mt-0.5 uppercase tracking-wide">
                  {content.priceSuffix}
                </div>
                {content.priceNote && (
                  <div className="text-[9.5px] sm:text-[11px] text-slate-300 mt-1 italic font-bold max-w-[160px] sm:ml-auto leading-tight break-words">
                    {content.priceNote}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Twin Ski Track Swoosh */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <DolomitiSwooshVector color1={theme.accentHex} color2="#FFFFFF" className="w-full h-6 opacity-80" />
          </div>
        </div>
      )}

      {/* Full Width Hero Photo Banner (Acts as height buffer) */}
      {visibility.heroImage && content.heroImageUrl && (
        <div className={`mx-4 sm:mx-8 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl shrink-0 min-w-0 transition-all duration-300 ${!content.heroImageHeightPx ? (isA5 ? 'flex-1 min-h-[90px] max-h-[160px]' : isA3 ? 'flex-1 min-h-[200px] max-h-[420px]' : isLandscape ? 'flex-1 min-h-[100px] max-h-[220px]' : 'flex-1 min-h-[130px] max-h-[320px]') : ''}`} style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}>
          <img 
            src={content.heroImageUrl} 
            alt={content.title} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white gap-3 min-w-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="text-[9px] sm:text-[10px] uppercase font-black font-vietnam tracking-widest truncate" style={{ color: theme.accentHex }}>
                Dolomiti NordicSki Cross-Country Skiing
              </div>
              <div className="text-xs sm:text-base font-black tracking-tight truncate">{content.location || 'Dolomiti UNESCO World Heritage'}</div>
            </div>

            {visibility.qrCode && content.qrCode.enabled && visibility.footer === false && (
              <div className="bg-white p-1.5 rounded-2xl shadow-2xl shrink-0 border border-white/20 transform hover:scale-105 transition-transform">
                <QRCodeSVG value={content.qrCode.url || 'https://www.dolomitinordicski.com'} size={qrCodeSize} fgColor={theme.primaryHex} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Middle Section: Validity & Inclusions */}
      <div className={`${mainPadding} flex-col justify-between ${mainGap} min-w-0 shrink-0`}>
        {/* Validity & Partner Pill (Uses Official DNS Logo Asset) */}
        <div 
          className={`flex flex-wrap items-center justify-between text-xs sm:text-sm p-2.5 sm:p-3 shadow-md gap-2 min-w-0 ${
            (content.logoCornerStyle || 'rounded') === 'none'
              ? ''
              : (content.logoCornerStyle === 'sharp' ? 'rounded-none border' : 'rounded-2xl border')
          }`}
          style={{ 
            backgroundColor: theme.cardBgHex, 
            borderColor: (content.logoCornerStyle || 'rounded') === 'none' ? 'transparent' : `${theme.accentHex}80` 
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={regionLogo.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe} alt={regionLogo.name} className={`${isA5 ? 'h-5' : 'h-7 sm:h-8'} w-auto object-contain shrink-0`} />
            {regionLogo.secondaryLogoSrc && (
              <img src={regionLogo.secondaryLogoSrc} alt={`${regionLogo.name} Secondary`} className={`${isA5 ? 'h-5' : 'h-7 sm:h-8'} w-auto object-contain shrink-0`} />
            )}
            <span className="font-black font-vietnam text-xs sm:text-sm tracking-tight truncate" style={{ color: theme.primaryHex }}>
              {content.customRegionName || regionLogo.name}
            </span>
          </div>
          {content.validityPeriod && (
            <div className="flex items-center gap-1.5 font-black text-slate-700 min-w-0" style={{ color: theme.primaryHex }}>
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                {renderIcon('Calendar', 'w-2.5 h-2.5 text-red-500')}
              </div>
              <span className="uppercase tracking-tight truncate text-[10.5px]">Validità: {content.validityPeriod}</span>
            </div>
          )}
        </div>

        {/* Features List */}
        {visibility.servicesBox && (
          <div className="space-y-1.5 min-w-0 flex-1">
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest font-vietnam" style={{ color: theme.primaryHex }}>
              {content.featuresTitle}
            </h3>
            <div className={`grid grid-cols-1 ${isA5 ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-1.5`}>
              {content.features.map((feat) => (
                <div 
                  key={feat.id} 
                  className="flex items-center gap-2 p-2 rounded-xl border text-xs font-bold shadow-sm transition-all hover:translate-x-1 min-w-0"
                  style={{ backgroundColor: theme.cardBgHex, borderColor: `${theme.primaryHex}15`, color: theme.textColorHex }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: theme.primaryHex }} />
                  <span className="leading-tight break-words min-w-0 flex-1">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Contact & Partner Footer */}
      {visibility.footer && (
        <BrandFooterBlock 
          content={content}
          theme={theme}
          regionLogo={regionLogo}
          visibility={visibility}
          isA3={content.format === 'A3'}
          isA5={content.format === 'A5'}
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

export const ModernGlacierVariant = ModernGlacierVariant1;

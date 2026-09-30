import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FlyerVariantProps } from './VariantTypes';
import { 
  DolomitiNordicSkiLogo, 
  DolomitiSwooshVector 
} from '../CorporateVectors';
import { BrandFooterBlock } from '../blocks/BrandFooterBlock';

export const NordicModernVariant1: React.FC<FlyerVariantProps> = ({
  content,
  theme,
  regionLogo,
  visibility
}) => {
  // Detect format
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = content.orientation === 'landscape';

  // Calculate density to adjust spacing
  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const isAiry = visibleCount < 5;

  const mainGap = isA5 
    ? (isLandscape ? 'gap-1' : (isAiry ? 'gap-2' : 'gap-1.5')) 
    : isA3 
    ? (isAiry ? 'gap-10 sm:gap-12' : 'gap-6') 
    : (isAiry ? 'gap-6 sm:gap-8' : 'gap-3 sm:gap-4');

  const mainPadding = isA5 
    ? (isLandscape ? 'py-1' : 'py-1.5') 
    : isA3 
    ? 'py-8 sm:py-12' 
    : (isAiry ? 'py-6 sm:py-8' : 'py-3 sm:py-4');

  const containerPadding = isA5 ? (isLandscape ? 'p-2' : 'p-3') : isA3 ? 'p-10 sm:p-14' : 'p-5 sm:p-8';
  const titleSize = isA5 
    ? (isLandscape ? 'text-xl' : 'text-2xl') 
    : isA3 
    ? 'text-6xl sm:text-7xl' 
    : isLandscape ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-6xl';

  const priceSize = isA5 
    ? 'text-2xl' 
    : isA3 
    ? 'text-5xl sm:text-7xl' 
    : isLandscape ? 'text-3xl sm:text-5xl' : 'text-4xl sm:text-6xl';

  const qrCodeSize = isA5 ? 42 : isA3 ? 100 : isLandscape ? 65 : 80;

  return (
    <div className={`relative z-10 h-full flex flex-col justify-between bg-slate-950 text-white ${containerPadding} overflow-hidden min-w-0 ${
      content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
      content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
    }`}>
      
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] -z-10 rounded-full" />

      {/* Top Brand & Partner Header */}
      {visibility.header && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 sm:pb-4 relative z-10 shrink-0 gap-3 min-w-0">
          <DolomitiNordicSkiLogo 
            variant={content.logoVariant || 'negative'} 
            className={`${isA5 ? (isLandscape ? 'h-6' : 'h-7') : isA3 ? 'h-16 sm:h-20' : isLandscape ? 'h-9 sm:h-12' : 'h-11 sm:h-14'} shrink-0 max-w-[55%] object-contain`} 
            customPrimary="#FFFFFF"
            customSecondary={theme.accentHex}
            customAccent="#FFFFFF"
            cornerStyle={content.logoCornerStyle}
          />

          <div className="text-right space-y-0.5 min-w-0 flex-1">
            <span className="text-[10px] sm:text-[12px] font-black text-cyan-400 font-vietnam uppercase tracking-widest block leading-tight break-words whitespace-normal">
              {content.customRegionName || regionLogo.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60 block break-words">REGIONAL PARTNER</span>
          </div>
        </div>
      )}

      {/* Hero Image Buffer */}
      {visibility.heroImage && content.heroImageUrl && (
        <div 
          className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl shrink-0 transition-all duration-300 ${!content.heroImageHeightPx ? (isA5 ? (isLandscape ? 'flex-1 min-h-[50px] max-h-[100px]' : 'flex-1 min-h-[70px] max-h-[140px]') : isA3 ? 'flex-1 min-h-[180px] max-h-[420px]' : isLandscape ? 'flex-1 min-h-[90px] max-h-[220px]' : 'flex-1 min-h-[110px] max-h-[320px]') : ''}`}
          style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
        >
          <img src={content.heroImageUrl} alt={content.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Center Content Card */}
      <div className={`flex-1 flex ${isLandscape ? 'flex-row gap-4 sm:gap-6' : 'flex-col justify-between ' + mainGap} ${mainPadding} relative z-10 min-w-0 min-h-0`}>
        
        {/* Left / Primary Block */}
        <div className={`flex-1 flex flex-col justify-between ${mainGap} min-w-0 min-h-0`}>
          {visibility.bigTitle !== false && (
            <div className="space-y-2 min-w-0">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-[9px] sm:text-[11px] uppercase px-2.5 py-0.5 rounded-lg font-vietnam tracking-widest shadow-lg">
                {content.badgeText || 'DOLOMITI NORDICSKI EXCLUSIVE'}
              </div>

              <h2 className={`${titleSize} font-black font-vietnam tracking-tighter leading-[0.95] text-white break-words`}>
                {content.title}
              </h2>

              <div className="text-sm sm:text-base text-slate-300 font-bold flex flex-wrap items-center justify-between gap-2 min-w-0">
                <span className="leading-relaxed break-words min-w-0 flex-1">{content.subtitle}</span>
                {content.location && (
                  <span className="text-[9.5px] sm:text-[11px] uppercase tracking-widest text-cyan-400 font-black border border-cyan-400/30 px-2.5 py-0.5 rounded-xl whitespace-nowrap shadow-sm shrink-0">
                    {content.location}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price Banner */}
          {visibility.promotionBox && (
            <div className="p-3.5 sm:p-6 rounded-[1.2rem] sm:rounded-[1.5rem] bg-gradient-to-br from-[#00A3E0]/25 to-[#003865]/50 border border-[#00A3E0]/40 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl transition-all min-w-0">
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="text-[9px] sm:text-[11px] font-black uppercase text-cyan-300 tracking-widest">
                  {content.pricePrefix || 'PREZZO SPECIALE'}
                </div>
                <div className={`${priceSize} font-black font-vietnam text-white tracking-tighter break-all`}>
                  {content.priceAmount} {content.priceCurrency}
                </div>
                {content.priceNote && (
                  <div className="text-[9.5px] sm:text-[11px] text-slate-300 mt-0.5 italic font-bold leading-relaxed max-w-md break-words">
                    {content.priceNote}
                  </div>
                )}
              </div>
              <div className="text-left sm:text-right text-xs sm:text-sm text-slate-200 font-black uppercase tracking-widest shrink-0 opacity-90">
                {content.priceSuffix}
              </div>
            </div>
          )}
        </div>

        {/* Right Block in Landscape (Features Grid) */}
        {visibility.servicesBox && (
          <div className={`${isLandscape ? 'w-[42%] shrink-0' : 'w-full'} space-y-2 min-w-0 min-h-0 flex flex-col justify-center`}>
            <div className={`grid grid-cols-1 ${isA5 || isLandscape ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-2 min-w-0`}>
              {content.features.map((feat) => (
                <div key={feat.id} className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs sm:text-sm text-slate-100 font-bold flex items-center gap-2.5 shadow-xl min-w-0">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)] shrink-0" />
                  <span className="leading-snug break-words min-w-0 flex-1">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Footer */}
      {visibility.footer && (
        <BrandFooterBlock 
          content={content}
          theme={theme}
          regionLogo={regionLogo}
          visibility={visibility}
          isA3={isA3}
          isA5={isA5}
          isBackground={true}
          activeColors={{
            primary: '#00A3E0',
            secondary: '#003865',
            accent: '#38BDF8',
            background: '#0F172A',
            cardBg: 'rgba(15, 23, 42, 0.8)',
            textColor: '#FFFFFF'
          }}
        />
      )}

    </div>
  );
};

export const NordicModernVariant = NordicModernVariant1;

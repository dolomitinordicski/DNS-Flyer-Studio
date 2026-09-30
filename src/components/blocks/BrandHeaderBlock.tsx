import React from 'react';
import { BlockProps } from './BlockTypes';
import { DolomitiFullLogo, OFFICIAL_ASSET_PATHS } from '../CorporateVectors';
import { isSvgUrl } from '../../utils/logoUtils';

export const BrandHeaderBlock: React.FC<BlockProps> = ({
  content,
  theme,
  regionLogo,
  visibility,
  format,
  activeLanguage = 'it'
}) => {
  if (visibility && visibility.header === false) return null;

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';

  const translations = content.translations || {};
  const activeTrans = translations[activeLanguage] || {};
  const itTrans = translations['it'] || {};

  const taglineText = activeTrans.headerTagline || content.headerTagline || itTrans.headerTagline || regionLogo.subTitle || 'Iscriviti e Vivi le Dolomiti sulle Piste da Fondo';
  
  // Show header badge ONLY if headerBadge is not explicitly hidden and not duplicating offer badge when hideHeaderBadge is set
  const showBadge = visibility?.headerBadge !== false && !content.hideHeaderBadge && (activeTrans.badgeText || content.badgeText || itTrans.badgeText);
  const badgeVal = activeTrans.badgeText || content.badgeText || itTrans.badgeText;

  return (
    <header 
      className={`${isA5 ? 'px-3 py-2' : 'px-4 sm:px-8 py-3.5 sm:py-5'} shadow-md relative overflow-hidden z-10 shrink-0 ${theme.headerTextColor}`}
      style={theme.headerBgStyle}
    >
      <div className={`flex flex-col ${isA5 ? 'gap-1.5' : 'gap-2 sm:gap-3'} relative z-10 w-full min-w-0`}>
        
        {/* Primary Row: Central Brand Logo & Regional Partner Badge */}
        <div className="flex items-center justify-between gap-3 w-full min-w-0">
          
          {/* Left: Dolomiti NordicSki Central Brand Logo */}
          <div className="flex items-center gap-3 min-w-0 max-w-[65%] shrink">
            {(regionLogo.dnsLogoPlacement === 'header' || !regionLogo.dnsLogoPlacement) && (
              <DolomitiFullLogo 
                variant={content.logoVariant} 
                isDarkHeader={!theme.isHeaderLight}
                className={`${isA5 ? 'h-7' : isA3 ? 'h-14 sm:h-18' : 'h-10 sm:h-12'} max-w-full object-contain shrink min-w-0`} 
                customPrimary={theme.primaryHex}
                customAccent={theme.accentHex}
                cornerStyle={content.logoCornerStyle}
              />
            )}
          </div>

          {/* Right: Selected Regional Partner Badge */}
          {content.regionId && content.regionId !== 'dns_central' && (
            <div 
              className={`flex items-center gap-2 ${isA5 ? 'px-1.5 py-1' : 'px-2.5 py-1.5'} min-w-0 max-w-[55%] shrink justify-end ${
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
                className={`${isA5 ? 'h-5' : isA3 ? 'h-10 sm:h-12' : 'h-7 sm:h-9'} w-auto object-contain shrink-0`} 
              />
              {regionLogo.secondaryLogoSrc && (
                <img 
                  src={
                    theme.isHeaderLight
                      ? regionLogo.secondaryLogoSrc
                      : (regionLogo.secondaryLogoWhiteSrc || regionLogo.secondaryLogoSrc)
                  } 
                  alt={`${regionLogo.name} Secondary`} 
                  className={`${isA5 ? 'h-5' : isA3 ? 'h-10 sm:h-12' : 'h-7 sm:h-9'} w-auto object-contain shrink-0`} 
                />
              )}
              <div className="text-right min-w-0 flex-1">
                <div className={`${isA5 ? 'text-[8px]' : 'text-[9px] sm:text-[11px]'} font-black uppercase leading-tight font-vietnam break-words whitespace-normal ${theme.isBadgeLight ? 'text-slate-900' : theme.headerTextColor}`}>
                  {content.customRegionName || regionLogo.name}
                </div>
                <div className={`${isA5 ? 'text-[7px]' : 'text-[8px] sm:text-[9.5px]'} font-bold tracking-wide uppercase ${theme.isBadgeLight ? 'text-[#0D4D5E] font-extrabold' : theme.headerAccentColor}`}>REGIONAL PARTNER</div>
              </div>
            </div>
          )}

        </div>

        {/* Sub-row: Header Tagline / Region Subtitle & Badge */}
        {(taglineText || showBadge) && (
          <div className={`flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-t border-white/20 ${isA5 ? 'pt-1 text-[8.5px]' : 'pt-1.5 sm:pt-2 text-[10px] sm:text-xs'}`}>
            <span className={`font-semibold tracking-wider uppercase break-words whitespace-normal leading-snug flex-1 min-w-[180px] ${theme.headerTextColor}`}>
              {taglineText}
            </span>
            {showBadge && (
              <span 
                className={`px-2 py-0.5 rounded-full ${isA5 ? 'text-[7.5px]' : 'text-[9px]'} font-black tracking-widest uppercase shrink-0 ${
                  theme.isHeaderLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}
              >
                {badgeVal}
              </span>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

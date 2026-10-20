import React from 'react';
import { BlockProps } from './BlockTypes';

export const HeroMediaBlock: React.FC<BlockProps> = ({
  content,
  visibility,
  format,
  orientation
}) => {
  if (visibility && visibility.heroImage === false) return null;

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = orientation === 'landscape' || content.orientation === 'landscape';
  const isDNSList = content.layoutTemplateId === 'official_price_list';
  const showSeasonOverlay = isDNSList && content.heroImagePosition !== 'background';
  const season = content.validityPeriod ?? '';
  const imageUrl = content.heroImageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80';

  return (
    <div 
      className={`relative w-full ${!content.heroImageHeightPx ? (isA5 ? 'flex-1 min-h-[100px] max-h-[200px]' : isA3 ? 'flex-1 min-h-[220px] max-h-[500px]' : isLandscape ? 'flex-1 min-h-[100px] max-h-[220px]' : content.layoutTemplateId === 'official_price_list' ? 'flex-1 min-h-[110px] max-h-[245px]' : 'flex-1 min-h-[140px] max-h-[360px]') : 'shrink-0'} overflow-hidden bg-slate-900 shadow-inner transition-all duration-300 ${isDNSList ? 'rounded-t-2xl rounded-b-none' : 'rounded-xl'}`}
      style={isDNSList && content.heroImagePosition !== 'background'
        ? {
            flex: '1 1 0%',
            // Fill leftover page space. Magic Tool height is a minimum, not a fixed cap.
            minHeight: `${content.heroImageHeightPx ?? (isLandscape ? 85 : isA3 ? 240 : 155)}px`,
            maxHeight: isLandscape ? '270px' : isA3 ? '660px' : '520px',
          }
        : content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
    >
      <img
        src={imageUrl}
        alt={content.title || 'Dolomiti NordicSki'}
        className="w-full h-full object-cover"
        style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }}
        referrerPolicy="no-referrer"
      />
      <div 
        className="absolute inset-0 bg-slate-900"
        style={{ opacity: (content.heroOverlayOpacity ?? 20) / 100 }}
      />
      {showSeasonOverlay && season.trim() && (
        <div className={`absolute left-[6%] ${isLandscape ? "bottom-8" : "bottom-10"} z-10 pointer-events-none select-none text-white font-vietnam`} style={{ textShadow: "0 2px 12px rgba(0,0,0,.65), 0 1px 3px rgba(0,0,0,.7)" }}>
          <span className={`block uppercase font-semibold tracking-[0.28em] ${isA3 ? "text-xl" : isA5 ? "text-[9px]" : "text-xs sm:text-sm"} ml-1.5`}>WINTER</span>
          <span className={`block leading-none tracking-tight font-extrabold ${isA3 ? "text-7xl" : isA5 ? "text-3xl" : isLandscape ? "text-4xl" : "text-5xl sm:text-6xl"} -mt-0.5`}>{season}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
    </div>
  );
};

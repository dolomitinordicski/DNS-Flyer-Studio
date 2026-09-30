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
  const imageUrl = content.heroImageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80';

  return (
    <div 
      className={`relative w-full ${!content.heroImageHeightPx ? (isA5 ? 'flex-1 min-h-[100px] max-h-[200px]' : isA3 ? 'flex-1 min-h-[220px] max-h-[500px]' : isLandscape ? 'flex-1 min-h-[120px] max-h-[260px]' : 'flex-1 min-h-[140px] max-h-[360px]') : 'shrink-0'} overflow-hidden bg-slate-900 shadow-inner transition-all duration-300 rounded-xl`}
      style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
    >
      <img
        src={imageUrl}
        alt={content.title || 'Dolomiti NordicSki'}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div 
        className="absolute inset-0 bg-slate-900"
        style={{ opacity: (content.heroOverlayOpacity ?? 20) / 100 }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent z-10" />
    </div>
  );
};

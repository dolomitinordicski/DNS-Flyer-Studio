import React from 'react';
import { FlyerVariantProps, getActiveOrder } from './VariantTypes';
import { BLOCK_REGISTRY } from '../blocks';
import { DolomitiCurvesVector } from '../CorporateVectors';

export const OfficialPriceTableVariant: React.FC<FlyerVariantProps> = ({
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
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';

  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const isAiry = visibleCount < 6;

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

      {getActiveOrder(content)
        .filter(id => (visibility as any)[id] !== false)
        .map(id => {
          const Block = BLOCK_REGISTRY[id];
          return Block ? (
            <Block 
              key={id} 
              content={content} 
              theme={theme} 
              plt={plt}
              regionLogo={regionLogo} 
              activeSportsIcons={activeSportsIcons}
              visibility={visibility} 
              format={content.format || 'A4'}
              orientation={content.orientation || 'portrait'} 
            />
          ) : null;
        })}
    </div>
  );
};

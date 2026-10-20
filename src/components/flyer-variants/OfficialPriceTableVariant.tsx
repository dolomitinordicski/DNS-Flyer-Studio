import React from 'react';
import { FlyerVariantProps, getActiveOrder } from './VariantTypes';
import { BlockStackRenderer } from '../blocks';
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
  const isDNSList = content.layoutTemplateId === 'official_price_list';
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

  // Landscape has a shorter page: use the same registered blocks in a
  // two-column editorial composition instead of compressing a portrait stack.
  // Keep regional price lists and the DNS portrait design untouched.
  if (isDNSList && isLandscape && !isBackground) {
    const order = getActiveOrder(content);
    const sharedProps = {
      content, theme, plt, regionLogo, activeSportsIcons, visibility,
      format: content.format || 'A4', orientation: content.orientation || 'portrait',
    } as const;
    const pick = (ids: typeof order) => order.filter(section => ids.includes(section));
    return (
      <div
        className={`relative z-10 h-full min-w-0 overflow-hidden bg-white text-slate-900 font-vietnam flex flex-col ${isA3 ? 'p-7 gap-3' : 'p-3.5 gap-2'} ${content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''}`}
        data-dns-landscape="editorial"
      >
        <div className="shrink-0">
          <BlockStackRenderer order={pick(['header'])} {...sharedProps} />
        </div>
        <div className="shrink-0">
          <BlockStackRenderer order={pick(['bigTitle'])} {...sharedProps} />
        </div>
        <div className={`flex-1 min-h-0 min-w-0 grid ${isA3 ? 'grid-cols-[46%_minmax(0,1fr)] gap-5' : 'grid-cols-[43%_minmax(0,1fr)] gap-3'}`}>
          <div className="min-w-0 min-h-0 flex flex-col [&>div]:!max-h-none [&>div]:!min-h-0" data-dns-landscape-photo>
            <BlockStackRenderer order={pick(['heroImage'])} {...sharedProps} />
          </div>
          <div className={`min-w-0 min-h-0 flex flex-col justify-between ${isA3 ? 'gap-3' : 'gap-1.5'}`} data-dns-landscape-pricing>
            <BlockStackRenderer
              order={order.filter(section => !['header', 'bigTitle', 'heroImage', 'disclaimer', 'footer', 'qrCode'].includes(section))}
              {...sharedProps}
            />
          </div>
        </div>
        <div className="shrink-0 min-w-0">
          <BlockStackRenderer order={pick(['disclaimer'])} {...sharedProps} />
        </div>
        <div className="shrink-0 min-w-0">
          <BlockStackRenderer order={pick(['footer'])} {...sharedProps} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative z-10 h-full flex flex-col ${isDNSList ? "justify-start gap-3" : "justify-between space-y-2"} ${isBackground ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} ${mainPadding} font-vietnam space-y-2 overflow-hidden min-w-0 ${
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
      {!isDNSList && (content.ornamentCurves?.enabled ?? true) && (
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

      <BlockStackRenderer
        order={getActiveOrder(content)}
        content={content}
        theme={theme}
        plt={plt}
        regionLogo={regionLogo}
        activeSportsIcons={activeSportsIcons}
        visibility={visibility}
        format={content.format || 'A4'}
        orientation={content.orientation || 'portrait'}
      />
    </div>
  );
};

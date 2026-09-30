import React from 'react';
import { BlockProps } from './BlockTypes';
import * as LucideIcons from 'lucide-react';

export const PromoHeroBlock: React.FC<BlockProps> = ({
  content,
  theme,
  plt,
  visibility,
  format,
  orientation
}) => {
  if (visibility && visibility.promotionBox === false) return null;
  if (!content.priceAmount && !content.pricePrefix) return null;

  const renderIcon = (name: string, className?: string, style?: any) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Activity;
    return <IconComponent className={className} style={style} />;
  };

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = orientation === 'landscape' || content.orientation === 'landscape';

  const isPriceTable = content.graphicStyle === 'official_price_table';

  const badgeText = isPriceTable
    ? (plt?.bannerTitle || content.badgeText)
    : (content.badgeText || plt?.bannerTitle);

  const titleText = isPriceTable
    ? (plt?.mainTitle || content.title)
    : (content.title || plt?.mainTitle);

  const subtitleText = isPriceTable
    ? (plt?.subTitle || content.subtitle)
    : (content.subtitle || plt?.subTitle);

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

  return (
    <div className="space-y-3 w-full min-w-0">
      {/* Price Banner */}
      {visibility.promotionBox !== false && (content.priceAmount || content.pricePrefix) && (
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
      )}
    </div>
  );
};


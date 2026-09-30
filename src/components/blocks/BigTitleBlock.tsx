import React from 'react';
import { BlockProps } from './BlockTypes';
import * as LucideIcons from 'lucide-react';

export const BigTitleBlock: React.FC<BlockProps> = ({
  content,
  theme,
  plt,
  visibility,
  format,
  orientation
}) => {
  if (visibility && visibility.bigTitle === false) return null;

  const renderIcon = (name: string, className?: string, style?: any) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Activity;
    return <IconComponent className={className} style={style} />;
  };

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = orientation === 'landscape' || content.orientation === 'landscape';

  const isPriceTable = content.graphicStyle === 'official_price_table' || content.graphicStyle === 'official_price_table_v1' || content.layoutTemplateId === 'official_price_list' || content.layoutTemplateId === 'regional_price_list';

  const badgeText = isPriceTable
    ? (plt?.bannerTitle || content.badgeText)
    : (content.badgeText || plt?.bannerTitle);

  const titleText = isPriceTable
    ? (plt?.mainTitle || content.title)
    : (content.title || plt?.mainTitle);

  const subtitleText = isPriceTable
    ? (plt?.subTitle || content.subtitle)
    : (content.subtitle || plt?.subTitle);

  const validityText = isPriceTable
    ? (plt?.seasonYear || content.validityPeriod)
    : (content.validityPeriod || plt?.seasonYear);

  const titleSize = isA5 
    ? 'text-2xl sm:text-3xl' 
    : isA3 
    ? 'text-5xl sm:text-7xl' 
    : 'text-3xl sm:text-5xl';

  const subtitleSize = isA5 
    ? 'text-xs sm:text-sm' 
    : isA3 
    ? 'text-xl sm:text-2xl' 
    : 'text-base sm:text-xl';

  return (
    <div className="space-y-1.5 w-full min-w-0">
      {badgeText && (
        <div className="inline-block mb-0.5">
          <span 
            className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-md font-vietnam"
            style={theme.badgeStyle}
          >
            {badgeText}
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
        {titleText}
      </h2>
      
      {subtitleText && (
        <p 
          className={`mt-0.5 ${isLandscape ? (isA5 ? 'text-xs' : isA3 ? 'text-base' : 'text-sm') : subtitleSize} font-semibold leading-relaxed max-w-2xl break-words`}
          style={{ color: content.heroImagePosition === 'background' ? '#E2E8F0' : `${theme.textColorHex}CC` }}
        >
          {subtitleText}
        </p>
      )}

      {/* Validity & Location */}
      {(content.validityPeriod || content.location || plt?.seasonYear) && (
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold">
          {(content.validityPeriod || plt?.seasonYear) && (
            <span 
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border shadow-sm transition-all text-[10.5px]"
              style={{
                backgroundColor: `${theme.primaryHex}0D`,
                color: theme.textColorHex,
                borderColor: `${theme.primaryHex}20`
              }}
            >
              {renderIcon('Calendar', 'w-3 h-3', { color: theme.primaryHex })}
              <span>{validityText}</span>
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
      )}
    </div>
  );
};

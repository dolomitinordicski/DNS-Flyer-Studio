import React from 'react';
import { BlockProps } from './BlockTypes';
import { Leaf, Calendar, Snowflake, Award, Info, Sparkles } from 'lucide-react';

export const CustomBannerBlock: React.FC<BlockProps> = ({
  content,
  plt,
  theme,
  visibility,
  format
}) => {
  if (visibility && visibility.ecoBanner === false) return null;

  const fmt = format || content.format || 'A4';
  const isA3 = fmt === 'A3';

  const primaryColor = theme.primaryHex || '#004B87';
  const secondaryColor = theme.secondaryHex || '#003366';

  const cb = content.customBanner;

  if (cb) {
    const bannerColor = cb.color || primaryColor;
    const bannerTitle = cb.title || 'BANNER';
    const bannerText = cb.text;

    let IconComponent = Sparkles;
    if (cb.type === 'eco') IconComponent = Leaf;
    else if (cb.type === 'event') IconComponent = Calendar;
    else if (cb.type === 'snow') IconComponent = Snowflake;
    else if (cb.type === 'sponsor') IconComponent = Award;
    else if (cb.type === 'custom') IconComponent = Info;

    return (
      <div 
        className={`${isA3 ? 'p-4' : 'p-2.5'} text-white rounded-xl flex items-center justify-between gap-3 shadow-2xs shrink-0 backdrop-blur-xs w-full`}
        style={{
          background: `linear-gradient(to right, ${bannerColor}, ${secondaryColor})`,
          boxShadow: `0 4px 12px -2px ${bannerColor}40`
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-white/15 shrink-0 flex items-center justify-center">
            <IconComponent className={`${isA3 ? 'w-5 h-5' : 'w-3.5 h-3.5'} text-white`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`${isA3 ? 'text-sm sm:text-base' : 'text-[9px]'} font-black text-white leading-tight uppercase font-vietnam truncate`}>
              {bannerTitle}
            </p>
            {bannerText && (
              <p className={`${isA3 ? 'text-xs' : 'text-[7.5px]'} text-slate-100 font-medium leading-tight mt-0.5 truncate`}>
                {bannerText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Eco Banner behavior (unchanged)
  const tagline = plt?.ecoTagline || content.headerTagline;
  const title = plt?.ecoTitle || 'GREEN MOBILITY & ENVIRONMENT';
  const subtitle = plt?.ecoSub;

  return (
    <div 
      className={`${isA3 ? 'p-4' : 'p-2.5'} text-white rounded-xl flex items-center justify-between gap-2 shadow-2xs shrink-0 backdrop-blur-xs w-full`}
      style={{
        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
        boxShadow: `0 4px 12px -2px ${primaryColor}40`
      }}
    >
      <div className="min-w-0 flex-1">
        {tagline && (
          <div className={`${isA3 ? 'text-xs' : 'text-[7px]'} font-black opacity-90 mb-0.5 tracking-wider uppercase font-vietnam`}>
            {tagline}
          </div>
        )}
        <p className={`${isA3 ? 'text-sm sm:text-base' : 'text-[9px]'} font-black text-white leading-tight uppercase font-vietnam truncate`}>
          {title}
        </p>
        {subtitle && (
          <p className={`${isA3 ? 'text-xs' : 'text-[7.5px]'} text-slate-100 font-medium leading-tight mt-0.5 truncate`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

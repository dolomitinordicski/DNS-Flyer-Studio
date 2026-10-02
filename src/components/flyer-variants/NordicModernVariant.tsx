import React from 'react';
import { FlyerVariantProps, getActiveOrder } from './VariantTypes';
import { BlockStackRenderer } from '../blocks';

export const NordicModernVariant: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons,
  visibility
}) => {
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = content.orientation === 'landscape';

  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const isAiry = visibleCount < 5;

  const mainGap = isA5 
    ? (isLandscape ? 'gap-1' : (isAiry ? 'gap-2' : 'gap-1.5')) 
    : isA3 
    ? (isAiry ? 'gap-10 sm:gap-12' : 'gap-6') 
    : (isAiry ? 'gap-6 sm:gap-8' : 'gap-3 sm:gap-4');

  const containerPadding = isA5 ? (isLandscape ? 'p-2' : 'p-3') : isA3 ? 'p-10 sm:p-14' : 'p-5 sm:p-8';

  return (
    <div className={`relative z-10 h-full flex flex-col justify-between bg-slate-950 text-white ${containerPadding} ${mainGap} overflow-hidden min-w-0 ${
      content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
      content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
    }`}>
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600/10 blur-[120px] -z-10 rounded-full" />

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

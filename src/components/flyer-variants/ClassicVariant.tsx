import React from 'react';
import { FlyerVariantProps, getActiveOrder } from './VariantTypes';
import { BLOCK_REGISTRY } from '../blocks';

export const ClassicVariant: React.FC<FlyerVariantProps> = ({
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
  const isAiry = visibleCount < 6;

  const mainGap = isA5 
    ? (isLandscape ? 'gap-1' : (isAiry ? 'gap-2' : 'gap-1.5')) 
    : isA3 
    ? (isAiry ? 'gap-12' : 'gap-6') 
    : (isAiry ? 'gap-8 sm:gap-10' : 'gap-4 sm:gap-5');

  const mainPadding = isA5 
    ? (isLandscape ? 'p-1.5' : 'p-2.5') 
    : isA3 
    ? 'p-8 sm:p-12' 
    : (isAiry ? 'p-6 sm:p-8' : 'p-4 sm:p-5');

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between overflow-hidden ${mainPadding} ${mainGap} ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.bgHex }}
    >
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

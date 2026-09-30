import React from 'react';
import { FlyerVariantProps, getActiveOrder } from './VariantTypes';
import { BLOCK_REGISTRY } from '../blocks';

export const OnlineTicketVariant: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons = [],
  visibility
}) => {
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';

  const isLandscape = content.orientation === 'landscape';
  const paddingClass = isA5 ? (isLandscape ? 'p-2' : 'p-2.5') : 'p-5 sm:p-7';

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${paddingClass} font-vietnam space-y-3 overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.cardBgHex }}
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

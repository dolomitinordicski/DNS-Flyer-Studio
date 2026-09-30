import React from 'react';
import { FlyerVariantProps, getActiveOrder } from './VariantTypes';
import { BLOCK_REGISTRY } from '../blocks';

export const VoucherVariant: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  activeSportsIcons = [],
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
    ? (isAiry ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-5') 
    : (isAiry ? 'gap-4' : 'gap-2.5 sm:gap-3');

  const mainPadding = isA5 
    ? (isLandscape ? 'p-1.5' : 'p-2.5') 
    : isA3 
    ? 'p-8 sm:p-12' 
    : (isAiry ? 'p-5 sm:p-7' : 'p-4 sm:p-5');

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${mainPadding} font-vietnam ${mainGap} overflow-hidden min-w-0 ${
        content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : 
        content.cornerStyle === 'none' ? '[&_*]:!rounded-none [&_*]:!border-0 [&_*]:!shadow-none' : ''
      }`}
      style={{ backgroundColor: theme.cardBgHex }}
    >
      {/* Dashed Voucher Cutout Border Frame */}
      <div className="absolute inset-1.5 sm:inset-3 border-2 border-dashed border-slate-300 rounded-3xl pointer-events-none z-0 opacity-60" />

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

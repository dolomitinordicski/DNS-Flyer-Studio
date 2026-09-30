import React from 'react';
import { BlockProps } from './BlockTypes';

export const EarlyBirdBlock: React.FC<BlockProps> = ({
  plt,
  theme,
  visibility
}) => {
  if (visibility && visibility.earlyBird === false) return null;
  if (!plt || (!plt.earlyBirdLabel && !plt.earlyBirdDiscount)) return null;

  return (
    <div 
      className="w-full rounded-xl p-2 sm:p-2.5 border-2 shadow-sm flex items-center justify-between gap-2.5 my-1.5 min-w-0"
      style={{ 
        backgroundColor: `${theme.accentHex}20`, 
        borderColor: theme.accentHex,
        color: theme.primaryHex
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div 
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
          style={{ backgroundColor: theme.accentHex, color: theme.primaryHex }}
        >
          %
        </div>
        <div className="min-w-0">
          <div className="text-[10px] sm:text-xs font-black uppercase font-vietnam tracking-wider leading-tight">
            {plt.earlyBirdLabel || 'PREVENDITA / VORVERKAUF'}
          </div>
          {plt.earlyBirdSub && (
            <div className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-600 truncate">
              {plt.earlyBirdSub}
            </div>
          )}
        </div>
      </div>
      {plt.earlyBirdDiscount && (
        <div 
          className="px-2.5 py-1 rounded-lg text-xs font-black font-vietnam uppercase tracking-wide shadow-xs shrink-0"
          style={{ backgroundColor: theme.primaryHex, color: '#FFFFFF' }}
        >
          {plt.earlyBirdDiscount}
        </div>
      )}
    </div>
  );
};

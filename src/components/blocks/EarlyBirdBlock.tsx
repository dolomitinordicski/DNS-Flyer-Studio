import React from 'react';
import { BlockProps } from './BlockTypes';

export const EarlyBirdBlock: React.FC<BlockProps> = ({
  content,
  plt,
  theme,
  visibility
}) => {
  if (visibility && visibility.earlyBird === false) return null;
  if (!plt || (!plt.earlyBirdLabel && !plt.earlyBirdDiscount)) return null;
  const isDNSList = content.layoutTemplateId === 'official_price_list' || content.layoutTemplateId === 'regional_price_list';

  return (
    <div 
      className={`w-full ${isDNSList ? "rounded-sm p-2 border" : "rounded-xl p-2 sm:p-2.5 border-2 shadow-sm"} flex items-center justify-between gap-2.5 my-1.5 min-w-0`}
      style={{ 
        background: isDNSList ? 'linear-gradient(110deg, #062F42 0%, #0D4D5E 60%, #216D85 100%)' : `${theme.accentHex}20`, 
        borderColor: theme.accentHex,
        color: isDNSList ? '#FFFFFF' : theme.primaryHex
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {!isDNSList && <div 
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs"
          style={{ backgroundColor: theme.accentHex, color: theme.primaryHex }}
        >
          %
        </div>}
        <div className="min-w-0">
          <div className="text-[10px] sm:text-xs font-black uppercase font-vietnam tracking-wider leading-tight">
            {plt.earlyBirdLabel || 'PREVENDITA / VORVERKAUF'}
          </div>
          {plt.earlyBirdSub && (
            <div className={`text-[8.5px] sm:text-[9.5px] font-bold ${isDNSList ? "text-white/85" : "text-slate-600"} truncate`}>
              {plt.earlyBirdSub}
            </div>
          )}
        </div>
      </div>
      {plt.earlyBirdDiscount && (
        <div 
          className={`${isDNSList ? "px-1 py-1" : "px-2.5 py-1 rounded-lg shadow-xs"} text-xs font-black font-vietnam uppercase tracking-wide shrink-0`}
          style={{ backgroundColor: isDNSList ? 'transparent' : theme.primaryHex, color: isDNSList ? '#FFFFFF' : '#FFFFFF' }}
        >
          {plt.earlyBirdDiscount}
        </div>
      )}
    </div>
  );
};

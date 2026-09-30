import React from 'react';

export interface RegionalAreaItem {
  id: string;
  number: string;
  name: string;
}

export const DIGITAL_PASS_REGIONS: RegionalAreaItem[] = [
  { id: 'anterselva', number: '02', name: 'Antholzertal / Valle Anterselva' },
  { id: 'gsiesertal', number: '03', name: 'Gsiesertal-Welsberg-Taisten / Val Casies' },
  { id: '3_zinnen', number: '04', name: '3 Zinnen Dolomites / 3 Cime Dolomiti' },
  { id: 'osttirol', number: '05', name: 'Osttirol' },
  { id: 'comelico', number: '06', name: 'Comelico' },
  { id: 'cortina', number: '07', name: 'Cortina d\'Ampezzo' },
  { id: 'ahrntal', number: '08', name: 'Ahrntal / Valle Aurina' },
  { id: 'seiser_alm_val_gardena', number: '09', name: 'Seiser Alm / Val Gardena' },
];

interface RegionalAreasGridBlockProps {
  selectedRegionOption?: string; // 'all' or regionId like '3_zinnen'
  activeRegionId?: string; // fallback from content.regionId
  digitalPassType?: 'weekly_dns' | 'daily_area' | 'weekly_area';
  themePrimaryHex?: string;
  isA5?: boolean;
  onSelectRegion?: (regionId: string) => void;
  titleOverride?: string;
}

export const RegionalAreasGridBlock: React.FC<RegionalAreasGridBlockProps> = ({
  selectedRegionOption,
  activeRegionId = '3_zinnen',
  digitalPassType = 'weekly_dns',
  themePrimaryHex = '#0D4D5E',
  isA5 = false,
  onSelectRegion,
  titleOverride
}) => {
  // Determine if all regions are active
  const isAllActive = digitalPassType === 'weekly_dns' || selectedRegionOption === 'all';
  
  // Active region identifier
  const targetRegionId = selectedRegionOption && selectedRegionOption !== 'all' 
    ? selectedRegionOption 
    : activeRegionId;

  const currentRegionObj = DIGITAL_PASS_REGIONS.find(r => r.id === targetRegionId) || DIGITAL_PASS_REGIONS[2]; // Default 04 3 Zinnen

  const gridTitle = titleOverride || 'GÜLTIG • VALIDO • VALID';

  return (
    <div className="w-full bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
      {/* Header Bar */}
      <div className="flex items-center justify-center pb-1.5 border-b border-slate-100 text-center">
        <span className="text-[10px] sm:text-[11.5px] font-black uppercase tracking-widest text-[#0D4D5E] font-vietnam">
          {gridTitle}
        </span>
      </div>

      {/* 2-Column Grid of 8 Regions Pills */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {DIGITAL_PASS_REGIONS.map((region) => {
          const isHighlighted = isAllActive || region.id === targetRegionId;

          return (
            <div
              key={region.id}
              onClick={() => onSelectRegion && onSelectRegion(region.id)}
              className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border flex items-center gap-2 transition-all duration-150 text-left select-none ${
                onSelectRegion ? 'cursor-pointer hover:scale-[1.01]' : ''
              } ${
                isHighlighted
                  ? 'shadow-xs text-white border-transparent'
                  : 'bg-[#f0f6f7] text-slate-700 border-slate-200/90 hover:bg-slate-100'
              }`}
              style={{
                backgroundColor: isHighlighted ? themePrimaryHex : undefined,
                borderColor: isHighlighted ? themePrimaryHex : undefined,
              }}
            >
              {/* Number Badge */}
              <div
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[8.5px] sm:text-[9.5px] font-black shrink-0 tracking-tight ${
                  isHighlighted
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {region.number}
              </div>

              {/* Region Name */}
              <div className="min-w-0 flex-1">
                <span
                  className={`block text-[9px] sm:text-[10.5px] uppercase tracking-tight truncate leading-tight ${
                    isHighlighted ? 'font-black text-white' : 'font-bold text-slate-800'
                  }`}
                >
                  {region.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

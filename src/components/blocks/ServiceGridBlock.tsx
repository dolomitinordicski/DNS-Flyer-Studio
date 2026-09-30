import React from 'react';
import { BlockProps } from './BlockTypes';
import * as LucideIcons from 'lucide-react';
import { SPORTS_ICONS, getSportsIconName } from '../../data/sportsIcons';
import { WireframeIcon } from '../WireframeIcon';

export const ServiceGridBlock: React.FC<BlockProps> = ({
  content,
  theme,
  plt,
  activeSportsIcons,
  visibility,
  format,
  orientation
}) => {
  if (visibility && visibility.servicesBox === false && visibility.sportsIcons === false) return null;

  const renderIcon = (name: string, className?: string, style?: any) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Activity;
    return <IconComponent className={className} style={style} />;
  };

  const fmt = format || content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = orientation === 'landscape' || content.orientation === 'landscape';

  return (
    <div className="space-y-2 min-w-0 flex flex-col justify-between w-full">
      {/* Inclusions / Features */}
      {content.features && content.features.length > 0 && (
        <div className="space-y-1.5 min-w-0">
          {content.featuresTitle && (
            <h3 
              className="text-[9px] sm:text-[11px] uppercase font-black tracking-widest mb-0.5 font-vietnam"
              style={{ color: content.heroImagePosition === 'background' ? '#CBD5E1' : theme.primaryHex }}
            >
              {content.featuresTitle}
            </h3>
          )}
          <div className={`grid grid-cols-1 ${isA5 || isLandscape ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-1.5`}>
            {content.features.map((feat) => {
              const iconData = SPORTS_ICONS.find(s => s.id === feat.icon);
              const iconName = iconData ? iconData.lucideIconName : 'CheckCircle';
              return (
                <div 
                  key={feat.id} 
                  className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs min-w-0"
                  style={
                    feat.highlight
                      ? theme.featureHighlightStyle
                      : {
                          backgroundColor: content.heroImagePosition === 'background' ? 'rgba(15, 23, 42, 0.65)' : theme.cardBgHex,
                          color: content.heroImagePosition === 'background' ? '#F8FAFC' : theme.textColorHex,
                          borderColor: `${theme.primaryHex}15`
                        }
                  }
                >
                  <div className="mt-0.5 shrink-0">
                    {renderIcon(iconName, 'w-3.5 h-3.5', { color: theme.primaryHex })}
                  </div>
                  <span className="leading-snug break-words min-w-0 flex-1">{feat.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info & Services Box from Price List Texts */}
      {(plt?.infoKidsText || plt?.infoSchoolsText) && (
        <div 
          className="p-2 sm:p-2.5 rounded-xl border space-y-1 shadow-2xs"
          style={{
            backgroundColor: `${theme.primaryHex}08`,
            borderColor: `${theme.primaryHex}20`
          }}
        >
          {plt.infoServicesHeader && (
            <div className="text-[9px] font-black uppercase tracking-wider font-vietnam flex items-center gap-1" style={{ color: theme.primaryHex }}>
              <LucideIcons.Info className="w-3 h-3 shrink-0" />
              <span>{plt.infoServicesHeader}</span>
            </div>
          )}
          <div className="space-y-1 text-[8.5px] sm:text-[9.5px] font-bold text-slate-700">
            {plt.infoKidsText && (
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500 font-black">★</span>
                <span>{plt.infoKidsText}</span>
              </div>
            )}
            {plt.infoSchoolsText && (
              <div className="flex items-center gap-1.5">
                <span className="text-blue-500 font-black">•</span>
                <span>{plt.infoSchoolsText}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sports Icons */}
      {visibility?.sportsIcons !== false && activeSportsIcons && activeSportsIcons.length > 0 && (
        <div 
          className="flex items-center justify-around rounded-2xl p-2 border shadow-sm"
          style={{
            backgroundColor: `${theme.primaryHex}05`,
            borderColor: `${theme.primaryHex}10`
          }}
        >
          {activeSportsIcons.map((icon) => {
            if (!icon) return null;
            return (
              <div key={icon.id} className="flex flex-col items-center gap-0.5 text-center group min-w-0">
                <div 
                  className={`${isA5 ? 'w-6 h-6' : 'w-7 h-7 sm:w-8 sm:h-8'} rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110`}
                  style={theme.iconCircleStyle}
                >
                  <WireframeIcon icon={icon} className={isA5 ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                </div>
                <span 
                  className="text-[8px] sm:text-[9px] font-black font-vietnam uppercase tracking-tighter line-clamp-1"
                  style={{ color: theme.textColorHex }}
                >
                  {getSportsIconName(icon, content.activeLanguage || 'it')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

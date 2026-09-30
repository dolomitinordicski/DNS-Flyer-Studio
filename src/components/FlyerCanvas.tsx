import React, { forwardRef } from 'react';
import { FlyerContent } from '../types';
import { REGIONAL_LOGOS } from '../data/regionalLogos';
import { SPORTS_ICONS, getAllSportsIcons } from '../data/sportsIcons';
import { DEFAULT_PRICE_LIST_TEXTS } from '../data/templates';
import { getContentForLanguage } from '../utils/multilingual';
import { 
  DolomitiSkierTrackEmblem, 
  NordicSwooshOverlay,
} from './CorporateVectors';

// Import Variants
import { FLYER_VARIANT_MAP, ClassicVariant } from './flyer-variants/VariantTypes';

interface FlyerCanvasProps {
  content: FlyerContent;
  scale?: number;
}

export const FlyerCanvas = forwardRef<HTMLDivElement, FlyerCanvasProps>(({ content, scale = 1 }, ref) => {
  // Selected regional logo info
  const baseRegionLogo = REGIONAL_LOGOS.find(r => r.id === content.regionId) || REGIONAL_LOGOS[0];
  const selectedLogoOption = baseRegionLogo.logos?.find(l => l.id === content.selectedRegionLogoId) 
    || baseRegionLogo.logoOptions?.find(l => l.id === content.selectedRegionLogoId)
    || baseRegionLogo.logos?.[0]
    || baseRegionLogo.logoOptions?.[0];

  const regionLogo = {
    ...baseRegionLogo,
    logoSrc: content.customRegionalLogoUrl || selectedLogoOption?.logoSrc || baseRegionLogo.logoSrc,
    logoWhiteSrc: content.customRegionalLogoUrl ? undefined : (selectedLogoOption?.logoWhiteSrc || baseRegionLogo.logoWhiteSrc),
    secondaryLogoSrc: content.customRegionalLogoUrl ? undefined : (selectedLogoOption?.secondaryLogoSrc || baseRegionLogo.secondaryLogoSrc),
    secondaryLogoWhiteSrc: content.customRegionalLogoUrl ? undefined : (selectedLogoOption?.secondaryLogoWhiteSrc || baseRegionLogo.secondaryLogoWhiteSrc),
    regionalLogoScale: content.regionalLogoScale || 100,
    dnsLogoPlacement: content.dnsLogoPlacement || 'header',
  };

  // Map selected sports icons (standard + custom)
  const allIcons = getAllSportsIcons();
  const sportsIconList: any[] = Array.isArray(content.selectedSportsIcons) 
    ? content.selectedSportsIcons 
    : (Array.isArray(content.activeSportsIcons) ? content.activeSportsIcons : ['nordic_classic', 'nordic_skating', 'skipass', 'ski_bus']);
  
  const activeSportsIcons = sportsIconList
    .map(iconId => typeof iconId === 'string' ? allIcons.find(s => s.id === iconId) || { id: iconId, nameIt: iconId, nameDe: iconId, nameEn: iconId } : iconId)
    .filter(Boolean);

  // Localized Content for active language
  const localizedContent = getContentForLanguage(content, content.activeLanguage || 'it');

  // Graphic Style choice
  const graphicStyle = content.graphicStyle || 'classic_official';

  // Price List Texts with defaults
  const plt = { ...DEFAULT_PRICE_LIST_TEXTS, ...localizedContent.priceListTexts };

  // Visibility Configuration
  const v1 = content.sectionVisibility || {};
  const v2 = content.visibility || {};

  const visibility = {
    header: v1.header !== false && v2.header !== false,
    bigTitle: v1.bigTitle !== false && v2.bigTitle !== false,
    heroImage: v1.heroImage !== false && v2.heroImage !== false,
    earlyBird: v1.earlyBird !== false && v2.earlyBird !== false,
    promotionBox: v1.promotionBox !== false && v2.promotionBox !== false,
    priceTables: v1.priceTables !== false && v2.priceTables !== false,
    servicesBox: v1.servicesBox !== false && v2.servicesBox !== false,
    sportsIcons: v1.sportsIcons !== false && v2.sportsIcons !== false,
    features: v1.features !== false && v2.features !== false,
    turnstileNote: v1.turnstileNote !== false && v2.turnstileNote !== false,
    ecoBanner: v1.ecoBanner !== false && v2.ecoBanner !== false,
    qrCode: v1.qrCode !== false && v2.qrCode !== false,
    disclaimer: v1.disclaimer !== false && v2.disclaimer !== false,
    footer: v1.footer !== false && v2.footer !== false,
  };

  // Dynamic Theme Colors based on Official Dolomiti NordicSki Brand Colors
  const getThemeColors = () => {
    let primary = '#0D4D5E';
    let secondary = '#072F3A';
    let accent = '#AAD0D1';
    let bg = '#F4F9FA';
    let cardBg = '#FFFFFF';
    let textColor = '#0D4D5E';

    if (content.customColors) {
      primary = content.customColors.primary || '#0D4D5E';
      secondary = content.customColors.secondary || '#072F3A';
      accent = content.customColors.accent || '#AAD0D1';
      bg = content.customColors.background || '#F4F9FA';
      cardBg = content.customColors.cardBg || '#FFFFFF';
      textColor = content.customColors.textColor || '#0D4D5E';
    } else {
      switch (content.themeColor) {
        case 'nordic_sky':
          primary = '#417483';
          secondary = '#2E5562';
          accent = '#AAD0D1';
          bg = '#F4F9FA';
          cardBg = '#FFFFFF';
          textColor = '#0D4D5E';
          break;
        case 'deep_glacier':
          primary = '#AAD0D1';
          secondary = '#7EAFAF';
          accent = '#0D4D5E';
          bg = '#F4F9FA';
          cardBg = '#FFFFFF';
          textColor = '#0D4D5E';
          break;
        case 'ice_white':
          primary = '#0D4D5E';
          secondary = '#417483';
          accent = '#AAD0D1';
          bg = '#F4F9FA';
          cardBg = '#FFFFFF';
          textColor = '#0D4D5E';
          break;
        case 'frosted_ice':
        default:
          primary = '#0D4D5E';
          secondary = '#072F3A';
          accent = '#AAD0D1';
          bg = '#F4F9FA';
          cardBg = '#FFFFFF';
          textColor = '#0D4D5E';
      }
    }

    const isHeaderLight = ['ice_white', 'nordic_sky'].includes(content.themeColor || 'frosted_ice');
    
    // Determine badge background style (auto, dark, light, or none)
    const bgMode = content.logoBadgeBgStyle || 'auto';
    const isBadgeLight = bgMode === 'light' 
      ? true 
      : bgMode === 'dark' 
      ? false 
      : bgMode === 'none' 
      ? isHeaderLight 
      : isHeaderLight; // 'auto' mode: light if header is light, dark (rgba(255,255,255,0.15)) if header is dark

    let headerBadgeBgStyle: React.CSSProperties = {};
    if (bgMode === 'light') {
      headerBadgeBgStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(0, 0, 0, 0.15)',
      };
    } else if (bgMode === 'dark') {
      headerBadgeBgStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
      };
    } else if (bgMode === 'none') {
      headerBadgeBgStyle = {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      };
    } else {
      // 'auto' mode: dark background in dark headers (as before), light in light headers
      headerBadgeBgStyle = {
        backgroundColor: isHeaderLight ? `${primary}15` : 'rgba(255, 255, 255, 0.15)',
        borderColor: isHeaderLight ? `${primary}25` : 'rgba(255, 255, 255, 0.25)',
      };
    }
    
    return {
      primaryHex: primary,
      secondaryHex: secondary,
      accentHex: accent,
      bgHex: bg,
      cardBgHex: cardBg,
      textColorHex: textColor,
      headerBgStyle: {
        background: isHeaderLight 
          ? '#FFFFFF' 
          : `linear-gradient(135deg, ${primary}, ${secondary})`
      },
      headerTextColor: isHeaderLight ? 'text-slate-900' : 'text-white',
      headerSubtextColor: isHeaderLight ? 'text-slate-500' : 'text-slate-200',
      headerAccentColor: isHeaderLight ? 'text-[#0D4D5E]' : 'text-[#AAD0D1]',
      headerBadgeBgStyle,
      isBadgeLight,
      headerBorderColorStyle: {
        borderColor: isHeaderLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'
      },
      badgeStyle: {
        backgroundColor: accent,
        color: primary
      },
      priceBgStyle: {
        background: `linear-gradient(to right, ${primary}, ${secondary})`,
        color: '#FFFFFF'
      },
      featureHighlightStyle: {
        backgroundColor: `${accent}20`,
        color: primary,
        borderColor: `${primary}40`
      },
      ctaBgStyle: {
        backgroundColor: `${primary}08`,
        borderColor: `${primary}15`
      },
      ctaBadgeStyle: {
        backgroundColor: primary,
        color: '#FFFFFF'
      },
      iconCircleStyle: {
        backgroundColor: primary,
        color: '#FFFFFF'
      },
      isHeaderLight
    };
  };

  const theme = getThemeColors();

  // Helper for rendering ornaments like the Skier
  const renderOrnament = () => {
    if (!content.ornamentSkier?.enabled) return null;
    
    const pos = content.ornamentSkier.position || 'footer_corner';
    const sizeMap: Record<string, number> = { 'sm': 40, 'md': 65, 'lg': 110, 'xl': 180 };
    const size = sizeMap[content.ornamentSkier.size || 'md'] || 65;
    
    let positionClasses = "";
    switch(pos) {
      case 'header_right': positionClasses = "top-4 right-6"; break;
      case 'hero_watermark': positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"; break;
      case 'price_badge': positionClasses = "bottom-48 right-12 rotate-[-12deg]"; break;
      case 'footer_corner':
      default: positionClasses = "bottom-6 right-8";
    }

    return (
      <div 
        className={`absolute z-30 pointer-events-none ${positionClasses}`}
        style={{ 
          opacity: (content.ornamentSkier.opacity || 90) / 100,
          width: size,
          height: size
        }}
      >
        <DolomitiSkierTrackEmblem color={content.ornamentSkier.color || theme.primaryHex} />
      </div>
    );
  };

  const variantProps = {
    content: localizedContent,
    plt,
    theme,
    regionLogo,
    activeSportsIcons,
    visibility,
    format: content.format || 'A4',
    orientation: content.orientation || 'portrait'
  };

  // Dynamic Dimensions based on Paper Size & Orientation
  const getDimensions = () => {
    const isLandscape = content.orientation === 'landscape';
    
    // Base A4 dimensions in mm
    let width = 210;
    let height = 297;

    switch (content.format) {
      case 'A3':
        width = 297;
        height = 420;
        break;
      case 'A5':
        width = 148;
        height = 210;
        break;
      case 'A4':
      default:
        width = 210;
        height = 297;
    }

    if (isLandscape) {
      return { width: `${height}mm`, height: `${width}mm` };
    }
    return { width: `${width}mm`, height: `${height}mm` };
  };

  const dimensions = getDimensions();

  return (
    <div 
      ref={ref}
      className="bg-white shadow-2xl overflow-hidden relative select-none shrink-0"
      style={{
        ...dimensions,
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        marginBottom: scale < 1 ? `calc(${dimensions.height} * ${scale - 1})` : '0',
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <div className="absolute inset-0 z-0 bg-white" />
      
      {/* Background Hero Image (if set to full background) */}
      {visibility.heroImage && content.heroImagePosition === 'background' && content.heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={content.heroImageUrl}
            alt="Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div 
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: content.heroOverlayOpacity / 100 }}
          />
        </div>
      )}

      {/* Render selected Variant */}
      {(() => {
        let effectiveGraphicStyle = graphicStyle;
        if (content.layoutTemplateId === 'hotel_skipass_package' && !graphicStyle?.startsWith('hotel_skipass')) {
          effectiveGraphicStyle = 'hotel_skipass_package';
        }
        const VariantComponent = FLYER_VARIANT_MAP[effectiveGraphicStyle] || ClassicVariant;
        return <VariantComponent {...variantProps} />;
      })()}

      {/* Nordic Swoosh Overlay */}
      <NordicSwooshOverlay config={content.nordicSwoosh} />

      {/* Global Ornaments */}
      {renderOrnament()}
    </div>
  );
});

FlyerCanvas.displayName = 'FlyerCanvas';

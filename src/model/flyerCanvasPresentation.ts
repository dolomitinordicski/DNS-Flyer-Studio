import type React from 'react';
import type { FlyerContent, SectionVisibility } from '../types';
import { findReportingAreaLogo, defaultRegionalLogoOption } from '../data/regionalLogos';
import { getFlyerProductByTemplate } from './flyerProductModel';

/** Stateless view-model helpers. These must not trigger data fetching. */
export function resolveFlyerBrand(content: FlyerContent) {
  // Selected regional logo info
  const isTicketDocument = ['ticket_online_weekly_dns', 'ticket_online_weekly_area', 'ticket_online_daily'].includes(content.layoutTemplateId || '');
  const brandingAreaId = isTicketDocument ? (content.issuingAreaId || (content.regionId !== 'dns_central' ? content.regionId : '3_zinnen')) : content.regionId;
  const baseRegionLogo = findReportingAreaLogo(brandingAreaId);
  // Official regional flyers must display all approved partner marks automatically.
  // Older drafts may have persisted 'primary' or another single-logo choice.
  const selectedLogoOption = content.layoutTemplateId === 'regional_price_list'
    ? defaultRegionalLogoOption(brandingAreaId)
    : (baseRegionLogo.logos?.find(l => l.id === content.selectedRegionLogoId)
      || baseRegionLogo.logoOptions?.find(l => l.id === content.selectedRegionLogoId)
      || defaultRegionalLogoOption(brandingAreaId));

  const regionLogo = {
    ...baseRegionLogo,
    logoSrc: content.customRegionalLogoUrl || selectedLogoOption?.logoSrc || baseRegionLogo.logoSrc,
    logoWhiteSrc: content.customRegionalLogoUrl ? undefined : (selectedLogoOption?.logoWhiteSrc || baseRegionLogo.logoWhiteSrc),
    secondaryLogoSrc: content.customRegionalLogoUrl ? undefined : (selectedLogoOption?.secondaryLogoSrc || baseRegionLogo.secondaryLogoSrc),
    secondaryLogoWhiteSrc: content.customRegionalLogoUrl ? undefined : (selectedLogoOption?.secondaryLogoWhiteSrc || baseRegionLogo.secondaryLogoWhiteSrc),
    regionalLogoScale: content.regionalLogoScale || 100,
    dnsLogoPlacement: content.dnsLogoPlacement || 'header',
  };

  return regionLogo;
}

export function resolveFlyerVisibility(content: FlyerContent) {
  // Visibility Configuration
  const v1: Partial<SectionVisibility> = content.sectionVisibility || {};
  const v2: Partial<SectionVisibility> = content.visibility || {};

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

  return visibility;
}

export function resolveFlyerTheme(content: FlyerContent) {
  // Dynamic Theme Colors based on Official Dolomiti NordicSki Brand Colors
  const getThemeColors = () => {
    let primary = '#0D4D5E';
    let secondary = '#072F3A';
    let accent = '#AAD0D1';
    let bg = '#F4F9FA';
    let cardBg = '#FFFFFF';
    let textColor = '#0D4D5E';

    // Simplified DNS products use only the three locked brand variants.
    // Legacy custom mixes must not override an approved preset.
    if (!getFlyerProductByTemplate(content.layoutTemplateId) && content.customColors) {
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

  return getThemeColors();

}

export function resolveFlyerDimensions(content: FlyerContent) {
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

  return getDimensions();

}

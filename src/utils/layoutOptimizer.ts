import { FlyerContent, PaperFormat, GraphicStyle, SectionVisibility } from '../types';
import { DEFAULT_SECTION_ORDER } from '../components/flyer-variants/VariantTypes';

/**
 * Standardized "Make It Perfect" Layout Optimization Algorithm
 * 
 * Applies layout-specific rules tailored for current:
 * - Paper Format (A3, A4, A5)
 * - Orientation (Portrait vs Landscape)
 * - Graphic Style / Layout Modello
 * 
 * Key Functions:
 * 1. Resizes Header Image as a dynamic buffer to absorb or fill white space.
 * 2. Triggers automatic text scaling (textScaleFactor) and line-break adjustments.
 * 3. Keeps Vertical Fix (Y-axis parameters) isolated from Horizontal Fix (X-axis parameters).
 * 4. Applies strictly to the CURRENT modello and format selected by the user.
 */

export interface OptimizedLayoutResult {
  content: FlyerContent;
  message: string;
}

export function optimizeLayout(content: FlyerContent): OptimizedLayoutResult {
  const fmt: PaperFormat = content.format || 'A4';
  const isLandscape = content.orientation === 'landscape';
  const style: GraphicStyle = content.graphicStyle || 'classic_official';

  // ----------------------------------------------------
  // 1. PRESERVE USER SECTION VISIBILITY TOGGLES
  // Do NOT re-enable sections that the user explicitly turned OFF!
  // ----------------------------------------------------
  const v1: Partial<SectionVisibility> = content.sectionVisibility || {};
  const v2: Partial<SectionVisibility> = content.visibility || {};

  const preservedVisibility: SectionVisibility = {
    header: v1.header !== false && v2.header !== false,
    heroImage: v1.heroImage !== false && v2.heroImage !== false,
    bigTitle: v1.bigTitle !== false && v2.bigTitle !== false,
    earlyBird: v1.earlyBird !== false && v2.earlyBird !== false,
    promotionBox: v1.promotionBox !== false && v2.promotionBox !== false,
    priceTables: v1.priceTables !== false && v2.priceTables !== false,
    servicesBox: v1.servicesBox !== false && v2.servicesBox !== false,
    sportsIcons: v1.sportsIcons !== false && v2.sportsIcons !== false,
    ecoBanner: v1.ecoBanner !== false && v2.ecoBanner !== false,
    qrCode: v1.qrCode !== false && v2.qrCode !== false,
    disclaimer: v1.disclaimer !== false && v2.disclaimer !== false,
    footer: v1.footer !== false && v2.footer !== false,
  };

  const activeVisibleCount = Object.values(preservedVisibility).filter(Boolean).length;

  // ----------------------------------------------------
  // 2. DYNAMIC HEADER IMAGE HEIGHT & BUFFER CALCULATION
  // Adjust image height dynamically according to visible section density so everything fits on 1 page
  // ----------------------------------------------------
  let heroImageHeightPx = 140;

  if (fmt === 'A3') {
    if (isLandscape) {
      heroImageHeightPx = activeVisibleCount >= 7 ? 180 : 240;
    } else {
      heroImageHeightPx = activeVisibleCount >= 7 ? 220 : 300;
    }
  } else if (fmt === 'A5') {
    if (isLandscape) {
      heroImageHeightPx = activeVisibleCount >= 7 ? 45 : 60;
    } else {
      heroImageHeightPx = activeVisibleCount >= 7 ? 60 : 85;
    }
  } else {
    // A4 (Default)
    if (isLandscape) {
      heroImageHeightPx = activeVisibleCount >= 7 ? 70 : 100;
    } else {
      // Portrait
      if (style === 'official_price_table' || style === 'classic_official') {
        heroImageHeightPx = activeVisibleCount >= 8 ? 95 : activeVisibleCount >= 6 ? 120 : 160;
      } else {
        heroImageHeightPx = activeVisibleCount >= 8 ? 110 : activeVisibleCount >= 6 ? 140 : 180;
      }
    }
  }

  // ----------------------------------------------------
  // 3. AUTOMATIC TEXT SCALING & LINE-BREAK ADJUSTMENTS
  // ----------------------------------------------------
  let textScaleFactor = 1.0;
  if (fmt === 'A3') {
    textScaleFactor = isLandscape ? 1.35 : 1.45;
  } else if (fmt === 'A5') {
    textScaleFactor = isLandscape ? 0.74 : 0.80;
  } else {
    // A4
    textScaleFactor = isLandscape ? 0.92 : (activeVisibleCount >= 8 ? 0.95 : 1.0);
  }

  // Clean up and optimize text line breaks
  const cleanText = (text: string | undefined): string => {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  };

  const cleanedTitle = cleanText(content.title);
  const cleanedSubtitle = cleanText(content.subtitle);
  const cleanedBadge = cleanText(content.badgeText);
  const cleanedTagline = cleanText(content.headerTagline);

  // ----------------------------------------------------
  // 4. VECTOR GRAPHICS SIZES (SWOOSH & CURVES)
  // ----------------------------------------------------
  let swooshWidth = 240;
  let curveSize = 340;

  if (fmt === 'A3') {
    swooshWidth = isLandscape ? 460 : 380;
    curveSize = 540;
  } else if (fmt === 'A5') {
    swooshWidth = isLandscape ? 180 : 140;
    curveSize = 210;
  } else {
    // A4
    swooshWidth = isLandscape ? 300 : 240;
    curveSize = 340;
  }

  // ----------------------------------------------------
  // 5. VERTICAL VS HORIZONTAL SECTION ORDER ISOLATION
  // ----------------------------------------------------
  const baseOrder = DEFAULT_SECTION_ORDER;
  const sectionOrderPortrait = content.sectionOrderPortrait && content.sectionOrderPortrait.length > 0 
    ? content.sectionOrderPortrait 
    : baseOrder;
  const sectionOrderLandscape = content.sectionOrderLandscape && content.sectionOrderLandscape.length > 0 
    ? content.sectionOrderLandscape 
    : baseOrder;

  // Build optimized content object with PRESERVED visibility
  const optimizedContent: FlyerContent = {
    ...content,
    heroImageHeightPx,
    textScaleFactor,
    title: cleanedTitle,
    subtitle: cleanedSubtitle,
    badgeText: cleanedBadge,
    headerTagline: cleanedTagline,
    showCropMarks: false,
    sectionVisibility: preservedVisibility,
    visibility: preservedVisibility,
    sectionOrderPortrait,
    sectionOrderLandscape,
    nordicSwoosh: {
      enabled: content.nordicSwoosh?.enabled ?? true,
      position: content.nordicSwoosh?.position || 'top_right',
      variant: content.nordicSwoosh?.variant || 'swoosh_skier',
      size: 'custom',
      customWidthPx: swooshWidth,
      opacity: content.nordicSwoosh?.opacity ?? 90,
    },
    ornamentCurves: {
      enabled: content.ornamentCurves?.enabled ?? true,
      position: content.ornamentCurves?.position || 'header_right',
      sizePx: curveSize,
      opacity: content.ornamentCurves?.opacity ?? 25,
    },
    customColors: {
      primary: content.customColors?.primary || '#0D4D5E',
      secondary: content.customColors?.secondary || '#072F3A',
      accent: content.customColors?.accent || '#AAD0D1',
      background: content.customColors?.background || '#F4F9FA',
      cardBg: content.customColors?.cardBg || '#FFFFFF',
      textColor: content.customColors?.textColor || '#0D4D5E',
    }
  };

  const formatLabel = `${fmt} (${isLandscape ? 'Orizzontale ↔️' : 'Verticale ↕️'})`;
  const message = `✨ Layout e bilanciamento perfetti applicati per ${formatLabel} (${activeVisibleCount} sezioni attive conservate)`;

  return { content: optimizedContent, message };
}

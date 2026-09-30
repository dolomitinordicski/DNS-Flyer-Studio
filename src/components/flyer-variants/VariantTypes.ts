import React from 'react';
import { FlyerContent, FlyerSectionId } from '../../types';

import { ClassicVariant } from './ClassicVariant';
import { ClassicVariant1 } from './ClassicVariant1';
import { ModernGlacierVariant } from './ModernGlacierVariant';
import { ModernGlacierVariant1 } from './ModernGlacierVariant1';
import { NordicModernVariant } from './NordicModernVariant';
import { NordicModernVariant1 } from './NordicModernVariant1';
import { OfficialPriceTableVariant } from './OfficialPriceTableVariant';
import { OfficialPriceTableVariant1 } from './OfficialPriceTableVariant1';
import { OnlineTicketVariant } from './OnlineTicketVariant';
import { OnlineTicketVariant1 } from './OnlineTicketVariant1';
import { VoucherVariant } from './VoucherVariant';
import { VoucherVariant1 } from './VoucherVariant-1';
import { HotelSkipassVariant } from './HotelSkipassVariant';
import { HotelSkipassPanoramaVariant } from './HotelSkipassPanoramaVariant';
import { HotelSkipassCompactVariant } from './HotelSkipassCompactVariant';
import { HotelSkipassFusionVariant } from './HotelSkipassFusionVariant';

export {
  ClassicVariant,
  ClassicVariant1,
  ModernGlacierVariant,
  ModernGlacierVariant1,
  NordicModernVariant,
  NordicModernVariant1,
  OfficialPriceTableVariant,
  OfficialPriceTableVariant1,
  OnlineTicketVariant,
  OnlineTicketVariant1,
  VoucherVariant,
  VoucherVariant1,
  HotelSkipassVariant,
  HotelSkipassPanoramaVariant,
  HotelSkipassCompactVariant,
  HotelSkipassFusionVariant,
};

export const FLYER_VARIANT_MAP: Record<string, React.FC<FlyerVariantProps>> = {
  classic_corporate: ClassicVariant,
  classic_corporate_v1: ClassicVariant1,
  classic_official: ClassicVariant,
  classic_official_v1: ClassicVariant1,
  modern_glacier: ModernGlacierVariant,
  modern_glacier_v1: ModernGlacierVariant1,
  glacier_panorama: ModernGlacierVariant,
  glacier_panorama_v1: ModernGlacierVariant1,
  nordic_modern: NordicModernVariant,
  nordic_modern_v1: NordicModernVariant1,
  official_price_table: OfficialPriceTableVariant,
  official_price_table_v1: OfficialPriceTableVariant1,
  online_ticket_manifesto: OnlineTicketVariant,
  online_ticket_manifesto_v1: OnlineTicketVariant1,
  manifesto_voucher: VoucherVariant,
  manifesto_voucher_v1: VoucherVariant1,
  official_ticket_voucher: VoucherVariant,
  official_ticket_voucher_v1: VoucherVariant1,
  hotel_skipass_package: HotelSkipassVariant,
  hotel_skipass_boutique: HotelSkipassVariant,
  hotel_skipass_panorama: HotelSkipassPanoramaVariant,
  hotel_skipass_compact: HotelSkipassCompactVariant,
  hotel_skipass_fusion: HotelSkipassFusionVariant,
};

export const DEFAULT_SECTION_ORDER: FlyerSectionId[] = [
  'header',
  'heroImage',
  'bigTitle',
  'earlyBird',
  'promotionBox',
  'priceTables',
  'servicesBox',
  'sportsIcons',
  'ecoBanner',
  'qrCode',
  'disclaimer',
  'footer'
];

export interface FlyerVariantProps {
  content: FlyerContent;
  plt: any; // Price List Texts
  theme: {
    primaryHex: string;
    secondaryHex: string;
    accentHex: string;
    bgHex: string;
    cardBgHex: string;
    textColorHex: string;
    headerBgStyle: any;
    headerTextColor: string;
    headerSubtextColor: string;
    headerAccentColor: string;
    headerBadgeBgStyle: any;
    headerBorderColorStyle: any;
    badgeStyle: any;
    priceBgStyle: any;
    featureHighlightStyle: any;
    ctaBgStyle: any;
    ctaBadgeStyle: any;
    iconCircleStyle: any;
    isHeaderLight: boolean;
    isBadgeLight?: boolean;
  };
  regionLogo: any;
  activeSportsIcons: any[];
  visibility: {
    header: boolean;
    heroImage: boolean;
    earlyBird: boolean;
    promotionBox: boolean;
    priceTables: boolean;
    servicesBox: boolean;
    sportsIcons?: boolean;
    features?: boolean;
    turnstileNote?: boolean;
    ecoBanner: boolean;
    qrCode: boolean;
    disclaimer: boolean;
    footer: boolean;
  };
  format: 'A3' | 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
}

export function getActiveOrder(content: FlyerContent): FlyerSectionId[] {
  const isLandscape = content.orientation === 'landscape';
  const custom = isLandscape ? content.sectionOrderLandscape : content.sectionOrderPortrait;
  let order = (custom && custom.length > 0) ? custom : DEFAULT_SECTION_ORDER;
  if (!order.includes('header')) {
    order = ['header', ...order];
  }
  if (!order.includes('footer')) {
    order = [...order, 'footer'];
  }
  return order;
}

export function getCornerClass(content: FlyerContent, defaultRounding: string = 'rounded-xl'): string {
  if (content.cornerStyle === 'sharp' || content.cornerStyle === 'none') {
    return 'rounded-none';
  }
  return defaultRounding;
}

/**
 * Returns 'border-0' if the user selected 'none' for cornerStyle,
 * otherwise returns the provided default border class (e.g. 'border').
 */
export function getBorderClass(content: FlyerContent, defaultBorder: string = 'border'): string {
  if (content.cornerStyle === 'none') {
    return 'border-0 shadow-none';
  }
  return defaultBorder;
}


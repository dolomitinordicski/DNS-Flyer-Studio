import type { FlyerSectionId, GraphicStyle } from '../../types';
import type { FlyerComponentId } from '../../model/blockDataContract';

export type BlockPresetId =
  | 'classic'
  | 'official_price_table'
  | 'online_ticket'
  | 'voucher'
  | 'modern_glacier'
  | 'nordic_modern';

export interface BlockPresetDefinition {
  id: BlockPresetId;
  label: string;
  componentStack: FlyerComponentId[];
  sectionStack: FlyerSectionId[];
  graphicStyles: GraphicStyle[];
}

export const BLOCK_PRESETS: Record<BlockPresetId, BlockPresetDefinition> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    componentStack: [
      'BRAND_HEADER',
      'HERO_MEDIA',
      'PROMO_HERO',
      'SERVICE_GRID',
      'CALL_TO_ACTION',
      'CUSTOM_BANNER',
      'DISCLAIMER_LEGAL',
      'BRAND_FOOTER',
    ],
    sectionStack: ['header', 'heroImage', 'promotionBox', 'servicesBox', 'qrCode', 'ecoBanner', 'disclaimer', 'footer'],
    graphicStyles: ['classic_corporate', 'classic_official'],
  },
  official_price_table: {
    id: 'official_price_table',
    label: 'Official Price Table',
    componentStack: [
      'BRAND_HEADER',
      'PRICE_TABLE',
      'INFO_SERVICES_BOX',
      'CUSTOM_BANNER',
      'CALL_TO_ACTION',
      'DISCLAIMER_LEGAL',
      'BRAND_FOOTER',
    ],
    sectionStack: ['header', 'priceTables', 'servicesBox', 'ecoBanner', 'qrCode', 'disclaimer', 'footer'],
    graphicStyles: ['official_price_table'],
  },
  online_ticket: {
    id: 'online_ticket',
    label: 'Online Ticket',
    componentStack: [
      'BRAND_HEADER',
      'HERO_MEDIA',
      'PRICE_CAROUSEL',
      'INFO_SERVICES_BOX',
      'CALL_TO_ACTION',
      'DISCLAIMER_LEGAL',
      'BRAND_FOOTER',
    ],
    sectionStack: ['header', 'heroImage', 'earlyBird', 'servicesBox', 'qrCode', 'disclaimer', 'footer'],
    graphicStyles: ['online_ticket_manifesto'],
  },
  voucher: {
    id: 'voucher',
    label: 'Voucher',
    componentStack: ['BRAND_HEADER', 'HERO_MEDIA', 'PROMO_HERO', 'SERVICE_GRID', 'CALL_TO_ACTION', 'BRAND_FOOTER'],
    sectionStack: ['header', 'heroImage', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    graphicStyles: ['manifesto_voucher', 'official_ticket_voucher'],
  },
  modern_glacier: {
    id: 'modern_glacier',
    label: 'Modern Glacier',
    componentStack: ['BRAND_HEADER', 'HERO_MEDIA', 'PROMO_HERO', 'SERVICE_GRID', 'CALL_TO_ACTION', 'BRAND_FOOTER'],
    sectionStack: ['header', 'heroImage', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    graphicStyles: ['modern_glacier', 'glacier_panorama'],
  },
  nordic_modern: {
    id: 'nordic_modern',
    label: 'Nordic Modern',
    componentStack: ['BRAND_HEADER', 'HERO_MEDIA', 'PROMO_HERO', 'SERVICE_GRID', 'CALL_TO_ACTION', 'BRAND_FOOTER'],
    sectionStack: ['header', 'heroImage', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    graphicStyles: ['nordic_modern'],
  },
};

export function getBlockPresetForGraphicStyle(style: GraphicStyle): BlockPresetDefinition | undefined {
  return Object.values(BLOCK_PRESETS).find(preset => preset.graphicStyles.includes(style));
}

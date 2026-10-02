import type { FlyerContent, GraphicStyle, LayoutTemplateId } from '../types';
import type { FlyerSectionId } from '../types';

export type FlyerProductType =
  | 'price_list'
  | 'digital_pass'
  | 'hotel_package'
  | 'voucher'
  | 'promotion';

export interface FlyerProductDefinition {
  type: FlyerProductType;
  templateId: LayoutTemplateId;
  label: { de: string; it: string; en: string };
  graphicStyle: GraphicStyle;
  blockStack: FlyerSectionId[];
  editableFields: readonly (keyof FlyerContent | string)[];
}

export const FLYER_PRODUCTS: readonly FlyerProductDefinition[] = [
  {
    type: 'price_list',
    templateId: 'regional_price_list',
    label: { de: 'Preisliste', it: 'Listino prezzi', en: 'Price list' },
    graphicStyle: 'official_price_table',
    blockStack: ['header', 'bigTitle', 'heroImage', 'priceTables', 'servicesBox', 'qrCode', 'disclaimer', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode',
      'priceListTexts',
    ],
  },
  {
    type: 'digital_pass',
    templateId: 'ticket_digital_pass',
    label: { de: 'Digital Pass', it: 'Digital Pass', en: 'Digital Pass' },
    graphicStyle: 'online_ticket_manifesto',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'priceAmount', 'priceNote', 'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode',
    ],
  },
  {
    type: 'hotel_package',
    templateId: 'hotel_skipass_package',
    label: { de: 'Hotel + Langlauf', it: 'Hotel + sci di fondo', en: 'Hotel + Nordic ski' },
    graphicStyle: 'hotel_skipass_package',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'priceAmount', 'priceSuffix', 'priceNote',
      'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode', 'features',
    ],
  },
  {
    type: 'voucher',
    templateId: 'gift_voucher',
    label: { de: 'Gutschein', it: 'Voucher', en: 'Voucher' },
    graphicStyle: 'manifesto_voucher',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'qrCode', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'priceAmount', 'priceNote', 'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode',
    ],
  },
  {
    type: 'promotion',
    templateId: 'hotel_manifesto',
    label: { de: 'Promotion', it: 'Promozione', en: 'Promotion' },
    graphicStyle: 'classic_official',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'priceAmount', 'priceSuffix', 'priceNote', 'features',
      'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode',
    ],
  },
] as const;

const ALL_SECTION_IDS: FlyerSectionId[] = [
  'header',
  'heroImage',
  'bigTitle',
  'earlyBird',
  'promotionBox',
  'priceTables',
  'servicesBox',
  'sportsIcons',
  'features',
  'turnstileNote',
  'ecoBanner',
  'qrCode',
  'disclaimer',
  'footer',
];

export const CANONICAL_TEMPLATE_IDS = FLYER_PRODUCTS.map(product => product.templateId);

export function getFlyerProductByTemplate(templateId?: LayoutTemplateId): FlyerProductDefinition | undefined {
  return FLYER_PRODUCTS.find(product => product.templateId === templateId);
}

export function lockContentToProduct(
  content: FlyerContent,
  product: FlyerProductDefinition,
): FlyerContent {
  const visibility = Object.fromEntries(
    ALL_SECTION_IDS.map(sectionId => [sectionId, product.blockStack.includes(sectionId)]),
  );

  return {
    ...content,
    layoutTemplateId: product.templateId,
    graphicStyle: product.graphicStyle,
    sectionOrderPortrait: [...product.blockStack],
    sectionOrderLandscape: [...product.blockStack],
    sectionVisibility: {
      ...content.sectionVisibility,
      ...visibility,
    },
    visibility: {
      ...content.visibility,
      ...visibility,
    },
  };
}

import type { FlyerContent, GraphicStyle, LayoutTemplateId } from '../types';
import type { FlyerSectionId } from '../types';

export type FlyerProductType =
  | 'dns_price_list'
  | 'regional_price_list'
  | 'ticket_weekly_dns'
  | 'ticket_weekly_area'
  | 'ticket_daily_area'
  | 'hotel_package'
  | 'voucher'
  | 'promotion';

export type FlyerAccessMode = 'dns-only' | 'area';
export type FlyerLanguageMode = 'monolingual' | 'trilingual';

export interface FlyerDataPolicy {
  access: FlyerAccessMode;
  languageMode: FlyerLanguageMode;
  pricing?: {
    dnsPrices?: 'data-entry';
    regionalFromPrices?: 'dns-manual';
    regionalPrices?: 'data-entry';
  };
  ticketType?: 'weekly_dns' | 'weekly_area' | 'daily_area';
}

export interface FlyerProductDefinition {
  type: FlyerProductType;
  templateId: LayoutTemplateId;
  label: { de: string; it: string; en: string };
  graphicStyle: GraphicStyle;
  blockStack: FlyerSectionId[];
  editableFields: readonly (keyof FlyerContent | string)[];
  dataPolicy: FlyerDataPolicy;
}

export const FLYER_PRODUCTS: readonly FlyerProductDefinition[] = [
  {
    type: 'dns_price_list',
    templateId: 'official_price_list',
    label: { de: 'DNS Gesamtpreisliste', it: 'Listino generale DNS', en: 'DNS general price list' },
    graphicStyle: 'official_price_table',
    blockStack: ['header', 'bigTitle', 'heroImage', 'priceTables', 'servicesBox', 'qrCode', 'disclaimer', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode',
      'priceListTexts',
    ],
    dataPolicy: {
      access: 'dns-only',
      languageMode: 'trilingual',
      pricing: {
        dnsPrices: 'data-entry',
        regionalFromPrices: 'dns-manual',
      },
    },
  },
  {
    type: 'regional_price_list',
    templateId: 'regional_price_list',
    label: { de: 'Regionale Preisliste', it: 'Listino regionale', en: 'Regional price list' },
    graphicStyle: 'official_price_table',
    blockStack: ['header', 'bigTitle', 'heroImage', 'priceTables', 'servicesBox', 'qrCode', 'disclaimer', 'footer'],
    editableFields: [
      'title', 'subtitle', 'validityPeriod', 'heroImageUrl',
      'customPrimaryColor', 'customAccentColor',
      'contactEmail', 'contactPhone', 'websiteUrl', 'qrCode',
    ],
    dataPolicy: {
      access: 'area',
      languageMode: 'trilingual',
      pricing: {
        regionalPrices: 'data-entry',
        dnsPrices: 'data-entry',
      },
    },
  },
  {
    type: 'ticket_weekly_dns',
    templateId: 'ticket_online_weekly_dns',
    label: { de: 'DNS Wochenkarte', it: 'Settimanale DNS', en: 'DNS weekly ticket' },
    graphicStyle: 'online_ticket_manifesto',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    editableFields: [
      'heroImageUrl', 'customPrimaryColor', 'customAccentColor', 'qrCode',
    ],
    dataPolicy: {
      access: 'area',
      languageMode: 'monolingual',
      ticketType: 'weekly_dns',
    },
  },
  {
    type: 'ticket_weekly_area',
    templateId: 'ticket_online_weekly_area',
    label: { de: 'Gebiets-Wochenkarte', it: 'Settimanale area', en: 'Area weekly ticket' },
    graphicStyle: 'online_ticket_manifesto',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    editableFields: [
      'heroImageUrl', 'customPrimaryColor', 'customAccentColor', 'qrCode',
    ],
    dataPolicy: {
      access: 'area',
      languageMode: 'monolingual',
      ticketType: 'weekly_area',
    },
  },
  {
    type: 'ticket_daily_area',
    templateId: 'ticket_online_daily',
    label: { de: 'Tageskarte', it: 'Giornaliero', en: 'Daily ticket' },
    graphicStyle: 'online_ticket_manifesto',
    blockStack: ['header', 'heroImage', 'bigTitle', 'promotionBox', 'servicesBox', 'qrCode', 'footer'],
    editableFields: [
      'heroImageUrl', 'customPrimaryColor', 'customAccentColor', 'qrCode',
    ],
    dataPolicy: {
      access: 'area',
      languageMode: 'monolingual',
      ticketType: 'daily_area',
    },
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
    dataPolicy: { access: 'area', languageMode: 'monolingual' },
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
    dataPolicy: { access: 'area', languageMode: 'monolingual' },
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
    dataPolicy: { access: 'area', languageMode: 'monolingual' },
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


export type FlyerOverrides = Partial<FlyerContent>;

export function extractFlyerOverrides(
  content: FlyerContent,
  product: FlyerProductDefinition,
): FlyerOverrides {
  const overrides: FlyerOverrides = {};
  for (const field of product.editableFields) {
    if (!Object.prototype.hasOwnProperty.call(content, field)) continue;
    (overrides as Record<string, unknown>)[field] =
      structuredCloneValue((content as unknown as Record<string, unknown>)[field]);
  }
  return overrides;
}

export function applyFlyerOverrides(
  base: FlyerContent,
  product: FlyerProductDefinition,
  overrides: FlyerOverrides,
): FlyerContent {
  const allowed = new Set(product.editableFields);
  const safeOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([field]) => allowed.has(field)),
  ) as Partial<FlyerContent>;
  return lockContentToProduct({ ...base, ...safeOverrides }, product);
}

function structuredCloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

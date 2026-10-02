import type { FlyerContent, FlyerSectionId } from '../types';

export type FlyerComponentId =
  | 'BRAND_HEADER'
  | 'HERO_MEDIA'
  | 'PROMO_HERO'
  | 'PRICE_TABLE'
  | 'PRICE_CAROUSEL'
  | 'SERVICE_GRID'
  | 'INFO_SERVICES_BOX'
  | 'CUSTOM_BANNER'
  | 'EVENT_SCHEDULE'
  | 'MAP_LOCATION_BLOCK'
  | 'CUSTOM_TEXT_BLOCK'
  | 'PARTNER_SPONSOR_GRID'
  | 'SOCIAL_COMMUNITY_BAR'
  | 'CONTACT_CARD_BOX'
  | 'CALL_TO_ACTION'
  | 'DISCLAIMER_LEGAL'
  | 'BRAND_FOOTER'
  | 'BIG_TITLE';

export type BlockDataSourceKind =
  | 'inline'
  | 'dns-core'
  | 'asset-library'
  | 'derived';

export interface InlineBlockDataSource {
  kind: 'inline';
}

export interface DNSCoreBlockDataSource {
  kind: 'dns-core';
  dataset: string;
  entityId?: string;
  season?: string;
}

export interface AssetLibraryBlockDataSource {
  kind: 'asset-library';
  assetIds: string[];
}

export interface DerivedBlockDataSource {
  kind: 'derived';
  resolver: string;
}

export type BlockDataSource =
  | InlineBlockDataSource
  | DNSCoreBlockDataSource
  | AssetLibraryBlockDataSource
  | DerivedBlockDataSource;

export interface BlockDataBinding {
  blockId: string;
  componentId: FlyerComponentId;
  sectionId?: FlyerSectionId;
  enabled: boolean;
  order?: number;
  source: BlockDataSource;
}

export interface BlockValidationIssue {
  code: string;
  level: 'error' | 'warning';
  field?: string;
  message: string;
}

export interface BlockResolverContext {
  dnsCore?: Record<string, unknown>;
  assets?: Record<string, unknown>;
  derived?: Record<string, unknown>;
}

export interface BlockDataContract<TData = unknown> {
  componentId: FlyerComponentId;
  acceptedSources: readonly BlockDataSourceKind[];
  requiredFields: readonly string[];
  optionalFields: readonly string[];
  validate: (content: FlyerContent) => BlockValidationIssue[];
  resolve: (content: FlyerContent, context?: BlockResolverContext) => TData;
}

export function requiredField(
  content: FlyerContent,
  field: keyof FlyerContent,
  message: string,
): BlockValidationIssue[] {
  const value = content[field];
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return [{
      code: 'required-field',
      level: 'error',
      field: String(field),
      message,
    }];
  }
  return [];
}


export const DEFAULT_SECTION_COMPONENTS: Partial<Record<FlyerSectionId, FlyerComponentId>> = {
  header: 'BRAND_HEADER',
  bigTitle: 'BIG_TITLE',
  heroImage: 'HERO_MEDIA',
  earlyBird: 'PRICE_CAROUSEL',
  promotionBox: 'PROMO_HERO',
  priceTables: 'PRICE_TABLE',
  servicesBox: 'SERVICE_GRID',
  ecoBanner: 'CUSTOM_BANNER',
  qrCode: 'CALL_TO_ACTION',
  disclaimer: 'DISCLAIMER_LEGAL',
  footer: 'BRAND_FOOTER',
};

export function createInlineBlockBindings(content: FlyerContent): BlockDataBinding[] {
  const visibility = content.sectionVisibility ?? content.visibility ?? {} as Record<string, boolean>;
  const order = content.orientation === 'landscape'
    ? (content.sectionOrderLandscape ?? [])
    : (content.sectionOrderPortrait ?? []);
  const fallbackOrder: FlyerSectionId[] = [
    'header',
    'heroImage',
    'bigTitle',
    'earlyBird',
    'promotionBox',
    'priceTables',
    'servicesBox',
    'ecoBanner',
    'qrCode',
    'disclaimer',
    'footer',
  ];
  const sectionOrder = order.length > 0 ? order : fallbackOrder;

  return sectionOrder.flatMap((sectionId, index) => {
    const componentId = DEFAULT_SECTION_COMPONENTS[sectionId];
    if (!componentId) return [];
    const explicit = (visibility as Record<string, boolean | undefined>)[sectionId];
    return [{
      blockId: `${componentId.toLowerCase()}-${index + 1}`,
      componentId,
      sectionId,
      enabled: explicit !== false,
      order: index,
      source: { kind: 'inline' as const },
    }];
  });
}

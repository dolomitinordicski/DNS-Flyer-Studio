import type React from 'react';
import type { FlyerContent, FlyerSectionId, SectionVisibility } from '../../types';
import type { FlyerComponentId } from '../../model/blockDataContract';
import type { BlockDataContract } from '../../model/blockDataContract';
import { getBlockDataContract } from './BlockDataContracts';
import type { BlockProps } from './BlockTypes';
import { BrandHeaderBlock } from './BrandHeaderBlock';
import { BigTitleBlock } from './BigTitleBlock';
import { HeroMediaBlock } from './HeroMediaBlock';
import { PromoHeroBlock } from './PromoHeroBlock';
import { EarlyBirdBlock } from './EarlyBirdBlock';
import { PriceTableBlock } from './PriceTableBlock';
import { ServiceGridBlock } from './ServiceGridBlock';
import { CustomBannerBlock } from './CustomBannerBlock';
import { CallToActionBlock } from './CallToActionBlock';
import { DisclaimerBlock } from './DisclaimerBlock';
import { BrandFooterBlock } from './BrandFooterBlock';

export type BlockEditorPanel =
  | 'brand'
  | 'media'
  | 'promotion'
  | 'pricing'
  | 'services'
  | 'banner'
  | 'events'
  | 'map'
  | 'text'
  | 'partners'
  | 'social'
  | 'contact'
  | 'cta'
  | 'legal'
  | 'footer';

export interface FlyerBlockDefinition {
  componentId: FlyerComponentId;
  sectionId?: FlyerSectionId;
  label: { de: string; it: string; en: string };
  editorPanels: BlockEditorPanel[];
  requiredFields: (keyof FlyerContent | string)[];
  optionalFields?: (keyof FlyerContent | string)[];
  implementation: 'runtime' | 'planned';
  renderer?: React.FC<BlockProps>;
  defaultVisible?: boolean;
  dataContract?: BlockDataContract;
}

const runtime = (
  componentId: FlyerComponentId,
  sectionId: FlyerSectionId,
  renderer: React.FC<BlockProps>,
  label: FlyerBlockDefinition['label'],
  editorPanels: BlockEditorPanel[],
  requiredFields: FlyerBlockDefinition['requiredFields'],
  optionalFields: FlyerBlockDefinition['optionalFields'] = [],
  defaultVisible = true,
): FlyerBlockDefinition => ({
  componentId,
  sectionId,
  renderer,
  label,
  editorPanels,
  requiredFields,
  optionalFields,
  implementation: 'runtime',
  defaultVisible,
  dataContract: getBlockDataContract(componentId),
});

const planned = (
  componentId: FlyerComponentId,
  label: FlyerBlockDefinition['label'],
  editorPanels: BlockEditorPanel[],
  requiredFields: FlyerBlockDefinition['requiredFields'],
): FlyerBlockDefinition => ({
  componentId,
  label,
  editorPanels,
  requiredFields,
  implementation: 'planned',
  dataContract: getBlockDataContract(componentId),
});

export const BLOCK_DEFINITIONS: readonly FlyerBlockDefinition[] = [
  runtime('BRAND_HEADER', 'header', BrandHeaderBlock,
    { de: 'Brand-Kopf', it: 'Testata brand', en: 'Brand header' },
    ['brand'], ['regionId', 'headerTagline'], ['selectedRegionLogoId', 'customRegionalLogoUrl']),
  runtime('BIG_TITLE', 'bigTitle', BigTitleBlock,
    { de: 'Dokumenttitel', it: 'Titolo documento', en: 'Document title' },
    ['promotion'], ['title'], ['subtitle', 'validityPeriod']),
  runtime('HERO_MEDIA', 'heroImage', HeroMediaBlock,
    { de: 'Titelbild', it: 'Immagine principale', en: 'Hero media' },
    ['media'], ['heroImageUrl'], ['secondaryImages', 'selectedSportsIcons']),
  runtime('PRICE_CAROUSEL', 'earlyBird', EarlyBirdBlock,
    { de: 'Vorverkauf', it: 'Prevendita', en: 'Price carousel' },
    ['pricing'], ['priceListTexts'], [], false),
  runtime('PROMO_HERO', 'promotionBox', PromoHeroBlock,
    { de: 'Angebot', it: 'Offerta', en: 'Promotion' },
    ['promotion'], ['title', 'priceAmount'], ['badgeText', 'subtitle'], false),
  runtime('PRICE_TABLE', 'priceTables', PriceTableBlock,
    { de: 'Preistabelle', it: 'Listino prezzi', en: 'Price table' },
    ['pricing'], ['priceListTexts']),
  runtime('SERVICE_GRID', 'servicesBox', ServiceGridBlock,
    { de: 'Leistungen', it: 'Servizi inclusi', en: 'Service grid' },
    ['services'], ['features'], [], false),
  runtime('CUSTOM_BANNER', 'ecoBanner', CustomBannerBlock,
    { de: 'Infobanner', it: 'Banner informativo', en: 'Custom banner' },
    ['banner'], ['priceListTexts.customBanner'], [], false),
  runtime('CALL_TO_ACTION', 'qrCode', CallToActionBlock,
    { de: 'Call-to-Action & QR', it: 'Call to action & QR', en: 'Call to action & QR' },
    ['cta'], ['qrCode'], ['websiteUrl', 'ctaText']),
  runtime('DISCLAIMER_LEGAL', 'disclaimer', DisclaimerBlock,
    { de: 'Rechtliche Hinweise', it: 'Disclaimer legale', en: 'Legal disclaimer' },
    ['legal'], ['priceListTexts'], [], true),
  runtime('BRAND_FOOTER', 'footer', BrandFooterBlock,
    { de: 'Brand-Fußzeile', it: 'Footer brand', en: 'Brand footer' },
    ['footer'], ['footerConfig'], ['contactEmail', 'contactPhone', 'websiteUrl']),
  planned('INFO_SERVICES_BOX',
    { de: 'Serviceinformationen', it: 'Informazioni servizi', en: 'Service information' },
    ['services'], ['priceListTexts']),
  planned('EVENT_SCHEDULE',
    { de: 'Programm & Zeiten', it: 'Programma e orari', en: 'Event schedule' },
    ['events'], ['scheduleItems']),
  planned('MAP_LOCATION_BLOCK',
    { de: 'Karte & Anfahrt', it: 'Mappa e indicazioni', en: 'Map and directions' },
    ['map'], ['mapLocation']),
  planned('CUSTOM_TEXT_BLOCK',
    { de: 'Freitext', it: 'Testo libero', en: 'Custom text' },
    ['text'], ['customTextBlocks']),
  planned('PARTNER_SPONSOR_GRID',
    { de: 'Partner & Sponsoren', it: 'Partner e sponsor', en: 'Partners and sponsors' },
    ['partners'], ['partnerLogos']),
  planned('SOCIAL_COMMUNITY_BAR',
    { de: 'Social Community', it: 'Social community', en: 'Social community' },
    ['social'], ['socialLinks']),
  planned('CONTACT_CARD_BOX',
    { de: 'Kontaktbox', it: 'Box contatti', en: 'Contact card' },
    ['contact'], ['contactEmail', 'contactPhone']),
] as const;

export const BLOCK_BY_COMPONENT_ID = Object.fromEntries(
  BLOCK_DEFINITIONS.map(def => [def.componentId, def]),
) as Record<FlyerComponentId, FlyerBlockDefinition>;

export const BLOCK_BY_SECTION_ID = Object.fromEntries(
  BLOCK_DEFINITIONS
    .filter((def): def is FlyerBlockDefinition & { sectionId: FlyerSectionId } => !!def.sectionId)
    .map(def => [def.sectionId, def]),
) as Partial<Record<FlyerSectionId, FlyerBlockDefinition>>;

export function getRuntimeBlock(sectionId: FlyerSectionId): FlyerBlockDefinition | undefined {
  const definition = BLOCK_BY_SECTION_ID[sectionId];
  return definition?.implementation === 'runtime' && definition.renderer ? definition : undefined;
}

export function isBlockVisible(
  sectionId: FlyerSectionId,
  visibility: SectionVisibility | Record<string, boolean>,
): boolean {
  const explicit = (visibility as Record<string, boolean | undefined>)[sectionId];
  if (explicit !== undefined) return explicit;
  return getRuntimeBlock(sectionId)?.defaultVisible ?? true;
}

export function getEditorPanelsForSections(sectionIds: FlyerSectionId[]): BlockEditorPanel[] {
  return [...new Set(
    sectionIds.flatMap(id => getRuntimeBlock(id)?.editorPanels ?? []),
  )];
}

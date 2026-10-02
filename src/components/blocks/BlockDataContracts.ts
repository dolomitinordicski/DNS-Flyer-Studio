import type { FlyerContent } from '../../types';
import type {
  BlockDataContract,
  BlockValidationIssue,
  FlyerComponentId,
} from '../../model/blockDataContract';
import { requiredField } from '../../model/blockDataContract';

const noIssues = (): BlockValidationIssue[] => [];

const contracts: BlockDataContract[] = [
  {
    componentId: 'BRAND_HEADER',
    acceptedSources: ['inline', 'dns-core', 'derived'],
    requiredFields: ['regionId'],
    optionalFields: ['headerTagline', 'selectedRegionLogoId', 'customRegionalLogoUrl', 'customRegionName'],
    validate: (content) => requiredField(content, 'regionId', 'A DNS region/area is required.'),
    resolve: (content) => ({
      regionId: content.regionId,
      headerTagline: content.headerTagline,
      selectedRegionLogoId: content.selectedRegionLogoId,
      customRegionalLogoUrl: content.customRegionalLogoUrl,
      customRegionName: content.customRegionName,
      logoVariant: content.logoVariant,
      logoBadgeBgStyle: content.logoBadgeBgStyle,
      dnsLogoPlacement: content.dnsLogoPlacement,
    }),
  },
  {
    componentId: 'BIG_TITLE',
    acceptedSources: ['inline', 'derived'],
    requiredFields: ['title'],
    optionalFields: ['subtitle', 'validityPeriod', 'location', 'badgeText'],
    validate: (content) => requiredField(content, 'title', 'A title is required.'),
    resolve: (content) => ({
      title: content.title,
      subtitle: content.subtitle,
      validityPeriod: content.validityPeriod,
      location: content.location,
      badgeText: content.badgeText,
    }),
  },
  {
    componentId: 'HERO_MEDIA',
    acceptedSources: ['inline', 'asset-library', 'derived'],
    requiredFields: ['heroImageUrl'],
    optionalFields: ['secondaryImages', 'selectedSportsIcons', 'heroImagePosition', 'heroOverlayOpacity'],
    validate: (content) => requiredField(content, 'heroImageUrl', 'A hero image is required when HERO_MEDIA is active.'),
    resolve: (content) => ({
      heroImageUrl: content.heroImageUrl,
      heroImagePosition: content.heroImagePosition,
      heroOverlayOpacity: content.heroOverlayOpacity,
      heroImageHeightPx: content.heroImageHeightPx,
      secondaryImages: content.secondaryImages,
      selectedSportsIcons: content.selectedSportsIcons,
    }),
  },
  {
    componentId: 'PRICE_CAROUSEL',
    acceptedSources: ['inline', 'dns-core', 'derived'],
    requiredFields: ['priceListTexts'],
    optionalFields: ['pricePrefix', 'priceAmount', 'priceCurrency', 'priceSuffix'],
    validate: (content) => content.priceListTexts
      ? noIssues()
      : [{ code: 'missing-price-list', level: 'error', field: 'priceListTexts', message: 'Price data is required.' }],
    resolve: (content) => ({
      priceListTexts: content.priceListTexts,
      pricePrefix: content.pricePrefix,
      priceAmount: content.priceAmount,
      priceCurrency: content.priceCurrency,
      priceSuffix: content.priceSuffix,
    }),
  },
  {
    componentId: 'PROMO_HERO',
    acceptedSources: ['inline', 'derived'],
    requiredFields: ['title', 'priceAmount'],
    optionalFields: ['subtitle', 'badgeText', 'pricePrefix', 'priceCurrency', 'priceSuffix', 'priceNote'],
    validate: (content) => [
      ...requiredField(content, 'title', 'A promotion title is required.'),
      ...requiredField(content, 'priceAmount', 'A promotion price is required.'),
    ],
    resolve: (content) => ({
      title: content.title,
      subtitle: content.subtitle,
      badgeText: content.badgeText,
      pricePrefix: content.pricePrefix,
      priceAmount: content.priceAmount,
      priceCurrency: content.priceCurrency,
      priceSuffix: content.priceSuffix,
      priceNote: content.priceNote,
    }),
  },
  {
    componentId: 'PRICE_TABLE',
    acceptedSources: ['inline', 'dns-core', 'derived'],
    requiredFields: ['priceListTexts'],
    optionalFields: ['regionId', 'validityPeriod'],
    validate: (content) => content.priceListTexts
      ? noIssues()
      : [{ code: 'missing-price-table', level: 'error', field: 'priceListTexts', message: 'Official price-table data is required.' }],
    resolve: (content) => ({
      priceListTexts: content.priceListTexts,
      regionId: content.regionId,
      validityPeriod: content.validityPeriod,
    }),
  },
  {
    componentId: 'SERVICE_GRID',
    acceptedSources: ['inline', 'dns-core', 'derived'],
    requiredFields: ['features'],
    optionalFields: ['featuresTitle', 'selectedSportsIcons'],
    validate: (content) => content.features?.length
      ? noIssues()
      : [{ code: 'empty-services', level: 'warning', field: 'features', message: 'No services/features are configured.' }],
    resolve: (content) => ({
      featuresTitle: content.featuresTitle,
      features: content.features,
      selectedSportsIcons: content.selectedSportsIcons,
    }),
  },
  {
    componentId: 'CUSTOM_BANNER',
    acceptedSources: ['inline', 'derived'],
    requiredFields: [],
    optionalFields: ['ecoBannerTitle', 'ecoBannerText', 'ecoBannerTagline', 'priceListTexts.customBanner'],
    validate: () => noIssues(),
    resolve: (content) => ({
      enabled: content.ecoBannerEnabled,
      title: content.ecoBannerTitle,
      text: content.ecoBannerText,
      tagline: content.ecoBannerTagline,
      customBanner: content.priceListTexts?.customBanner,
    }),
  },
  {
    componentId: 'CALL_TO_ACTION',
    acceptedSources: ['inline', 'derived'],
    requiredFields: ['qrCode'],
    optionalFields: ['ctaText', 'websiteUrl', 'contactEmail', 'contactPhone'],
    validate: (content) => {
      if (!content.qrCode?.enabled) return noIssues();
      return content.qrCode.url
        ? noIssues()
        : [{ code: 'missing-qr-url', level: 'error', field: 'qrCode.url', message: 'QR code is enabled but has no URL.' }];
    },
    resolve: (content) => ({
      ctaText: content.ctaText,
      websiteUrl: content.websiteUrl,
      contactEmail: content.contactEmail,
      contactPhone: content.contactPhone,
      qrCode: content.qrCode,
    }),
  },
  {
    componentId: 'DISCLAIMER_LEGAL',
    acceptedSources: ['inline', 'dns-core', 'derived'],
    requiredFields: [],
    optionalFields: ['priceListTexts.disclaimerDe', 'priceListTexts.disclaimerIt', 'priceListTexts.disclaimerEn'],
    validate: () => noIssues(),
    resolve: (content) => ({
      disclaimerDe: content.priceListTexts?.disclaimerDe,
      disclaimerIt: content.priceListTexts?.disclaimerIt,
      disclaimerEn: content.priceListTexts?.disclaimerEn,
    }),
  },
  {
    componentId: 'BRAND_FOOTER',
    acceptedSources: ['inline', 'dns-core', 'derived'],
    requiredFields: [],
    optionalFields: ['footerConfig', 'contactEmail', 'contactPhone', 'websiteUrl', 'addressInfo'],
    validate: () => noIssues(),
    resolve: (content) => ({
      footerConfig: content.footerConfig,
      contactEmail: content.contactEmail,
      contactPhone: content.contactPhone,
      websiteUrl: content.websiteUrl,
      addressInfo: content.addressInfo,
      showPartnerLogos: content.showPartnerLogos,
    }),
  },
];

export const BLOCK_DATA_CONTRACTS = Object.fromEntries(
  contracts.map(contract => [contract.componentId, contract]),
) as Partial<Record<FlyerComponentId, BlockDataContract>>;

export function getBlockDataContract(componentId: FlyerComponentId): BlockDataContract | undefined {
  return BLOCK_DATA_CONTRACTS[componentId];
}

export function validateBlockData(
  componentId: FlyerComponentId,
  content: FlyerContent,
): BlockValidationIssue[] {
  return getBlockDataContract(componentId)?.validate(content) ?? [];
}

export function resolveBlockData(
  componentId: FlyerComponentId,
  content: FlyerContent,
  context?: Parameters<BlockDataContract['resolve']>[1],
): unknown {
  return getBlockDataContract(componentId)?.resolve(content, context);
}

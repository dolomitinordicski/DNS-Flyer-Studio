import type { FlyerContent, PriceListTexts } from '../types';
import type { DNSCoreBlockDataSource } from '../model/blockDataContract';
import { dnsCoreBlockDataProvider } from './blockDataProviders';
import { seasonIdFromContent } from './flyerRepository';

interface PricingConfig {
  id?: string;
  seasonId?: string;
  productCode?: 'day' | 'wk-area' | 'wk-dns' | 'sk-area' | 'sk-dns' | 'sk-instructor';
  scopeType?: 'network' | 'reportingArea' | 'organization';
  scopeId?: string;
  salesChannel?: 'official' | 'online' | 'track' | 'press' | 'complimentary';
  salesPeriod?: 'presale' | 'regular';
  currency?: string;
  unitPrice?: number;
  active?: boolean;
  revision?: number;
}

const PRICE_TABLE_TEMPLATES = new Set([
  'official_price_list',
  'regional_price_list',
]);

export function shouldHydratePriceTableFromDNSCore(content: FlyerContent): boolean {
  return PRICE_TABLE_TEMPLATES.has(content.layoutTemplateId ?? '')
    || content.graphicStyle === 'official_price_table';
}

export async function hydratePriceTableFromDNSCore(content: FlyerContent): Promise<FlyerContent> {
  if (!shouldHydratePriceTableFromDNSCore(content)) return content;

  const season = seasonIdFromContent(content);
  const source: DNSCoreBlockDataSource = {
    kind: 'dns-core',
    dataset: 'ticketPricingConfigs',
    season,
  };
  const raw = await dnsCoreBlockDataProvider.resolve(source);
  if (!Array.isArray(raw)) return content;

  const configs = raw.filter(isPricingConfig);
  if (configs.length === 0) return content;

  const canonical = buildCanonicalPriceTexts(configs, content.regionId);
  if (Object.keys(canonical).length === 0) return content;

  const mergeTexts = (base?: PriceListTexts): PriceListTexts => ({
    ...(base ?? {}),
    ...canonical,
  });

  return {
    ...content,
    priceListTexts: mergeTexts(content.priceListTexts),
    translations: content.translations
      ? {
          ...content.translations,
          de: content.translations.de
            ? { ...content.translations.de, priceListTexts: mergeTexts(content.translations.de.priceListTexts) }
            : content.translations.de,
          it: content.translations.it
            ? { ...content.translations.it, priceListTexts: mergeTexts(content.translations.it.priceListTexts) }
            : content.translations.it,
          en: content.translations.en
            ? { ...content.translations.en, priceListTexts: mergeTexts(content.translations.en.priceListTexts) }
            : content.translations.en,
        }
      : content.translations,
  };
}

export function buildCanonicalPriceTexts(
  configs: PricingConfig[],
  regionId: string,
): Partial<PriceListTexts> {
  const candidates = configs
    .filter(config =>
      config.active !== false
      && config.currency === 'EUR'
      && config.salesChannel === 'official'
      && (config.salesPeriod === undefined || config.salesPeriod === 'regular')
      && typeof config.unitPrice === 'number',
    )
    .sort((a, b) => (b.revision ?? 0) - (a.revision ?? 0));

  const area = (productCode: PricingConfig['productCode']) =>
    pickPrice(candidates, productCode, 'reportingArea', regionId)
    ?? pickPrice(candidates, productCode, 'network', 'dolomiti-nordicski');

  const network = (productCode: PricingConfig['productCode']) =>
    pickPrice(candidates, productCode, 'network', 'dolomiti-nordicski');

  const result: Partial<PriceListTexts> = {};
  if (regionId && regionId !== 'dns_central') {
    const day = area('day');
    const weekArea = area('wk-area');
    const seasonArea = area('sk-area');
    if (day !== undefined) result.regionalDayPrice = formatEuro(day);
    if (weekArea !== undefined) result.regionalWeekPrice = formatEuro(weekArea);
    if (seasonArea !== undefined) result.regionalSeasonPrice = formatEuro(seasonArea);
  }

  const weekDns = network('wk-dns');
  const seasonDns = network('sk-dns');
  if (weekDns !== undefined) result.carouselWeekPrice = formatEuro(weekDns);
  if (seasonDns !== undefined) result.carouselSeasonPrice = formatEuro(seasonDns);

  return result;
}

function pickPrice(
  configs: PricingConfig[],
  productCode: PricingConfig['productCode'],
  scopeType: PricingConfig['scopeType'],
  scopeId: string,
): number | undefined {
  return configs.find(config =>
    config.productCode === productCode
    && config.scopeType === scopeType
    && config.scopeId === scopeId,
  )?.unitPrice;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function isPricingConfig(value: unknown): value is PricingConfig {
  if (!value || typeof value !== 'object') return false;
  const item = value as PricingConfig;
  return typeof item.productCode === 'string'
    && typeof item.scopeType === 'string'
    && typeof item.scopeId === 'string'
    && typeof item.unitPrice === 'number';
}

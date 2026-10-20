import type { FlyerContent, PriceListTexts } from '../../types';

/**
 * Presentation-only policy for the existing shared price table.
 * Data Entry / DNS Core remain responsible for official tariffs.
 * No extra renderer or duplicate per-product TSX is required.
 */
export function getPriceTablePresentation(content: FlyerContent, texts: PriceListTexts) {
  const isRegional = content.layoutTemplateId === 'regional_price_list';
  const isDNS = content.layoutTemplateId === 'official_price_list';
  const isNetwork = isDNS && content.regionId === 'dns_central';

  return {
    kind: isRegional ? 'regional' : isDNS ? 'dns' : 'legacy',
    singleColumn: false,
    networkEmphasis: isDNS,
    areaHeader: isNetwork ? 'AREA PRICES' : isRegional ? 'AREA PRICES' : texts.regionalHeader,
    areaName: isNetwork ? 'Individual ski areas' : (content.customRegionName || undefined),
    networkHeader: (isDNS || isRegional) ? 'DOLOMITI NORDICSKI' : texts.carouselHeader,
    weeklyTrackSupplement: (isDNS || isRegional) ? texts.carouselWeekTrackSupplement : undefined,
  } as const;
}

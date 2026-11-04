import { collection, getDocs, query, where } from 'firebase/firestore';
import { dnsCoreDb } from '../lib/dnsCore';
import type { PriceListTexts } from '../types';
import { coreReportingAreaId } from './regionalLogos';
import { selectPrice } from './pricingSelection';

interface PricingRow {
  seasonId: string;
  scopeType: string;
  scopeId: string;
  productCode: string;
  salesChannel: string;
  salesPeriod: string;
  unitPrice: number | null;
}

const format = (value: number | null | undefined): string =>
  typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value)
    : '—';

export async function loadOfficialPriceTexts(
  seasonId: string,
  regionId: string,
  isNetworkList: boolean,
): Promise<Partial<PriceListTexts>> {
  const snapshot = await getDocs(query(
    collection(dnsCoreDb, 'ticketPricingConfigs'),
    where('seasonId', '==', seasonId),
  ));
  const rows = snapshot.docs.map(doc => doc.data() as PricingRow);
  const reportingAreaId = coreReportingAreaId(regionId);
  const network = 'dolomiti-nordicski';
  const price = (productCode: string, channel = 'official', period = 'regular') =>
    selectPrice(rows, productCode, reportingAreaId, channel, period);
  const difference = (productCode: string): string => {
    const official = price(productCode);
    const track = price(productCode, 'track');
    return typeof official === 'number' && typeof track === 'number'
      ? format(track - official) : '—';
  };
  const result: Partial<PriceListTexts> = {
    // DNS products can only resolve from the central network scope.
    carouselWeekPrice: format(price('wk-dns')),
    carouselWeekTrackSupplement: difference('wk-dns'),
    carouselSeasonPrice: format(price('sk-dns')),
  };

  // Preserve the network flyer editorial "ab / da / from" regional prices.
  // The area flyer resolves area overrides before network defaults.
  if (!isNetworkList) {
    result.regionalDayPrice = format(price('day'));
    result.regionalDayTrackSupplement = difference('day');
    result.regionalWeekPrice = format(price('wk-area'));
    result.regionalWeekTrackSupplement = difference('wk-area');
    result.regionalSeasonPrice = format(price('sk-area'));
  }
  return result;
}

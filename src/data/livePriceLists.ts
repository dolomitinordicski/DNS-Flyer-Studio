import { collection, getDocs, query, where } from 'firebase/firestore';
import { dnsCoreDb } from '../lib/dnsCore';
import type { PriceListTexts } from '../types';

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
  const price = (scopeType: string, scopeId: string, productCode: string, channel = 'official', period = 'regular') =>
    format(rows.find(row =>
      row.scopeType === scopeType && row.scopeId === scopeId &&
      row.productCode === productCode && row.salesChannel === channel &&
      row.salesPeriod === period
    )?.unitPrice);

  const network = 'dolomiti-nordicski';
  const result: Partial<PriceListTexts> = {
    carouselWeekPrice: price('network', network, 'wk-dns'),
    carouselSeasonPrice: price('network', network, 'sk-dns'),
  };

  // The network flyer deliberately leaves regional "ab / da / from" editorial
  // prices untouched; only its official DNS network table is hydrated.
  if (!isNetworkList) {
    result.regionalDayPrice = price('reportingArea', regionId, 'day');
    result.regionalWeekPrice = price('reportingArea', regionId, 'wk-area');
    result.regionalSeasonPrice = price('network', network, 'sk-area');
  }
  return result;
}

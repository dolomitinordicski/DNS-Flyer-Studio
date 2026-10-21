import { collection, getDocs, query, where } from 'firebase/firestore';
import { dnsCoreDb } from '../lib/dnsCore';
import type { PriceListTexts } from '../types';

// Historic Flyer Studio keys are not the DNS Core reporting-area IDs.
const CORE_AREA_ID: Record<string, string> = {
  anterselva: 'antholzertal',
  gsiesertal: 'gsiesertal-welsberg-taisten',
  '3_zinnen': 'drei-zinnen',
  comelico: 'val-comelico',
  cortina: 'cortina-d-ampezzo',
  seiser_alm_val_gardena: 'seiser-alm-dolomites-val-gardena',
};

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
  const officialWeekly = rows.find(row => row.scopeType === 'network' && row.scopeId === network &&
    row.productCode === 'wk-dns' && row.salesChannel === 'official' && row.salesPeriod === 'regular')?.unitPrice;
  const trackWeekly = rows.find(row => row.scopeType === 'network' && row.scopeId === network &&
    row.productCode === 'wk-dns' && row.salesChannel === 'track' && row.salesPeriod === 'regular')?.unitPrice;
  const trackSupplement = typeof officialWeekly === 'number' && typeof trackWeekly === 'number'
    ? format(trackWeekly - officialWeekly) : '—';
  const difference = (scopeType: string, scopeId: string, productCode: string): string => {
    const regular = rows.find(row => row.scopeType === scopeType && row.scopeId === scopeId && row.productCode === productCode && row.salesChannel === 'official' && row.salesPeriod === 'regular')?.unitPrice;
    const onTrack = rows.find(row => row.scopeType === scopeType && row.scopeId === scopeId && row.productCode === productCode && row.salesChannel === 'track' && row.salesPeriod === 'regular')?.unitPrice;
    return typeof regular === 'number' && typeof onTrack === 'number' ? format(onTrack - regular) : '—';
  };
  const result: Partial<PriceListTexts> = {
    carouselWeekPrice: price('network', network, 'wk-dns'),
    carouselWeekTrackSupplement: trackSupplement,
    carouselSeasonPrice: price('network', network, 'sk-dns'),
  };

  // The network flyer deliberately leaves regional "ab / da / from" editorial
  // prices untouched; only its official DNS network table is hydrated.
  if (!isNetworkList) {
    const reportingAreaId = CORE_AREA_ID[regionId] || regionId;
    result.regionalDayPrice = price('reportingArea', reportingAreaId, 'day');
    result.regionalDayTrackSupplement = difference('reportingArea', reportingAreaId, 'day');
    result.regionalWeekPrice = price('reportingArea', reportingAreaId, 'wk-area');
    result.regionalWeekTrackSupplement = difference('reportingArea', reportingAreaId, 'wk-area');
    result.regionalSeasonPrice = price('network', network, 'sk-area');
  }
  return result;
}

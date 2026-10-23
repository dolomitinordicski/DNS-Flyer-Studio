/** Curated DNS presentation photos. Local, versioned assets: never random stock. */
const base = import.meta.env.BASE_URL;
export const DNS_STOCK_PHOTOS = [
  `${base}stock/kottersteger-trail-sun.webp`,
  `${base}stock/kottersteger-skiers-portrait.webp`,
  `${base}stock/kottersteger-panorama.webp`,
  `${base}stock/kottersteger-trail-aerial.webp`,
  `${base}stock/roschan-fill-138.jpg`,
  `${base}stock/roschan-fill-060.jpg`,
] as const;

/** Default only; a user-selected photo always takes priority. */
export function resolveDNSFlyerPhoto(selectedUrl?: string, templateId?: string): string {
  const selected = selectedUrl?.trim();
  if (selected) {
    // Normalize locally saved paths from pre-fix drafts to Vite's deployment base.
    if (selected.startsWith('/stock/')) return `${base}${selected.slice(1)}`;
    return selected;
  }
  if (templateId === 'gift_voucher') return DNS_STOCK_PHOTOS[1];
  if (templateId === 'service_voucher') return DNS_STOCK_PHOTOS[0];
  if (templateId === 'hotel_skipass_package') return DNS_STOCK_PHOTOS[4];
  if (templateId === 'regional_price_list') return DNS_STOCK_PHOTOS[3];
  return DNS_STOCK_PHOTOS[2];
}

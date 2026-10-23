/** Curated DNS presentation photos. Local, versioned assets: never random stock. */
export const DNS_STOCK_PHOTOS = [
  '/stock/dns/kottersteger-trail-sun.webp',
  '/stock/dns/kottersteger-skiers-portrait.webp',
  '/stock/dns/kottersteger-panorama.webp',
  '/stock/dns/kottersteger-trail-aerial.webp',
  '/stock/dns/roschan-fill-138.jpg',
  '/stock/dns/roschan-fill-060.jpg',
] as const;

/** Default only; a user-selected photo always takes priority. */
export function resolveDNSFlyerPhoto(selectedUrl?: string, templateId?: string): string {
  const selected = selectedUrl?.trim();
  if (selected) return selected;
  if (templateId === 'gift_voucher') return DNS_STOCK_PHOTOS[1];
  if (templateId === 'service_voucher') return DNS_STOCK_PHOTOS[0];
  if (templateId === 'hotel_skipass_package') return DNS_STOCK_PHOTOS[4];
  if (templateId === 'regional_price_list') return DNS_STOCK_PHOTOS[3];
  return DNS_STOCK_PHOTOS[2];
}

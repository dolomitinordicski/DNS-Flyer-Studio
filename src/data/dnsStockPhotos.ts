/** Curated DNS presentation photos. Bundled in public/stock; no external image URLs. */
const stockNames = [
  'kottersteger-trail-sun.webp',
  'kottersteger-skiers-portrait.webp',
  'kottersteger-panorama.webp',
  'kottersteger-trail-aerial.webp',
  'roschan-fill-138.jpg',
  'roschan-fill-060.jpg',
] as const;

/**
 * Resolve against the deployed application root, rather than the current page
 * (or a draft's old absolute /stock path). This also works with a Vite base
 * such as /DNS-Flyer-Studio/ instead of assuming the domain root.
 */
const appBase = new URL(import.meta.env.BASE_URL, window.location.href);
const stockUrl = (name: string) => new URL(`stock/${name}`, appBase).href;

export const DNS_STOCK_PHOTOS = stockNames.map(stockUrl);

/** Default only; a user-selected photo always takes priority. */
export function resolveDNSFlyerPhoto(selectedUrl?: string, templateId?: string): string {
  const selected = selectedUrl?.trim();
  if (selected) {
    // Migrate old locally saved stock references without keeping a wrong host root.
    const stockMatch = selected.match(/^\/?(?:\.\/)?stock\/([^?#]+)(?:[?#].*)?$/);
    if (stockMatch) return stockUrl(stockMatch[1]);
    try {
      const parsed = new URL(selected, window.location.href);
      // Previously saved URLs can refer to /stock at the domain root, or to
      // another deployment of this same collection. Prefer our bundled copies.
      const filename = parsed.pathname.split('/').pop();
      if (filename && stockNames.includes(filename as typeof stockNames[number]) &&
          parsed.pathname.includes('/stock/')) return stockUrl(filename);
    } catch {
      // Leave custom values untouched; the image editor surfaces load errors.
    }
    return selected;
  }
  if (templateId === 'gift_voucher') return DNS_STOCK_PHOTOS[1];
  if (templateId === 'service_voucher') return DNS_STOCK_PHOTOS[0];
  if (templateId === 'hotel_skipass_package') return DNS_STOCK_PHOTOS[4];
  if (templateId === 'regional_price_list') return DNS_STOCK_PHOTOS[3];
  return DNS_STOCK_PHOTOS[2];
}

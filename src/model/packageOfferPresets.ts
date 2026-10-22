import type { FlyerContent } from '../types';

/** Editorial-only presets. Values are examples and never represent official DNS tariffs. */
export const PACKAGE_OFFER_PRESETS = [
  {
    id: 'package',
    label: { de: 'Paket', it: 'Pacchetto' },
    content: {
      badgeText: 'NORDIC PACKAGE · WINTER 2026/27',
      title: 'Eine Woche im Langlaufparadies',
      subtitle: 'Langlaufurlaub mit Übernachtung und ausgewählten Leistungen',
      pricePrefix: 'AB',
      priceAmount: '',
      priceSuffix: 'pro Person / Paket',
      priceNote: 'Preis und Verfügbarkeit beim Partner anfragen',
      featuresTitle: 'Inklusivleistungen',
      ctaText: 'Jetzt anfragen',
    },
  },
  {
    id: 'offer',
    label: { de: 'Angebot', it: 'Offerta' },
    content: {
      badgeText: 'SPECIAL OFFER',
      title: 'Langlauf-Special',
      subtitle: 'Ein besonderes Winterangebot für begrenzte Zeit',
      pricePrefix: '',
      priceAmount: '',
      priceSuffix: '',
      priceNote: 'Angebotsbedingungen und Zeitraum beim Partner erfragen',
      featuresTitle: 'Angebotsdetails',
      ctaText: 'Angebot entdecken',
    },
  },
  {
    id: 'experience',
    label: { de: 'Erlebnis', it: 'Esperienza' },
    content: {
      badgeText: 'NORDIC EXPERIENCE',
      title: 'Langlauf erleben',
      subtitle: 'Ein nordisches Erlebnis in den Dolomiten',
      pricePrefix: 'AB',
      priceAmount: '',
      priceSuffix: 'pro Person',
      priceNote: 'Details und Verfügbarkeit beim Veranstalter',
      featuresTitle: 'Im Erlebnis enthalten',
      ctaText: 'Mehr erfahren',
    },
  },
] as const;

export function applyPackageOfferPreset(content: FlyerContent, presetId: string): Partial<FlyerContent> {
  const preset = PACKAGE_OFFER_PRESETS.find(item => item.id === presetId);
  if (!preset) return {};
  return { ...preset.content };
}

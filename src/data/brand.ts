export interface BrandRegionArea {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
}

export const BRAND_FACTS = {
  totalKm: '900+',
  numAreas: 8,
  hashtag: '#dolomitinordicski',
  website: 'www.dolomitinordicski.com',
  copyrightYear: '2026',
  brandName: 'DOLOMITI NORDICSKI',
};

// Area IDs, official flyer display names and numbering come from the shared
// regional presentation registry. Only the short editorial labels live here.
import { REGIONAL_LOGOS } from './regionalLogos';

const EDITORIAL_SHORT_NAMES: Record<string, string> = {
  anterselva: 'Anterselva',
  gsiesertal: 'Val Casies',
  '3_zinnen': '3 Cime',
  osttirol: 'Osttirol',
  comelico: 'Comelico',
  cortina: 'Cortina',
  ahrntal: 'Valle Aurina',
  seiser_alm_val_gardena: 'Seiser Alm',
};

export const BRAND_AREAS: BrandRegionArea[] = REGIONAL_LOGOS
  .filter(area => area.id !== 'dns_central')
  .map(area => ({
    id: area.id,
    code: area.name.slice(0, 2),
    shortName: EDITORIAL_SHORT_NAMES[area.id] || area.regionName,
    fullName: area.regionName,
  }));

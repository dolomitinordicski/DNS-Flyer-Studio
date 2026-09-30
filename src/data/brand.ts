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

export const BRAND_AREAS: BrandRegionArea[] = [
  { id: 'anterselva', code: '02', shortName: 'Anterselva', fullName: 'Antholzertal / Valle Anterselva' },
  { id: 'gsiesertal', code: '03', shortName: 'Val Casies', fullName: 'Gsiesertal / Val Casies' },
  { id: '3_zinnen', code: '04', shortName: '3 Cime', fullName: '3 Zinnen Dolomites / 3 Cime Dolomiti' },
  { id: 'osttirol', code: '05', shortName: 'Osttirol', fullName: 'Osttirol / Tirolo Orientale' },
  { id: 'comelico', code: '06', shortName: 'Comelico', fullName: 'Comelico / Val Comelico' },
  { id: 'cortina', code: '07', shortName: 'Cortina', fullName: 'Cortina d\'Ampezzo' },
  { id: 'ahrntal', code: '08', shortName: 'Valle Aurina', fullName: 'Ahrntal / Valle Aurina' },
  { id: 'seiser_alm_val_gardena', code: '09', shortName: 'Seiser Alm', fullName: 'Seiser Alm / Val Gardena' },
];

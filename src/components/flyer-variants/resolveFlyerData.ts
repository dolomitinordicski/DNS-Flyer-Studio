export interface ResolvedHotelPackageData {
  title: string;
  subtitle: string;
  badge: string;
  headerTagline: string;
  location: string;
  validityPeriod: string;
  
  pricePrefix: string;
  priceAmount: string;
  priceCurrency: string;
  priceSuffix: string;
  priceNote: string;
  
  featuresTitle: string;
  features: Array<{ id?: string; text: string; highlight?: boolean }>;
  
  promoBannerTitle: string;
  promoBannerText: string;
  
  hotelName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  
  activeSportsIcons: string[];
}

export function resolveHotelPackageData(
  content: any,
  activeLanguage: string = 'it'
): ResolvedHotelPackageData {
  const translations = content.translations || {};
  const activeTrans = translations[activeLanguage] || {};
  const itTrans = translations['it'] || {};

  const getField = (field: string, fallback: string) => {
    if (activeTrans && activeTrans[field] !== undefined && activeTrans[field] !== null && activeTrans[field] !== '') {
      return activeTrans[field];
    }
    if (content && content[field] !== undefined && content[field] !== null && content[field] !== '') {
      return content[field];
    }
    if (itTrans && itTrans[field] !== undefined && itTrans[field] !== null && itTrans[field] !== '') {
      return itTrans[field];
    }
    if (activeTrans && activeTrans[field] === '') return '';
    if (content && content[field] === '') return '';
    return fallback;
  };

  const title = getField('title', 'Settimana Bianca Sci di Fondo & Relax');
  const subtitle = getField('subtitle', 'Soggiorno esclusivo in hotel con Skipass Dolomiti NordicSki incluso e servizi benessere.');
  const badge = getField('badgeText', 'OFFERTA SPECIALE HOTEL PARTNER 2026/27');
  const headerTagline = getField('headerTagline', 'Dolomiti NordicSki • Special Package');
  const location = getField('location', '3 Zinnen Dolomites / Alta Pusteria');
  const validityPeriod = getField('validityPeriod', 'Valido dal 06.01.2027 al 28.03.2027');

  const pricePrefix = getField('pricePrefix', 'DA');
  const priceAmount = getField('priceAmount', '389');
  const priceCurrency = getField('priceCurrency', '€');
  const priceSuffix = getField('priceSuffix', '/ 4 Notti per persona');
  const priceNote = getField('priceNote', 'Include pernottamento, mezza pensione e Skipass 3 Giorni');

  const featuresTitle = getField('featuresTitle', 'Servizi Inclusi nel Pacchetto Hotel:');

  const rawFeatures = (activeTrans && Array.isArray(activeTrans.features))
    ? activeTrans.features
    : ((content && Array.isArray(content.features)) ? content.features : (itTrans && Array.isArray(itTrans.features) ? itTrans.features : []));

  const features = Array.isArray(rawFeatures) ? rawFeatures : [];

  const promoBannerTitle = getField('promoBannerTitle', 'L\'Area Sci di Fondo 3 Cime Dolomites');
  const promoBannerText = getField('promoBannerText', 'Oltre 200 km di piste perfettamente preparate immerse nelle Dolomiti Patrimonio UNESCO, con garanzia di innevamento e panorami unici.');

  const address = getField('addressInfo', 'Hotel Partner Ufficiale Dolomiti NordicSki');
  const hotelName = content.holderName || address;
  const phone = content.contactPhone || '+39 0474 913156';
  const email = content.contactEmail || 'booking@hotelpartner.com';
  const website = content.websiteUrl || 'www.hotelpartner.com';

  const activeSportsIcons = content.activeSportsIcons || content.selectedSportsIcons || ['cross_country', 'hotel_wellness', 'skipass_included', 'equipment_rental'];

  return {
    title,
    subtitle,
    badge,
    headerTagline,
    location,
    validityPeriod,
    pricePrefix,
    priceAmount,
    priceCurrency,
    priceSuffix,
    priceNote,
    featuresTitle,
    features,
    promoBannerTitle,
    promoBannerText,
    hotelName,
    phone,
    email,
    website,
    address,
    activeSportsIcons
  };
}

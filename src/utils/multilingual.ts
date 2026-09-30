import { FlyerContent, LanguageCode, MultilingualTextSet } from '../types';
import { 
  DEFAULT_PRICE_LIST_TEXTS_IT, 
  DEFAULT_PRICE_LIST_TEXTS_DE, 
  DEFAULT_PRICE_LIST_TEXTS_EN,
  DEFAULT_PRICE_LIST_TEXTS 
} from '../data/templates';

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'de', label: 'Tedesco (DE)', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano (IT)', flag: '🇮🇹' },
  { code: 'en', label: 'Inglese (EN)', flag: '🇬🇧' }
];

export function cleanseObsoleteTerms(text: string): string {
  if (!text) return text;
  return text
    .replace(/Gebietswochenkarte/gi, 'AREA Wochenkarte')
    .replace(/Gebiets-Wochenkarte/gi, 'AREA Wochenkarte')
    .replace(/Gebiets Wochenkarte/gi, 'AREA Wochenkarte')
    .replace(/Spezifikationen Gebiets-Wochenkarte/gi, 'Spezifikationen AREA Wochenkarte');
}

function cleanTextSet(set: MultilingualTextSet): MultilingualTextSet {
  return {
    ...set,
    headerTagline: cleanseObsoleteTerms(set.headerTagline || ''),
    badgeText: cleanseObsoleteTerms(set.badgeText || ''),
    title: cleanseObsoleteTerms(set.title || ''),
    subtitle: cleanseObsoleteTerms(set.subtitle || ''),
    validityPeriod: set.validityPeriod || '2026/27',
    location: set.location || '',
    pricePrefix: set.pricePrefix || '',
    priceAmount: set.priceAmount || '',
    priceCurrency: set.priceCurrency || '',
    priceSuffix: set.priceSuffix || '',
    priceNote: cleanseObsoleteTerms(set.priceNote || ''),
    featuresTitle: cleanseObsoleteTerms(set.featuresTitle || ''),
    promoBannerTitle: cleanseObsoleteTerms(set.promoBannerTitle || ''),
    promoBannerText: cleanseObsoleteTerms(set.promoBannerText || ''),
    promoBannerBadge: cleanseObsoleteTerms(set.promoBannerBadge || ''),
    ecoBannerTitle: cleanseObsoleteTerms(set.ecoBannerTitle || ''),
    ecoBannerText: cleanseObsoleteTerms(set.ecoBannerText || ''),
    ecoBannerTagline: cleanseObsoleteTerms(set.ecoBannerTagline || ''),
    ctaText: cleanseObsoleteTerms(set.ctaText || ''),
    addressInfo: cleanseObsoleteTerms(set.addressInfo || ''),
    holderName: set.holderName || '',
    issueDate: set.issueDate || '',
    ticketStatus: set.ticketStatus || '',
    issuerName: set.issuerName || '',
    turnstileNote: set.turnstileNote || '',
    verificationNote: set.verificationNote || '',
    features: set.features?.map(f => ({ ...f, text: cleanseObsoleteTerms(f.text) })) || []
  };
}

export function getInitialTranslations(base: FlyerContent): {
  de: MultilingualTextSet;
  it: MultilingualTextSet;
  en: MultilingualTextSet;
} {
  const existing = base.translations;
  
  const rawIt: MultilingualTextSet = {
    headerTagline: existing?.it?.headerTagline ?? base.headerTagline ?? '',
    badgeText: existing?.it?.badgeText ?? base.badgeText ?? '',
    title: existing?.it?.title ?? base.title ?? '',
    subtitle: existing?.it?.subtitle ?? base.subtitle ?? '',
    validityPeriod: existing?.it?.validityPeriod ?? base.validityPeriod ?? '2026/27',
    location: existing?.it?.location ?? base.location ?? '',
    pricePrefix: existing?.it?.pricePrefix ?? base.pricePrefix ?? '',
    priceAmount: existing?.it?.priceAmount ?? base.priceAmount ?? '',
    priceCurrency: existing?.it?.priceCurrency ?? base.priceCurrency ?? '',
    priceSuffix: existing?.it?.priceSuffix ?? base.priceSuffix ?? '',
    priceNote: existing?.it?.priceNote ?? base.priceNote ?? '',
    featuresTitle: existing?.it?.featuresTitle ?? base.featuresTitle ?? '',
    promoBannerTitle: existing?.it?.promoBannerTitle ?? base.promoBannerTitle ?? '',
    promoBannerText: existing?.it?.promoBannerText ?? base.promoBannerText ?? '',
    promoBannerBadge: existing?.it?.promoBannerBadge ?? base.promoBannerBadge ?? '',
    ecoBannerTitle: existing?.it?.ecoBannerTitle ?? base.ecoBannerTitle ?? '',
    ecoBannerText: existing?.it?.ecoBannerText ?? base.ecoBannerText ?? '',
    ecoBannerTagline: existing?.it?.ecoBannerTagline ?? base.ecoBannerTagline ?? '',
    ctaText: existing?.it?.ctaText ?? base.ctaText ?? '',
    addressInfo: existing?.it?.addressInfo ?? base.addressInfo ?? '',
    holderName: existing?.it?.holderName ?? base.holderName ?? 'Mario Rossi',
    issueDate: existing?.it?.issueDate ?? base.issueDate ?? '15.12.2026',
    ticketStatus: existing?.it?.ticketStatus ?? base.ticketStatus ?? 'VALIDO',
    issuerName: existing?.it?.issuerName ?? base.issuerName ?? '3 Zinnen Dolomites / Consorzio DNS',
    turnstileNote: existing?.it?.turnstileNote ?? base.turnstileNote ?? 'Istruzioni ai varchi: Accostare il QR Code al lettore ottico dei tornelli per convalidare l\'accesso alle piste.',
    verificationNote: existing?.it?.verificationNote ?? base.verificationNote ?? 'Scansiona il QR code al varco per la verifica',
    features: existing?.it?.features ?? base.features ?? [],
    priceListTexts: existing?.it?.priceListTexts ?? DEFAULT_PRICE_LIST_TEXTS_IT
  };

  const rawDe: MultilingualTextSet = {
    headerTagline: existing?.de?.headerTagline ?? (base.headerTagline ? translateToDe(base.headerTagline) : ''),
    badgeText: existing?.de?.badgeText ?? (base.badgeText ? translateToDe(base.badgeText) : ''),
    title: existing?.de?.title ?? (base.title ? translateToDe(base.title) : ''),
    subtitle: existing?.de?.subtitle ?? (base.subtitle ? translateToDe(base.subtitle) : ''),
    validityPeriod: existing?.de?.validityPeriod ?? base.validityPeriod ?? '2026/27',
    location: existing?.de?.location ?? (base.location ? translateToDe(base.location) : ''),
    pricePrefix: existing?.de?.pricePrefix ?? (base.pricePrefix === 'DA' ? 'AB' : base.pricePrefix === 'PREZZO' ? 'PREIS' : base.pricePrefix === 'TARIFFA' ? 'TARIF' : base.pricePrefix ? translateToDe(base.pricePrefix) : ''),
    priceAmount: existing?.de?.priceAmount ?? base.priceAmount ?? '',
    priceCurrency: existing?.de?.priceCurrency ?? base.priceCurrency ?? '',
    priceSuffix: existing?.de?.priceSuffix ?? (base.priceSuffix ? translateToDe(base.priceSuffix) : ''),
    priceNote: existing?.de?.priceNote ?? (base.priceNote ? translateToDe(base.priceNote) : ''),
    featuresTitle: existing?.de?.featuresTitle ?? (base.featuresTitle ? translateToDe(base.featuresTitle) : ''),
    promoBannerTitle: existing?.de?.promoBannerTitle ?? (base.promoBannerTitle ? translateToDe(base.promoBannerTitle) : ''),
    promoBannerText: existing?.de?.promoBannerText ?? (base.promoBannerText ? translateToDe(base.promoBannerText) : ''),
    promoBannerBadge: existing?.de?.promoBannerBadge ?? (base.promoBannerBadge ? translateToDe(base.promoBannerBadge) : ''),
    ecoBannerTitle: existing?.de?.ecoBannerTitle ?? (base.ecoBannerTitle ? translateToDe(base.ecoBannerTitle) : ''),
    ecoBannerText: existing?.de?.ecoBannerText ?? (base.ecoBannerText ? translateToDe(base.ecoBannerText) : ''),
    ecoBannerTagline: existing?.de?.ecoBannerTagline ?? (base.ecoBannerTagline ? translateToDe(base.ecoBannerTagline) : ''),
    ctaText: existing?.de?.ctaText ?? (base.ctaText ? translateToDe(base.ctaText) : ''),
    addressInfo: existing?.de?.addressInfo ?? (base.addressInfo ? translateToDe(base.addressInfo) : ''),
    holderName: existing?.de?.holderName ?? base.holderName ?? 'Max Mustermann',
    issueDate: existing?.de?.issueDate ?? base.issueDate ?? '15.12.2026',
    ticketStatus: existing?.de?.ticketStatus ?? (base.ticketStatus ? translateToDe(base.ticketStatus) : 'GÜLTIG'),
    issuerName: existing?.de?.issuerName ?? base.issuerName ?? '3 Zinnen Dolomites / Consorzio DNS',
    turnstileNote: existing?.de?.turnstileNote ?? (base.turnstileNote ? translateToDe(base.turnstileNote) : 'Anleitung Drehkreuze: QR-Code an den optischen Leser des Drehkreuzes halten, um den Zugang zu den Loipen zu entriegeln.'),
    verificationNote: existing?.de?.verificationNote ?? (base.verificationNote ? translateToDe(base.verificationNote) : 'QR-Code am Drehkreuz zur Überprüfung scannen'),
    features: existing?.de?.features ?? base.features?.map(f => ({ ...f, text: translateToDe(f.text) })) ?? [],
    priceListTexts: existing?.de?.priceListTexts ?? DEFAULT_PRICE_LIST_TEXTS_DE
  };

  const rawEn: MultilingualTextSet = {
    headerTagline: existing?.en?.headerTagline ?? (base.headerTagline ? translateToEn(base.headerTagline) : ''),
    badgeText: existing?.en?.badgeText ?? (base.badgeText ? translateToEn(base.badgeText) : ''),
    title: existing?.en?.title ?? (base.title ? translateToEn(base.title) : ''),
    subtitle: existing?.en?.subtitle ?? (base.subtitle ? translateToEn(base.subtitle) : ''),
    validityPeriod: existing?.en?.validityPeriod ?? base.validityPeriod ?? '2026/27',
    location: existing?.en?.location ?? (base.location ? translateToEn(base.location) : ''),
    pricePrefix: existing?.en?.pricePrefix ?? (base.pricePrefix === 'DA' ? 'FROM' : base.pricePrefix === 'PREZZO' ? 'PRICE' : base.pricePrefix === 'TARIFFA' ? 'RATE' : base.pricePrefix ? translateToEn(base.pricePrefix) : ''),
    priceAmount: existing?.en?.priceAmount ?? base.priceAmount ?? '',
    priceCurrency: existing?.en?.priceCurrency ?? base.priceCurrency ?? '',
    priceSuffix: existing?.en?.priceSuffix ?? (base.priceSuffix ? translateToEn(base.priceSuffix) : ''),
    priceNote: existing?.en?.priceNote ?? (base.priceNote ? translateToEn(base.priceNote) : ''),
    featuresTitle: existing?.en?.featuresTitle ?? (base.featuresTitle ? translateToEn(base.featuresTitle) : ''),
    promoBannerTitle: existing?.en?.promoBannerTitle ?? (base.promoBannerTitle ? translateToEn(base.promoBannerTitle) : ''),
    promoBannerText: existing?.en?.promoBannerText ?? (base.promoBannerText ? translateToEn(base.promoBannerText) : ''),
    promoBannerBadge: existing?.en?.promoBannerBadge ?? (base.promoBannerBadge ? translateToEn(base.promoBannerBadge) : ''),
    ecoBannerTitle: existing?.en?.ecoBannerTitle ?? (base.ecoBannerTitle ? translateToEn(base.ecoBannerTitle) : ''),
    ecoBannerText: existing?.en?.ecoBannerText ?? (base.ecoBannerText ? translateToEn(base.ecoBannerText) : ''),
    ecoBannerTagline: existing?.en?.ecoBannerTagline ?? (base.ecoBannerTagline ? translateToEn(base.ecoBannerTagline) : ''),
    ctaText: existing?.en?.ctaText ?? (base.ctaText ? translateToEn(base.ctaText) : ''),
    addressInfo: existing?.en?.addressInfo ?? (base.addressInfo ? translateToEn(base.addressInfo) : ''),
    holderName: existing?.en?.holderName ?? base.holderName ?? 'John Doe',
    issueDate: existing?.en?.issueDate ?? base.issueDate ?? '15.12.2026',
    ticketStatus: existing?.en?.ticketStatus ?? (base.ticketStatus ? translateToEn(base.ticketStatus) : 'VALID'),
    issuerName: existing?.en?.issuerName ?? base.issuerName ?? '3 Zinnen Dolomites / Consorzio DNS',
    turnstileNote: existing?.en?.turnstileNote ?? (base.turnstileNote ? translateToEn(base.turnstileNote) : 'Gate instructions: Place the QR Code on the optical reader at the turnstiles to validate access to the trails.'),
    verificationNote: existing?.en?.verificationNote ?? (base.verificationNote ? translateToEn(base.verificationNote) : 'Scan QR code at turnstile for verification'),
    features: existing?.en?.features ?? base.features?.map(f => ({ ...f, text: translateToEn(f.text) })) ?? [],
    priceListTexts: existing?.en?.priceListTexts ?? DEFAULT_PRICE_LIST_TEXTS_EN
  };

  return {
    it: cleanTextSet(rawIt),
    de: cleanTextSet(rawDe),
    en: cleanTextSet(rawEn)
  };
}

function translateToDe(text: string): string {
  if (!text) return '';
  let res = cleanseObsoleteTerms(text);
  const replacements: [RegExp, string][] = [
    [/ONLINE TICKET • BIGLIETTO DIGITALE • ONLINE-TICKET/gi, 'DIGITAL PASS'],
    [/OFFERTA SPECIALE HOTEL PARTNER/gi, 'SONDERANGEBOT PARTNERHOTEL'],
    [/BIGLIETTO GIORNALIERO UFFICIALE/gi, 'OFFIZIELLES TAGES-TICKET'],
    [/BIGLIETTO SETTIMANALE AREA 7 GIORNI/gi, 'OFFIZIELLE AREA WOCHENKARTE 7 TAGE'],
    [/PASS CAROSELLO DOLOMITI NORDICSKI 900\+ KM/gi, 'DOLOMITI NORDICSKI KARUSSELL-PASS 900+ KM'],
    [/BIGLIETTO SETTIMANALE/gi, 'WOCHENKARTE / TICKET'],
    [/BUONO REGALO UFFICIALE/gi, 'OFFIZIELLER GUTSCHEIN'],
    [/PRICELIST & TICKETS • PREZZI & TICKET • PREISE & TICKETS/gi, 'PREISE & TICKETS'],
    [/PREZZI & INFORMAZIONI/gi, 'PREISE & INFORMATIONEN'],
    [/PRICES & INFORMATION/gi, 'PREISE & INFORMATIONEN'],
    [/Settimana Bianca Sci di Fondo & Relax/gi, 'Langlauf- & Wellnesswoche Dolomiten'],
    [/BIGLIETTO GIORNALIERO/gi, 'TAGESKARTE LANGLAUF'],
    [/SETTIMANALE DI AREA/gi, 'AREA WOCHENKARTE'],
    [/SETTIMANALE DOLOMITI NORDICSKI/gi, 'DOLOMITI NORDICSKI WOCHENKARTE'],
    [/VOUCHER ESPERIENZA SCI DI FONDO/gi, 'LANGLAUF ERLEBNIS GUTSCHEIN'],
    [/Soggiorno esclusivo in hotel con Skipass Dolomiti NordicSki incluso e servizi benessere\./gi, 'Exklusiver Hotelaufenthalt inkl. Dolomiti NordicSki Pass und Wellnessbereich.'],
    [/Valido 1 Giorno solare sulle piste da fondo dell'area selezionata/gi, 'Gültig für 1 Kalendertag auf den Langlaufloipen des gewählten Gebiets'],
    [/Valido 1 Giorno sulle piste da fondo dell'area selezionata/gi, 'Gültig für 1 Tag auf den Langlaufloipen des gewählten Gebiets'],
    [/Valido 7 Giorni consecutivi nella singola area di fondo selezionata/gi, 'Gültig für 7 aufeinanderfolgende Tage im gewählten Langlaufgebiet'],
    [/Valido 7 Giorni consecutivi su tutte le 8 Aree del Carosello Dolomiti NordicSki/gi, 'Gültig für 7 aufeinanderfolgende Tage in allen 8 Gebieten des Karussells'],
    [/Un regalo speciale per vivere la magia delle piste da fondo sulle Dolomiti UNESCO\./gi, 'Ein besonderes Geschenk für Skilanglauf auf den UNESCO-Dolomiten.'],
    [/Servizi Inclusi nel Pacchetto Hotel:/gi, 'Inkludierte Leistungen des Hotelpakets:'],
    [/Specifiche Biglietto Giornaliero:/gi, 'Spezifikationen Tages-Ticket:'],
    [/Specifiche Settimanale Singola Area:/gi, 'Spezifikationen AREA Wochenkarte:'],
    [/Specifiche Settimanale Carosello 8 Valli:/gi, 'Spezifikationen Karussell-Wochenkarte:'],
    [/SPECIFICATIONS & CONDITIONS:/gi, 'SPEZIFIKATIONEN & BEDINGUNGEN:'],
    [/Cosa comprende questo Voucher:/gi, 'Inhalt dieses Gutscheins:'],
    [/Prenota la Tua Vacanza Neve Online/gi, 'Buchen Sie Ihren Langlaufurlaub Online'],
    [/Presentare ai varchi automatici di accesso/gi, 'An den automatischen Drehkreuzen vorzeigen'],
    [/Riscatta il Tuo Voucher Online/gi, 'Gutschein Online einlösen'],
    [/Incluso Skipass Dolomiti NordicSki 3 giorni/gi, 'Inklusive 3-Tage Dolomiti NordicSki Pass'],
    [/Titolo personale non cedibile/gi, 'Persönliches nicht übertragbares Ticket'],
    [/Notti per persona/gi, 'Nächte pro Person'],
    [/Giornaliero/gi, 'Tageskarte'],
    [/Settimanale/gi, 'Wochenkarte'],
    [/Stagionale/gi, 'Saisonkarte'],
    [/\/ 7G CAROSELLO/gi, '/ 7T KARUSSELL'],
    [/\/ GIORNALIERO/gi, '/ TAGESKARTE'],
    [/\/ 7 GIORNI AREA/gi, '/ 7 TAGE GEBIET'],
    [/TARIFFA/gi, 'TARIF'],
    [/OFFERTA PACCHETTO/gi, 'PAKETANGEBOT'],
    [/Valido in tutte le 8 Valli partner • Pass con tecnologia di verifica QR/gi, 'Gültig in allen 8 Partner-Tälern • Pass mit QR-Prüftechnologie'],
    [/Titolo di viaggio personale non cedibile • Scansionare ai varchi di accesso/gi, 'Persönlicher Fahrschein, nicht übertragbar • An den Drehkreuzen scannen'],
    [/Pass personale 7 giorni per la singola area • Presentare ai varchi di controllo/gi, 'Persönlicher 7-Tage-Pass für ein einzelnes Gebiet • An den Kontrollstellen vorzeigen'],
    [/Accesso illimitato per 7 giorni consecutivi in tutte le 8 aree della rete/gi, 'Unbegrenzter Zugang für 7 aufeinanderfolgende Tage in allen 8 Gebieten'],
    [/Oltre 900 km di piste da fondo perfettamente tracciate e garanzia neve/gi, 'Über 900 km perfekt präparierte Loipen und Schneegarantie'],
    [/Uso dello Ski Bus locale compreso nelle tratte convenzionate delle 8 valli/gi, 'Nutzung der lokalen Skibusse auf den vereinbarten Strecken inklusive'],
    [/Codice seriale e QR Code per lettura automatica ai varchi e ai tornelli/gi, 'Seriennummer und QR-Code zur automatischen Erkennung an den Drehkreuzen'],
    [/Valido per 1 giornata solare nella data indicata sul ticket/gi, 'Gültig für 1 Kalendertag am auf dem Ticket angegebenen Datum'],
    [/Accesso diretto ai varchi di controllo tramite Barcode e QR Code/gi, 'Direkter Zugang an den Kontrollstellen per Barcode und QR-Code'],
    [/Titolo strettamente personale, non cedibile e non rimborsabile/gi, 'Persönliches Ticket, nicht übertragbar und nicht rückerstattbar'],
    [/Utilizzo gratuito degli Ski Bus locali della Valle Pusteria compreso/gi, 'Kostenlose Nutzung der lokalen Skibusse im Pustertal inklusive'],
    [/Valido per 7 giorni consecutivi dall'attivazione nella sola area di emissione/gi, 'Gültig für 7 aufeinanderfolgende Tage ab Aktivierung im Ausstellungsgebiet'],
    [/Accesso illimitato a tutte le piste preparate dell'area indicata/gi, 'Unbegrenzter Zugang zu allen präparierten Loipen des angegebenen Gebiets'],
    [/Codice di controllo unico e seriale stampato per la verifica ai varchi/gi, 'Eindeutiger Kontroll- und Serien-Code für die Überprüfung an den Drehkreuzen'],
    [/Servizio navetta e ski bus convenzionato della valle compreso/gi, 'Inklusive Shuttleservice und Skibus der jeweiligen Region'],
    [/8 AREE CAROSELLO \(900\+ KM PISTE\)/gi, '8 KARUSSELL-GEBIETE (900+ KM LOIPEN)'],
    [/Scansiona ai varchi di accesso/gi, 'An den Drehkreuzen scannen']
  ];
  for (const [pattern, sub] of replacements) {
    res = res.replace(pattern, sub);
  }
  return cleanseObsoleteTerms(res);
}

function translateToEn(text: string): string {
  if (!text) return '';
  let res = cleanseObsoleteTerms(text);
  const replacements: [RegExp, string][] = [
    [/ONLINE TICKET • BIGLIETTO DIGITALE • ONLINE-TICKET/gi, 'DIGITAL PASS'],
    [/OFFERTA SPECIALE HOTEL PARTNER/gi, 'SPECIAL PARTNER HOTEL OFFER'],
    [/BIGLIETTO GIORNALIERO UFFICIALE/gi, 'OFFICIAL DAILY SKI TICKET'],
    [/BIGLIETTO SETTIMANALE AREA 7 GIORNI/gi, 'OFFICIAL 7-DAY AREA WEEKLY PASS'],
    [/PASS CAROSELLO DOLOMITI NORDICSKI 900\+ KM/gi, 'DOLOMITI NORDICSKI CAROUSEL PASS 900+ KM'],
    [/BIGLIETTO SETTIMANALE/gi, 'OFFICIAL WEEKLY SKI PASS'],
    [/BUONO REGALO UFFICIALE/gi, 'OFFICIAL GIFT VOUCHER'],
    [/PRICELIST & TICKETS • PREZZI & TICKET • PREISE & TICKETS/gi, 'PRICES & TICKETS'],
    [/PREZZI & INFORMAZIONI/gi, 'PRICES & INFORMATION'],
    [/Settimana Bianca Sci di Fondo & Relax/gi, 'Cross-Country Ski & Wellness Week'],
    [/BIGLIETTO GIORNALIERO/gi, 'DAILY SKI PASS'],
    [/SETTIMANALE DI AREA/gi, 'SINGLE AREA WEEKLY PASS'],
    [/SETTIMANALE DOLOMITI NORDICSKI/gi, 'DOLOMITI NORDICSKI WEEKLY PASS'],
    [/VOUCHER ESPERIENZA SCI DI FONDO/gi, 'CROSS-COUNTRY SKI EXPERIENCE VOUCHER'],
    [/Soggiorno esclusivo in hotel con Skipass Dolomiti NordicSki incluso e servizi benessere\./gi, 'Exclusive hotel stay including Dolomiti NordicSki pass and wellness.'],
    [/Valido 1 Giorno solare sulle piste da fondo dell'area selezionata/gi, 'Valid for 1 day on cross-country trails in the selected area'],
    [/Valido 1 Giorno sulle piste da fondo dell'area selezionata/gi, 'Valid for 1 day on cross-country trails in the selected area'],
    [/Valido 7 Giorni consecutivi nella singola area di fondo selezionata/gi, 'Valid for 7 consecutive days in the selected cross-country area'],
    [/Valido 7 Giorni consecutivi su tutte le 8 Aree del Carosello Dolomiti NordicSki/gi, 'Valid for 7 consecutive days in all 8 Carousel areas'],
    [/Un regalo speciale per vivere la magia delle piste da fondo sulle Dolomiti UNESCO\./gi, 'A special gift to experience cross-country skiing in the UNESCO Dolomites.'],
    [/Servizi Inclusi nel Pacchetto Hotel:/gi, 'Services Included in the Hotel Package:'],
    [/Specifiche Biglietto Giornaliero:/gi, 'Daily Ticket Specifications:'],
    [/Specifiche Settimanale Singola Area:/gi, 'Single Area Weekly Pass Specifications:'],
    [/Specifiche Settimanale Carosello 8 Valli:/gi, 'Carousel Weekly Pass Specifications:'],
    [/SPECIFICATIONS & CONDITIONS:/gi, 'SPECIFICATIONS & CONDITIONS:'],
    [/Cosa comprende questo Voucher:/gi, 'What this Voucher includes:'],
    [/Prenota la Tua Vacanza Neve Online/gi, 'Book Your Ski Holiday Online'],
    [/Presentare ai varchi automatici di accesso/gi, 'Present at automatic access gates'],
    [/Riscatta il Tuo Voucher Online/gi, 'Redeem Your Voucher Online'],
    [/Incluso Skipass Dolomiti NordicSki 3 giorni/gi, 'Includes 3-Day Dolomiti NordicSki Pass'],
    [/Titolo personale non cedibile/gi, 'Personal non-transferable ticket'],
    [/Notti per persona/gi, 'Nights per person'],
    [/Giornaliero/gi, 'Daily Pass'],
    [/Settimanale/gi, 'Weekly Pass'],
    [/Stagionale/gi, 'Season Pass'],
    [/\/ 7G CAROSELLO/gi, '/ 7D CAROUSEL'],
    [/\/ GIORNALIERO/gi, '/ DAILY PASS'],
    [/\/ 7 GIORNI AREA/gi, '/ 7 DAYS AREA'],
    [/TARIFFA/gi, 'RATE'],
    [/OFFERTA PACCHETTO/gi, 'PACKAGE OFFER'],
    [/Valido in tutte le 8 Valli partner • Pass con tecnologia di verifica QR/gi, 'Valid in all 8 partner valleys • Pass with QR verification technology'],
    [/Titolo di viaggio personale non cedibile • Scansionare ai varchi di accesso/gi, 'Personal non-transferable ticket • Scan at access gates'],
    [/Pass personale 7 giorni per la singola area • Presentare ai varchi di controllo/gi, 'Personal 7-day pass for a single area • Present at control gates'],
    [/Accesso illimitato per 7 giorni consecutivi in tutte le 8 aree della rete/gi, 'Unlimited access for 7 consecutive days in all 8 areas'],
    [/Oltre 900 km di piste da fondo perfettamente tracciate e garanzia neve/gi, 'Over 900 km of groomed trails and snow guarantee'],
    [/Uso dello Ski Bus locale compreso nelle tratte convenzionate delle 8 valli/gi, 'Use of local ski buses included on participating valley routes'],
    [/Codice seriale e QR Code per lettura automatica ai varchi e ai tornelli/gi, 'Serial number and QR Code for automatic gate scanning'],
    [/Valido per 1 giornata solare nella data indicata sul ticket/gi, 'Valid for 1 calendar day on specified date'],
    [/Accesso diretto ai varchi di controllo tramite Barcode e QR Code/gi, 'Direct access at control gates via Barcode and QR Code'],
    [/Titolo strettamente personale, non cedibile e non rimborsabile/gi, 'Strictly personal ticket, non-transferable and non-refundable'],
    [/Utilizzo gratuito degli Ski Bus locali della Valle Pusteria compreso/gi, 'Free use of local valley ski buses included'],
    [/Valido per 7 giorni consecutivi dall'attivazione nella sola area di emissione/gi, 'Valid for 7 consecutive days from activation in issuing area only'],
    [/Accesso illimitato a tutte le piste preparate dell'area indicata/gi, 'Unlimited access to all groomed trails in indicated area'],
    [/Codice di controllo unico e seriale stampato per la verifica ai varchi/gi, 'Unique control and serial code printed for gate verification'],
    [/Servizio navetta e ski bus convenzionato della valle compreso/gi, 'Included shuttle service and valley ski bus'],
    [/8 AREE CAROSELLO \(900\+ KM PISTE\)/gi, '8 CAROUSEL AREAS (900+ KM TRAILS)'],
    [/Scansiona ai varchi di accesso/gi, 'Scan at access gates']
  ];
  for (const [pattern, sub] of replacements) {
    res = res.replace(pattern, sub);
  }
  return cleanseObsoleteTerms(res);
}

export function getContentForLanguage(content: FlyerContent, lang: LanguageCode): FlyerContent {
  const translations = getInitialTranslations(content);
  const langSet = translations[lang] || translations['it'] || {};

  const defaultPriceTexts = lang === 'de' 
    ? DEFAULT_PRICE_LIST_TEXTS_DE 
    : lang === 'en' 
    ? DEFAULT_PRICE_LIST_TEXTS_EN 
    : DEFAULT_PRICE_LIST_TEXTS_IT;

  return {
    ...content,
    activeLanguage: lang,
    translations: translations,
    headerTagline: cleanseObsoleteTerms(langSet.headerTagline ?? content.headerTagline ?? ''),
    badgeText: cleanseObsoleteTerms(langSet.badgeText ?? content.badgeText),
    title: cleanseObsoleteTerms(langSet.title ?? content.title),
    subtitle: cleanseObsoleteTerms(langSet.subtitle ?? content.subtitle),
    validityPeriod: langSet.validityPeriod ?? content.validityPeriod ?? '2026/27',
    location: langSet.location ?? content.location,
    pricePrefix: langSet.pricePrefix ?? content.pricePrefix,
    priceAmount: langSet.priceAmount ?? content.priceAmount,
    priceCurrency: langSet.priceCurrency ?? content.priceCurrency,
    priceSuffix: langSet.priceSuffix ?? content.priceSuffix,
    priceNote: cleanseObsoleteTerms(langSet.priceNote ?? content.priceNote),
    featuresTitle: cleanseObsoleteTerms(langSet.featuresTitle ?? content.featuresTitle),
    promoBannerTitle: cleanseObsoleteTerms(langSet.promoBannerTitle ?? content.promoBannerTitle),
    promoBannerText: cleanseObsoleteTerms(langSet.promoBannerText ?? content.promoBannerText),
    promoBannerBadge: cleanseObsoleteTerms(langSet.promoBannerBadge ?? content.promoBannerBadge),
    ecoBannerTitle: cleanseObsoleteTerms(langSet.ecoBannerTitle ?? content.ecoBannerTitle),
    ecoBannerText: cleanseObsoleteTerms(langSet.ecoBannerText ?? content.ecoBannerText),
    ecoBannerTagline: cleanseObsoleteTerms(langSet.ecoBannerTagline ?? content.ecoBannerTagline),
    ctaText: cleanseObsoleteTerms(langSet.ctaText ?? content.ctaText),
    addressInfo: cleanseObsoleteTerms(langSet.addressInfo ?? content.addressInfo),
    holderName: langSet.holderName ?? content.holderName ?? 'Mario Rossi',
    issueDate: langSet.issueDate ?? content.issueDate ?? '15.12.2026',
    ticketStatus: langSet.ticketStatus ?? content.ticketStatus,
    issuerName: langSet.issuerName ?? content.issuerName,
    turnstileNote: langSet.turnstileNote ?? content.turnstileNote,
    verificationNote: langSet.verificationNote ?? content.verificationNote,
    features: langSet.features ?? content.features,
    priceListTexts: {
      ...defaultPriceTexts,
      ...content.priceListTexts,
      ...langSet.priceListTexts
    }
  };
}

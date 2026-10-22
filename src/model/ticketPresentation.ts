import type { FlyerContent, RegionalLogo } from '../types';

export type TicketKind = 'weekly_dns' | 'weekly_area' | 'daily_area';
export type TicketLocale = 'de' | 'it' | 'en';

export const TICKET_LABELS: Record<TicketLocale, Record<TicketKind, string>> = {
  de: { weekly_dns: 'DNS Wochenkarte', weekly_area: 'Area Wochenkarte', daily_area: 'Area Tageskarte' },
  it: { weekly_dns: 'Settimanale DNS', weekly_area: 'Settimanale Area', daily_area: 'Giornaliero Area' },
  en: { weekly_dns: 'DNS Weekly Pass', weekly_area: 'Area Weekly Pass', daily_area: 'Area Day Pass' },
};

export const TICKET_UI: Record<TicketLocale, { valid: string; area: string; id: string; sample: string; noData: string; price: string }> = {
  de: { valid: 'Gültigkeit', area: 'Area', id: 'Ticketnummer', sample: 'MUSTER · NICHT GÜLTIG', noData: 'Wird von TicWeb ausgefüllt', price: 'Preis' },
  it: { valid: 'Validità', area: 'Area', id: 'Numero biglietto', sample: 'FACSIMILE · NON VALIDO', noData: 'Compilato da TicWeb', price: 'Prezzo' },
  en: { valid: 'Validity', area: 'Area', id: 'Ticket number', sample: 'SAMPLE · NOT VALID', noData: 'Provided by TicWeb', price: 'Price' },
};

export const TICKET_COVERAGE = {
  de: { title: 'GÜLTIGKEITSBEREICH', network: 'Alle teilnehmenden Dolomiti NordicSki Gebiete', cross: 'Auch gültig in', only: 'Gültig im angegebenen Langlaufgebiet', terms: 'ALLGEMEINE GESCHÄFTSBEDINGUNGEN', termsPending: 'Offizielle Ticketbedingungen müssen vor der Ausgabe hinterlegt werden.' },
  it: { title: 'DOVE È VALIDO', network: 'Tutte le aree aderenti a Dolomiti NordicSki', cross: 'Valido anche a', only: 'Valido nell’area di sci di fondo indicata', terms: 'CONDIZIONI GENERALI', termsPending: 'Inserire le condizioni ufficiali prima dell’emissione.' },
  en: { title: 'VALID IN', network: 'All participating Dolomiti NordicSki areas', cross: 'Also valid in', only: 'Valid in the specified cross-country area', terms: 'TERMS & CONDITIONS', termsPending: 'Official ticket terms must be provided before issuance.' },
} as const;

/** Interim agreement until the authoritative DNS Shared Data contract is available. */
const RECIPROCAL_AREAS: Record<string, string> = {
  '3_zinnen': 'Cortina d’Ampezzo',
  cortina: '3 Zinnen Dolomites',
};

export function resolveTicketPresentation(content: FlyerContent, regionLogo?: RegionalLogo) {
  const kind: TicketKind = content.digitalPassType === 'daily_area' ? 'daily_area'
    : content.digitalPassType === 'weekly_area' ? 'weekly_area' : 'weekly_dns';
  const locale: TicketLocale = content.activeLanguage === 'de' || content.activeLanguage === 'en'
    ? content.activeLanguage : 'it';
  const ui = TICKET_UI[locale];
  const isArea = kind !== 'weekly_dns';
  const areaName = content.customRegionName || regionLogo?.regionName || regionLogo?.name || ui.noData;
  const regionalMarks = [regionLogo?.logoSrc, regionLogo?.secondaryLogoSrc, content.ticketLocalLogoUrl]
    .filter((src): src is string => typeof src === 'string' && src.length > 0);
  const issuer = content.issuerName?.trim() || areaName;
  const issuerContact = [content.contactEmail, content.contactPhone, content.websiteUrl]
    .map(value => value?.trim())
    .filter((value): value is string => Boolean(value) && !/dolomitinordicski\.com/i.test(value!));
  const editorial = content.ticketContent?.enabled && [
    content.ticketContent.title, content.ticketContent.subtitle, content.ticketContent.body,
    content.ticketContent.imageUrl, content.ticketContent.qrImageUrl,
  ].some(Boolean) ? content.ticketContent : null;
  const terms = locale === 'de' ? content.priceListTexts?.disclaimerDe
    : locale === 'en' ? content.priceListTexts?.disclaimerEn : content.priceListTexts?.disclaimerIt;
  return { kind, locale, ui, isArea, areaName, regionalMarks, issuer, issuerContact, editorial, terms,
    coverage: TICKET_COVERAGE[locale],
    extraArea: isArea ? RECIPROCAL_AREAS[content.issuingAreaId || content.regionId] : undefined };
}

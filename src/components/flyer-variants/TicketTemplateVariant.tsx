import React from 'react';
import type { FlyerVariantProps } from './VariantTypes';
import dnsLogo from '../../assets/logo_farbe_2025.svg';

type TicketKind = 'weekly_dns' | 'weekly_area' | 'daily_area';
type Locale = 'de' | 'it' | 'en';

const LABELS: Record<Locale, Record<TicketKind, string>> = {
  de: { weekly_dns: 'DNS Wochenkarte', weekly_area: 'Area Wochenkarte', daily_area: 'Area Tageskarte' },
  it: { weekly_dns: 'Settimanale DNS', weekly_area: 'Settimanale Area', daily_area: 'Giornaliero Area' },
  en: { weekly_dns: 'DNS Weekly Pass', weekly_area: 'Area Weekly Pass', daily_area: 'Area Day Pass' },
};

const UI: Record<Locale, { valid: string; area: string; id: string; sample: string; noData: string; price: string }> = {
  de: { valid: 'Gültigkeit', area: 'Area', id: 'Ticketnummer', sample: 'MUSTER · NICHT GÜLTIG', noData: 'Wird von TicWeb ausgefüllt', price: 'Preis' },
  it: { valid: 'Validità', area: 'Area', id: 'Numero biglietto', sample: 'FACSIMILE · NON VALIDO', noData: 'Compilato da TicWeb', price: 'Prezzo' },
  en: { valid: 'Validity', area: 'Area', id: 'Ticket number', sample: 'SAMPLE · NOT VALID', noData: 'Provided by TicWeb', price: 'Price' },
};

const COVERAGE = {
  de: { title: 'GÜLTIGKEITSBEREICH', network: 'Alle teilnehmenden Dolomiti NordicSki Gebiete', cross: 'Auch gültig in', only: 'Gültig im angegebenen Langlaufgebiet', terms: 'ALLGEMEINE GESCHÄFTSBEDINGUNGEN', termsPending: 'Offizielle Ticketbedingungen müssen vor der Ausgabe hinterlegt werden.' },
  it: { title: 'DOVE È VALIDO', network: 'Tutte le aree aderenti a Dolomiti NordicSki', cross: 'Valido anche a', only: 'Valido nell’area di sci di fondo indicata', terms: 'CONDIZIONI GENERALI', termsPending: 'Inserire le condizioni ufficiali prima dell’emissione.' },
  en: { title: 'VALID IN', network: 'All participating Dolomiti NordicSki areas', cross: 'Also valid in', only: 'Valid in the specified cross-country area', terms: 'TERMS & CONDITIONS', termsPending: 'Official ticket terms must be provided before issuance.' },
} as const;

// Reciprocal coverage supplied by DNS. Confirm with the authoritative ticket
// validity dataset before production exports; keep future agreements data-driven.
const RECIPROCAL_AREAS: Record<string, string> = {
  '3_zinnen': 'Cortina d’Ampezzo',
  cortina: '3 Zinnen Dolomites',
};

/**
 * Graphic preview only. Ticket issuance, validation codes, tariff, and runtime
 * passenger/validity data belong to TicWeb, never to Flyer Studio.
 * Visual design follows the approved DNS Ticketvorlage, not legacy pixel fidelity.
 */
export const TicketTemplateVariant: React.FC<FlyerVariantProps> = ({ content, theme, regionLogo }) => {
  const kind: TicketKind = content.digitalPassType === 'daily_area'
    ? 'daily_area' : content.digitalPassType === 'weekly_area'
      ? 'weekly_area' : 'weekly_dns';
  const locale: Locale = content.activeLanguage === 'de' || content.activeLanguage === 'en'
    ? content.activeLanguage : 'it';
  const ui = UI[locale];
  const isArea = kind !== 'weekly_dns';
  const areaName = isArea ? (content.customRegionName || regionLogo?.regionName || regionLogo?.name || ui.noData) : 'Dolomiti NordicSki';
  // Regional tickets foreground the issuing area's official logo(s). DNS remains a network mark.
  const regionalMarks = isArea
    ? [regionLogo?.logoSrc, regionLogo?.secondaryLogoSrc].filter((src): src is string => typeof src === 'string' && src.length > 0)
    : [];
  const coverage = COVERAGE[locale];
  const extraArea = isArea ? RECIPROCAL_AREAS[content.regionId] : undefined;
  const issuer = isArea ? (content.issuerName?.trim() || areaName) : (content.issuerName?.trim() || '—');
  const contactParts = [content.contactEmail, content.contactPhone, content.websiteUrl]
    .map(value => value?.trim()).filter((value): value is string => Boolean(value) && !/dolomitinordicski\.com/i.test(value!));
  const issuerContact = isArea ? contactParts : [];
  const terms = locale === 'de' ? content.priceListTexts?.disclaimerDe
    : locale === 'en' ? content.priceListTexts?.disclaimerEn
    : content.priceListTexts?.disclaimerIt;

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden border-[6px] border-solid bg-white font-vietnam text-slate-900" style={{ borderColor: theme.primaryHex }} aria-label={LABELS[locale][kind]}>
      <header className="flex items-center justify-between gap-5 border-b-4 px-8 py-6" style={{ borderColor: theme.primaryHex }}>
        {isArea ? (
          <>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4" aria-label={areaName}>
              {regionalMarks.length > 0 ? regionalMarks.map((src, index) => (
                <img key={src + index} src={src} alt={regionalMarks.length > 1 ? `${areaName} · Logo ${index + 1}` : areaName} className="h-20 max-h-24 w-auto max-w-[46%] object-contain" />
              )) : <span className="text-xl font-bold" style={{ color: theme.primaryHex }}>{areaName}</span>}
            </div>
            <img src={dnsLogo} alt="Dolomiti NordicSki network" className="h-12 max-w-[23%] shrink-0 object-contain" />
          </>
        ) : (
          <img src={dnsLogo} alt="Dolomiti NordicSki" className="max-h-24 max-w-[72%] object-contain" />
        )}
      </header>
      <div className="flex items-center justify-between gap-4 px-8 pt-7">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.primaryHex }}>OFFICIAL SKI TICKET · WINTER {content.validityPeriod || '2026/27'}</p>
          <h1 className="mt-2 break-words text-3xl font-extrabold leading-tight" style={{ color: theme.primaryHex }}>{LABELS[locale][kind]}</h1>
          {isArea && <p className="mt-2 text-lg font-semibold">{areaName}</p>}
        </div>
      </div>
      <section className="relative mx-8 mt-6 overflow-hidden rounded-2xl border-2 shadow-sm" style={{ borderColor: theme.primaryHex }} aria-label="TicWeb runtime fields">
        <div className="flex items-center justify-between gap-3 px-6 py-4 text-white" style={{ backgroundColor: theme.primaryHex }}>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">OFFICIAL TICKET</p>
            <p className="mt-1 text-xl font-extrabold">{LABELS[locale][kind]}</p></div>
          <p className="text-right text-xs font-semibold opacity-90">WINTER {content.validityPeriod || '2026/27'}</p>
        </div>
        <div className="relative px-6 py-5">
          <div className="pointer-events-none absolute inset-0 flex -rotate-12 items-center justify-center">
            <span className="text-2xl font-black opacity-10">{ui.sample}</span>
          </div>
          <div className="relative grid grid-cols-2 gap-5">
            <div className="col-span-2 rounded-xl p-4" style={{ backgroundColor: theme.bgHex }}>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{ui.valid}</p>
              <p className="mt-1 text-xl font-black" style={{ color: theme.primaryHex }}>{ui.noData}</p>
            </div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{ui.id}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{ui.price}</p><p className="mt-1 font-semibold">{ui.noData}</p></div>
            <div className="col-span-2"><p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{ui.area}</p><p className="mt-1 font-bold">{areaName}</p></div>
          </div>
          <div className="relative mt-5 flex items-center justify-between gap-4 border-t border-dashed pt-5">
            <div className="max-w-[55%]">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.primaryHex }}>TicWeb</p>
              <p className="mt-2 text-xs leading-relaxed opacity-70">{ui.noData}</p>
            </div>
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border-2 border-dashed bg-white text-center text-xs font-bold" style={{ borderColor: theme.primaryHex, color: theme.primaryHex }}>TICWEB<br />SCAN AREA</div>
          </div>
        </div>
      </section>
      <section className="mx-8 mt-5 border-l-4 bg-slate-50 px-5 py-4" style={{ borderColor: theme.primaryHex }}>
        <h2 className="text-xs font-extrabold tracking-wider" style={{ color: theme.primaryHex }}>{coverage.title}</h2>
        <p className="mt-2 text-sm font-semibold">{isArea ? areaName : coverage.network}</p>
        {extraArea && <p className="mt-1 text-sm font-semibold">{coverage.cross} {extraArea}</p>}
        {isArea && !extraArea && <p className="mt-1 text-xs">{coverage.only}</p>}
      </section>
      <section className="mx-8 mt-4 px-1">
        <h2 className="text-xs font-extrabold tracking-wider" style={{ color: theme.primaryHex }}>{coverage.terms}</h2>
        <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-700">{terms?.trim() || coverage.termsPending}</p>
      </section>
      <footer className="mx-8 mb-7 mt-6 border-t pt-4 text-xs font-medium" style={{ borderColor: theme.accentHex }}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="font-extrabold">{issuer}</p>{issuerContact.length > 0 ? <p className="mt-1 break-words text-[11px] leading-relaxed">{issuerContact.join(' · ')}</p> : <p className="mt-1 text-[11px] opacity-70">{locale === 'de' ? 'Kontaktdaten der ausstellenden Area aus Shared Data erforderlich' : locale === 'it' ? 'Contatti dell’area emittente da Shared Data necessari' : 'Issuing area contact details required from Shared Data'}</p>}</div><span className="text-[10px]">{ui.sample}</span></div>
      </footer>
    </article>
  );
};

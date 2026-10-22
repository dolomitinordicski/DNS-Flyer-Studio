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
  const logo = isArea ? regionLogo?.logoSrc : null;
  const coverage = COVERAGE[locale];
  const extraArea = isArea ? RECIPROCAL_AREAS[content.regionId] : undefined;
  const terms = locale === 'de' ? content.priceListTexts?.disclaimerDe
    : locale === 'en' ? content.priceListTexts?.disclaimerEn
    : content.priceListTexts?.disclaimerIt;

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden border-[6px] border-solid bg-white font-vietnam text-slate-900" style={{ borderColor: theme.primaryHex }} aria-label={LABELS[locale][kind]}>
      <header className="flex items-center justify-between gap-5 border-b-4 px-8 py-6" style={{ borderColor: theme.primaryHex }}>
        <img src={dnsLogo} alt="Dolomiti NordicSki" className="max-h-20 max-w-[55%] object-contain" />
        {isArea && logo ? <img src={logo} alt={areaName} className="max-h-16 max-w-[35%] object-contain" /> : null}
      </header>
      <div className="flex items-center justify-between gap-4 px-8 pt-7">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.primaryHex }}>OFFICIAL SKI TICKET · WINTER {content.validityPeriod || '2026/27'}</p>
          <h1 className="mt-2 break-words text-3xl font-extrabold leading-tight" style={{ color: theme.primaryHex }}>{LABELS[locale][kind]}</h1>
          {isArea && <p className="mt-2 text-lg font-semibold">{areaName}</p>}
        </div>
      </div>
      <section className="relative mx-8 mt-6 flex min-h-[36%] flex-1 flex-col justify-between border-2 border-dashed p-6" style={{ borderColor: theme.primaryHex }} aria-label="TicWeb runtime fields">
        <div className="absolute inset-0 flex rotate-[-22deg] items-center justify-center overflow-hidden pointer-events-none">
          <span className="whitespace-nowrap text-3xl font-black opacity-15">{ui.sample}</span>
        </div>
        <div className="relative mb-6 flex items-center gap-2 border-b pb-3 text-sm font-black uppercase tracking-widest" style={{ borderColor: theme.accentHex, color: theme.primaryHex }}>TICKET · {LABELS[locale][kind]}</div>
        <div className="relative grid grid-cols-2 gap-x-6 gap-y-7">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.id}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.valid}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.area}</p><p className="mt-1 break-words font-semibold">{areaName}</p></div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.price}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
        </div>
        <div className="relative mt-8 flex items-end justify-between gap-4 border-t pt-6">
          <p className="max-w-[55%] text-sm leading-relaxed opacity-75">{ui.noData}</p>
          <div className="flex h-28 w-28 shrink-0 items-center justify-center border-2 border-dashed text-center text-xs font-bold" style={{ borderColor: theme.primaryHex, color: theme.primaryHex }}>
            TICWEB<br />SCAN AREA
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
        <div className="flex justify-between gap-3"><span>Dolomiti NordicSki</span><span>{ui.sample}</span></div>
      </footer>
    </article>
  );
};

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

/**
 * Graphic preview only. Ticket issuance, validation codes, tariff, and runtime
 * passenger/validity data belong to TicWeb, never to Flyer Studio.
 * Dimensions and placement must be calibrated against a verified legacy sample.
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

  return (
    <article className="relative flex h-full w-full flex-col overflow-hidden bg-white font-vietnam text-slate-900" aria-label={LABELS[locale][kind]}>
      <header className="flex items-center justify-between gap-5 border-b-4 px-8 py-6" style={{ borderColor: theme.primaryHex }}>
        <img src={dnsLogo} alt="Dolomiti NordicSki" className="max-h-20 max-w-[55%] object-contain" />
        {isArea && logo ? <img src={logo} alt={areaName} className="max-h-16 max-w-[35%] object-contain" /> : null}
      </header>
      <div className="flex items-center justify-between gap-4 px-8 pt-7">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.primaryHex }}>WINTER {content.validityPeriod || '2026/27'}</p>
          <h1 className="mt-2 break-words text-3xl font-extrabold leading-tight" style={{ color: theme.primaryHex }}>{LABELS[locale][kind]}</h1>
          {isArea && <p className="mt-2 text-lg font-semibold">{areaName}</p>}
        </div>
      </div>
      <section className="relative mx-8 mt-8 flex min-h-[36%] flex-1 flex-col justify-between border-2 p-6" style={{ borderColor: theme.primaryHex }} aria-label="TicWeb runtime fields">
        <div className="absolute inset-0 flex rotate-[-22deg] items-center justify-center overflow-hidden pointer-events-none">
          <span className="whitespace-nowrap text-3xl font-black opacity-15">{ui.sample}</span>
        </div>
        <div className="relative grid grid-cols-2 gap-x-6 gap-y-7">
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.id}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.valid}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.area}</p><p className="mt-1 break-words font-semibold">{areaName}</p></div>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase opacity-65">{ui.price}</p><p className="mt-1 break-words font-semibold">{ui.noData}</p></div>
        </div>
        <div className="relative mt-8 flex items-end justify-between gap-4 border-t pt-6">
          <p className="max-w-[55%] text-sm leading-relaxed opacity-75">{ui.noData}</p>
          <div className="flex h-28 w-28 shrink-0 items-center justify-center border-2 border-dashed text-center text-xs font-bold" style={{ borderColor: theme.primaryHex, color: theme.primaryHex }}>
            TICWEB<br />QR / BARCODE
          </div>
        </div>
      </section>
      <footer className="mx-8 mb-7 mt-6 border-t pt-4 text-xs font-medium" style={{ borderColor: theme.accentHex }}>
        <div className="flex justify-between gap-3"><span>Dolomiti NordicSki</span><span>{ui.sample}</span></div>
      </footer>
    </article>
  );
};

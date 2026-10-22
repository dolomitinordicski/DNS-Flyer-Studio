import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { REPORTING_AREAS, resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';
import { coreReportingAreaId } from '../../data/regionalLogos';
import { BlockStackRenderer } from '../blocks';
import type { FlyerVariantProps } from './VariantTypes';

type Props = FlyerVariantProps;
type Kind = 'voucher' | 'gutschein';

function documentLabels(kind: Kind, language: string) {
  const de = language === 'de';
  const en = language === 'en';
  return kind === 'gutschein'
    ? { eyebrow: de ? 'EIN BESONDERES GESCHENK' : en ? 'A SPECIAL GIFT' : 'UN REGALO SPECIALE', heading: 'GUTSCHEIN', value: de ? 'GUTSCHEINWERT' : en ? 'GIFT VALUE' : 'VALORE REGALO', validity: de ? 'GÜLTIGKEIT' : en ? 'VALIDITY' : 'VALIDITÀ' }
    : { eyebrow: de ? 'LEISTUNGSVOUCHER' : en ? 'SERVICE VOUCHER' : 'VOUCHER PRESTAZIONE', heading: 'VOUCHER', value: de ? 'LEISTUNG / WERT' : en ? 'SERVICE / VALUE' : 'PRESTAZIONE / VALORE', validity: de ? 'GÜLTIGKEIT' : en ? 'VALIDITY' : 'VALIDITÀ' };
}

/** Documents are presentation-only: a QR is shown only when explicitly provided.
 * Issuance, live codes and redemption remain in the authorized backend. */
const PremiumDocument: React.FC<Props & { kind: Kind }> = ({ kind, content, plt, theme, regionLogo, activeSportsIcons = [], visibility }) => {
  const gift = kind === 'gutschein';
  const landscape = content.orientation === 'landscape';
  const compact = content.format === 'A5';
  const language = content.activeLanguage || 'de';
  const labels = documentLabels(kind, language);
  const areaId = coreReportingAreaId(content.regionId);
  const area = REPORTING_AREAS.find(item => item.id === areaId);
  const locale = language === 'it' || language === 'en' ? language : 'de';
  const areaName = area?.localizedName[locale] || area?.canonicalName || '';
  const accent = resolveDNSRegionAccent(content.regionId) || theme.accentHex;
  const qrUrl = content.qrCode?.url?.trim();
  const showQr = visibility.qrCode !== false && content.qrCode?.enabled === true && !!qrUrl;
  const showPhoto = visibility.heroImage !== false && !!content.heroImageUrl;
  const value = [content.priceAmount, content.priceCurrency].filter(Boolean).join(' ');
  const contact = [content.contactEmail, content.contactPhone, content.websiteUrl].filter(Boolean).join(' · ');
  const shared = { content, plt, theme, regionLogo, activeSportsIcons, visibility,
    format: content.format || 'A4' as const, orientation: content.orientation || 'portrait' as const };
  const photo = showPhoto ? <figure data-premium-photo={kind} className="relative h-full min-h-0 w-full overflow-hidden bg-slate-100">
    <img className="h-full w-full object-cover" src={content.heroImageUrl} alt=""
      style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }} referrerPolicy="no-referrer" />
  </figure> : null;

  return <article data-voucher-layout={gift ? 'gutschein-premium' : 'voucher-utility'}
    className={`relative flex h-full w-full min-w-0 flex-col overflow-hidden bg-white text-slate-900 font-vietnam ${compact ? 'px-5 pt-4 pb-4' : 'px-9 pt-7 pb-6'}`}>
    {visibility.header !== false && <div className="shrink-0 border-b border-slate-200 pb-3">
      <BlockStackRenderer order={['header']} {...shared} />
    </div>}

    <div className={`flex min-h-0 flex-1 ${landscape ? 'flex-row gap-7 pt-5' : 'flex-col gap-4 pt-5'}`}>
      {showPhoto && <div className={landscape
        ? (gift ? 'min-h-0 w-[48%] shrink-0' : 'min-h-0 w-[36%] shrink-0')
        : (gift ? 'h-[36%] min-h-[110px] shrink-0' : 'h-[22%] min-h-[75px] shrink-0')}>
        {photo}
      </div>}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${gift ? 'justify-center' : 'justify-start'} ${compact ? 'gap-3' : 'gap-5'}`}>
        <div>
          <div className="mb-3 h-[3px] w-10" style={{ backgroundColor: accent }} aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.primaryHex }}>{labels.eyebrow}</p>
          <h1 className={`${compact ? 'text-3xl' : 'text-5xl'} mt-2 font-semibold uppercase leading-none tracking-tight`} style={{ color: theme.primaryHex }}>{labels.heading}</h1>
          {areaName && <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{areaName}</p>}
        </div>
        {(content.title || content.subtitle) && <div className="min-w-0">
          {content.title && <h2 className={`${compact ? 'text-base' : 'text-xl'} font-semibold leading-tight break-words`}>{content.title}</h2>}
          {content.subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">{content.subtitle}</p>}
        </div>}
        {(value || content.priceSuffix) && <div className={`border-t border-slate-200 ${compact ? 'pt-2' : 'pt-4'}`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{labels.value}</p>
          {value && <p className={`${compact ? 'text-3xl' : 'text-5xl'} mt-2 font-semibold tracking-tight`} style={{ color: theme.primaryHex }}>{value}</p>}
          {content.priceSuffix && <p className="mt-1 text-xs text-slate-500">{content.priceSuffix}</p>}
        </div>}
        {content.validityPeriod && <div className="mt-auto border-t border-slate-200 pt-3 text-[11px]">
          <span className="mr-3 font-semibold tracking-wider text-slate-500">{labels.validity}</span>
          <span className="font-medium">{content.validityPeriod}</span>
        </div>}
      </div>
    </div>
    {(visibility.footer !== false || showQr) && <footer className="mt-4 flex shrink-0 items-end justify-between gap-4 border-t border-slate-200 pt-3">
      <div className="min-w-0 flex-1">
        {visibility.footer !== false && <><p className="text-[10px] font-semibold" style={{ color: theme.primaryHex }}>Dolomiti NordicSki</p>
          {contact && <p className="mt-1 break-words text-[10px] leading-relaxed text-slate-500">{contact}</p>}
          {content.priceNote && <p className="mt-1 break-words text-[9px] leading-relaxed text-slate-500">{content.priceNote}</p>}</>}
      </div>
      {showQr && <QRCodeSVG value={qrUrl!} size={compact ? 46 : 65} fgColor={theme.primaryHex} bgColor="#FFFFFF" />}
    </footer>}
  </article>;
};

export const VoucherVariant: React.FC<Props> = props => <PremiumDocument {...props} kind="voucher" />;
export const GutscheinVariant: React.FC<Props> = props => <PremiumDocument {...props} kind="gutschein" />;

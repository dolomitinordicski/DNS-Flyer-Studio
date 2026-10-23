import { resolveDNSFlyerPhoto } from '../../data/dnsStockPhotos';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { REPORTING_AREAS, resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';
import { coreReportingAreaId } from '../../data/regionalLogos';
import { BlockStackRenderer } from '../blocks';
import type { FlyerVariantProps } from './VariantTypes';

type Props = FlyerVariantProps;
const clean = (value?: string) => (value || '').trim();

/** Print-first document layouts. No invented guest, benefit, issuer, code or entitlement. */
const PrintDocument: React.FC<Props & { gift: boolean }> = ({ gift, content, plt, theme, regionLogo, activeSportsIcons = [], visibility }) => {
  const isA5 = content.format === 'A5';
  const horizontal = content.orientation === 'landscape';
  const lang = content.activeLanguage || 'de';
  const it = lang === 'it';
  const en = lang === 'en';
  const area = REPORTING_AREAS.find(item => item.id === coreReportingAreaId(content.regionId));
  const areaName = area?.localizedName[lang] || area?.canonicalName || '';
  const accent = resolveDNSRegionAccent(content.regionId) || theme.accentHex;
  const scopeArea = gift && content.documentScope === 'area';
  const scope = scopeArea ? areaName : 'DOLOMITI NORDICSKI';
  const qr = clean(content.qrCode?.url);
  const showQr = visibility.qrCode !== false && content.qrCode?.enabled && !!qr;
  const photoUrl = resolveDNSFlyerPhoto(content.heroImageUrl, gift ? 'gift_voucher' : 'service_voucher');
  const photo = visibility.heroImage !== false && !!photoUrl;
  const services = (content.voucherServices || []).map(item => item.trim()).filter(Boolean);
  const contact = [content.contactEmail, content.contactPhone, content.websiteUrl].map(item => clean(item)).filter(Boolean).join(' · ');
  const shared = { content, plt, theme, regionLogo, activeSportsIcons, visibility,
    format: content.format || 'A4' as const, orientation: content.orientation || 'portrait' as const };
  const label = (de: string, ita: string, eng: string) => it ? ita : en ? eng : de;
  return <article data-voucher-layout={gift ? 'print-saison-gutschein' : 'print-partner-voucher'}
    className={`relative flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam text-slate-900 ${isA5 ? 'px-5 py-4' : 'px-9 py-7'}`}>
    {visibility.header !== false && <div className="shrink-0 border-b border-slate-300 pb-2">
      <BlockStackRenderer order={['header']} {...shared} />
    </div>}
    <div className={`min-h-0 flex-1 flex ${horizontal ? 'flex-row gap-7' : 'flex-col gap-4'} pt-4`}>
      {photo && <div className={horizontal ? (gift ? 'w-[44%] shrink-0 min-h-0' : 'w-[32%] shrink-0 min-h-0') : (gift ? 'h-[28%] min-h-[80px] shrink-0' : 'h-[18%] min-h-[70px] shrink-0')}>
        <img src={photoUrl} alt="" className="h-full w-full object-cover"
          style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }}
          referrerPolicy="no-referrer" />
      </div>}
      <main className="flex min-w-0 min-h-0 flex-1 flex-col">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.26em]" style={{ color: theme.primaryHex }}>{gift ? label('SAISONKARTE', 'SKIPASS STAGIONALE', 'SEASON PASS') : label('PARTNERDOKUMENT', 'DOCUMENTO PARTNER', 'PARTNER DOCUMENT')}</p>
        <h1 className={`font-black uppercase leading-[0.9] tracking-tighter ${isA5 ? 'text-5xl' : 'text-7xl'}`} style={{ color: theme.primaryHex }}>
          {gift ? 'GUTSCHEIN' : 'VOUCHER'}
        </h1>
        <div className="mt-4 h-[3px] w-14" style={{ backgroundColor: accent }} />
        {gift ? <>
          <h2 className={`mt-5 font-black uppercase leading-tight ${isA5 ? 'text-xl' : 'text-3xl'}`} style={{ color: theme.primaryHex }}>{label('SAISON-SKIPASS', 'SKIPASS STAGIONALE', 'SEASON SKIPASS')}</h2>
          {scope && <p className="mt-1 text-base font-semibold uppercase tracking-wide">{scope}</p>}
          {clean(content.holderName) && <div className="mt-auto border-b border-slate-300 pb-3 pt-5">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">{label('NAME', 'NOMINATIVO', 'HOLDER')}</p>
            <p className={`${isA5 ? 'text-xl' : 'text-3xl'} font-medium break-words`}>{content.holderName}</p>
          </div>}
        </> : <>
          {(clean(content.title) || clean(content.subtitle)) && <div className="mt-4">
            {clean(content.title) && <h2 className={`${isA5 ? 'text-lg' : 'text-2xl'} font-bold leading-tight`}>{content.title}</h2>}
            {clean(content.subtitle) && <p className="mt-2 text-xs leading-relaxed text-slate-600">{content.subtitle}</p>}
          </div>}
          {(clean(content.guestName) || clean(content.stayPeriod)) && <div className="mt-4 grid grid-cols-2 gap-4 border-y border-slate-300 py-3">
            {clean(content.guestName) && <div><p className="text-[9px] font-bold tracking-widest text-slate-500">{label('GAST', 'OSPITE', 'GUEST')}</p><p className="mt-1 text-sm font-semibold break-words">{content.guestName}</p></div>}
            {clean(content.stayPeriod) && <div><p className="text-[9px] font-bold tracking-widest text-slate-500">{label('AUFENTHALT', 'SOGGIORNO', 'STAY')}</p><p className="mt-1 text-sm font-semibold">{content.stayPeriod}</p></div>}
          </div>}
          {services.length > 0 && <div className="mt-4 min-h-0 overflow-hidden">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">{label('INKLUSIVE LEISTUNGEN', 'PRESTAZIONI INCLUSE', 'INCLUDED SERVICES')}</p>
            <ul className="space-y-1.5">{services.map((item, index) => <li key={index} className="flex gap-3 border-b border-slate-100 pb-1 text-xs"><span className="text-slate-400 tabular-nums">{String(index + 1).padStart(2, '0')}</span><span className="break-words">{item}</span></li>)}</ul>
          </div>}
          {clean(content.partnerName) && <p className="mt-auto pt-3 text-xs font-semibold">{label('PARTNER', 'STRUTTURA', 'PARTNER')}: {content.partnerName}</p>}
        </>}
      </main>
    </div>
    <footer className="mt-4 shrink-0 border-t border-slate-300 pt-3">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1 text-[10px]">
          {(gift ? clean(content.validityPeriod) : clean(content.validityPeriod)) && <p><strong>{label('GÜLTIGKEIT', 'VALIDITÀ', 'VALIDITY')}:</strong> {content.validityPeriod}</p>}
          {gift && clean(content.issueDate) && <p><strong>{label('AUSGESTELLT', 'EMESSO', 'ISSUED')}:</strong> {content.issueDate}</p>}
          {clean(content.documentCode) && <p><strong>CODE:</strong> {content.documentCode}</p>}
          {!gift && clean(content.priceNote) && <p className="text-slate-600">{content.priceNote}</p>}
          {visibility.footer !== false && contact && <p className="break-words text-slate-500">{contact}</p>}
        </div>
        {showQr && <QRCodeSVG value={qr} size={isA5 ? 44 : 64} fgColor={theme.primaryHex} bgColor="#FFFFFF" />}
      </div>
    </footer>
  </article>;
};

export const GutscheinVariant: React.FC<Props> = props => <PrintDocument {...props} gift />;
export const VoucherVariant: React.FC<Props> = props => <PrintDocument {...props} gift={false} />;

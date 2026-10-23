import { resolveDNSFlyerPhoto } from '../../data/dnsStockPhotos';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { REPORTING_AREAS, resolveDNSRegionAccent } from '@dolomitinordicski/dns-shared-data';
import { coreReportingAreaId } from '../../data/regionalLogos';
import { DolomitiFullLogo, NordicSwooshGraphic } from '../CorporateVectors';
import type { FlyerVariantProps } from './VariantTypes';

type Props = FlyerVariantProps;
const clean = (value?: string) => (value || '').trim();
const labelTitle = (lang: string, de: string, it: string, en: string) => lang === 'it' ? it : lang === 'en' ? en : de;

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
  const showAreaBrand = content.regionId !== 'dns_central' && (!gift || scopeArea);
  const areaLogo = showAreaBrand ? regionLogo?.logoSrc : undefined;
  const secondaryAreaLogo = showAreaBrand ? regionLogo?.secondaryLogoSrc : undefined;
  const scope = scopeArea ? areaName : 'DOLOMITI NORDICSKI';
  const qr = clean(content.qrCode?.url);
  const showQr = visibility.qrCode !== false && content.qrCode?.enabled && !!qr;
  const photoUrl = resolveDNSFlyerPhoto(content.heroImageUrl, gift ? 'gift_voucher' : 'service_voucher');
  const photo = visibility.heroImage !== false && !!photoUrl;
  const services = (content.voucherServices || []).map(item => item.trim()).filter(Boolean);
  const contact = [content.contactEmail, content.contactPhone, content.websiteUrl].map(item => clean(item)).filter(Boolean).join(' · ');
  const documentTitle = gift ? labelTitle(lang, 'GUTSCHEIN', 'BUONO REGALO', 'GIFT VOUCHER') : labelTitle(lang, 'VOUCHER', 'VOUCHER', 'VOUCHER');
  const label = (de: string, ita: string, eng: string) => it ? ita : en ? eng : de;
  return <article data-voucher-layout={gift ? 'print-saison-gutschein' : 'print-partner-voucher'}
    className={`relative flex h-full min-w-0 flex-col overflow-hidden bg-white font-vietnam text-slate-900 ${isA5 ? 'px-4 py-4' : 'px-7 py-6'}`}>
    {visibility.header !== false && <header className={`shrink-0 flex items-center justify-between gap-5 ${isA5 ? 'pb-3' : 'pb-5'}`}>
      <div className="shrink-0">
        <DolomitiFullLogo variant={content.logoVariant} isDarkHeader={false}
          className={isA5 ? 'h-8 w-auto max-w-[130px]' : 'h-12 w-auto max-w-[210px]'}
          customPrimary={theme.primaryHex} customAccent={theme.accentHex} cornerStyle={content.logoCornerStyle} />
      </div>
      {showAreaBrand && <div className="flex min-w-0 items-center justify-end gap-3">
        {areaLogo && <img src={areaLogo} alt={areaName || 'Area'} className={isA5 ? 'max-h-10 max-w-[105px] object-contain' : 'max-h-14 max-w-[170px] object-contain'} />}
        {secondaryAreaLogo && <img src={secondaryAreaLogo} alt={areaName || 'Area partner'} className={isA5 ? 'max-h-9 max-w-[85px] object-contain' : 'max-h-12 max-w-[120px] object-contain'} />}
        {!areaLogo && areaName && <span className="text-[10px] font-bold uppercase tracking-wide text-right" style={{color:theme.primaryHex}}>{areaName}</span>}
      </div>}
    </header>}
    <div className={`min-h-0 flex-1 flex ${horizontal ? 'flex-row gap-4' : 'flex-col gap-0'}`}>
      {photo && <div className={`relative overflow-hidden shrink-0 ${horizontal ? (gift ? 'w-[53%]' : 'w-[46%]') : (gift ? (isA5 ? 'h-[49%]' : 'h-[54%]') : (isA5 ? 'h-[43%]' : 'h-[47%]'))}`}>
        <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${content.heroImageFocusX ?? 50}% ${content.heroImageFocusY ?? 50}%` }}
          referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <div className={`absolute bottom-0 left-0 right-0 text-white ${isA5 ? 'p-5' : 'p-9'}`}>
          <div className="mb-3 h-1 w-14" style={{backgroundColor:accent}} />
          <h1 className={`font-black uppercase leading-[0.94] tracking-tighter break-words ${isA5 ? 'text-[42px]' : horizontal ? 'text-[52px]' : 'text-[82px]'}`}>{documentTitle}</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em]">{gift ? label('SAISON-SKIPASS', 'SKIPASS STAGIONALE', 'SEASON SKIPASS') : label('LEISTUNGSGUTSCHEIN', 'VOUCHER PRESTAZIONE', 'SERVICE VOUCHER')}</p>
        </div>
      </div>}
            <main className={`flex min-w-0 min-h-0 flex-1 flex-col ${horizontal ? 'pt-2' : isA5 ? 'pt-5' : 'pt-7'}`}>
        {!photo && <h1 className={`font-black uppercase leading-none tracking-tighter ${isA5 ? 'text-4xl' : 'text-6xl'}`} style={{color:theme.primaryHex}}>{documentTitle}</h1>}
                {gift ? <>
          <h2 className={`font-black uppercase leading-[1.05] tracking-tight ${isA5 ? 'text-2xl' : 'text-[42px]'} `} style={{ color: theme.primaryHex }}>{label('SAISON-SKIPASS', 'SKIPASS STAGIONALE', 'SEASON SKIPASS')}</h2>
          {scope && <p className="mt-2 text-base font-bold uppercase tracking-[0.06em]">{scope}</p>}
          {clean(content.holderName) && <div className="mt-5 border-t-2 pt-4" style={{borderColor:accent}}>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">{label('NAME', 'NOMINATIVO', 'HOLDER')}</p>
            <p className={`${isA5 ? 'text-xl' : 'text-3xl'} font-medium break-words`}>{content.holderName}</p>
          </div>}
        </> : <>
          {(clean(content.title) || clean(content.subtitle)) && <div className="mt-4">
            {clean(content.title) && <h2 className={`${isA5 ? 'text-lg' : 'text-2xl'} font-bold leading-tight`}>{content.title}</h2>}
            {clean(content.subtitle) && <p className="mt-2 text-xs leading-relaxed text-slate-600">{content.subtitle}</p>}
          </div>}
          {(clean(content.guestName) || clean(content.stayPeriod)) && <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-300 py-3">
            {clean(content.guestName) && <div><p className="text-[9px] font-bold tracking-widest text-slate-500">{label('GAST', 'OSPITE', 'GUEST')}</p><p className="mt-1 text-sm font-semibold break-words">{content.guestName}</p></div>}
            {clean(content.stayPeriod) && <div><p className="text-[9px] font-bold tracking-widest text-slate-500">{label('AUFENTHALT', 'SOGGIORNO', 'STAY')}</p><p className="mt-1 text-sm font-semibold">{content.stayPeriod}</p></div>}
          </div>}
          {services.length > 0 && <div className="mt-4 min-h-0 overflow-hidden">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">{label('INKLUSIVE LEISTUNGEN', 'PRESTAZIONI INCLUSE', 'INCLUDED SERVICES')}</p>
            <ul className="space-y-1.5">{services.map((item, index) => <li key={index} className="flex gap-3 border-b border-slate-100 pb-1 text-xs"><span className="text-slate-400 tabular-nums">{String(index + 1).padStart(2, '0')}</span><span className="break-words">{item}</span></li>)}</ul>
          </div>}
          {clean(content.partnerName) && <p className="mt-3 text-xs font-semibold">{label('PARTNER', 'STRUTTURA', 'PARTNER')}: {content.partnerName}</p>}
        </>}
      </main>
    </div>
    <footer className="relative mt-3 shrink-0 border-t-2 pt-3" style={{borderColor:theme.primaryHex}}>
      <div className="pointer-events-none absolute right-0 bottom-0 h-12 w-1/2 opacity-15" aria-hidden="true"><NordicSwooshGraphic variant="swoosh_only" color={theme.accentHex} className="h-full w-full" /></div>
      <div className="relative flex items-end justify-between gap-4">
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
